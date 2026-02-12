<?php

declare(strict_types=1);

namespace app\controller;

use app\BaseController;
use app\model\{Storage as StorageModel, Role as RoleModel, User as UserModel, Images as ImagesModel, Folder as FolderModel, System as SystemModel};
use app\services\UploadCLass;
use think\{Request, Response};

class Api extends BaseController
{
    public function upload(Request $request): Response
    {
        $key = $request->param("key");
        $folderId = (int)$request->param("folder_id", 0);
        
        if (!$key || $key === 'undefined') {
            return $this->create([], '未登陆或密钥key为空', 400);
        }

        if (strlen($key) < 32) {
            return $this->create([], '密钥格式错误', 400);
        }

        if ($_FILES["file"]["error"] > 0) {
            return $this->create([], '上传出错', 400);
        }
        
        $max_size = SystemModel::where('key', "upload_max")->value("value");
        if ($_FILES["file"]['size'] > $max_size * 1024 * 1024) {
            return $this->create(null, '图片大小超出限制', 400);
        }
        
        $user = UserModel::where("Secret_key", $key)->find();
        if (!$user || $user['state'] == 0) {
            return $this->create(null, '用户不存在或被停用', 400);
        }

        if ($folderId > 0) {
            $folder = FolderModel::where('id', $folderId)->where('user_id', $user['id'])->find();
            if (!$folder) {
                return $this->create(null, '目录不存在或无权限', 400);
            }
        }

        $allSize = ImagesModel::where('user_id', $user['id'])->sum('size');
        if ($allSize + $_FILES["file"]['size'] > $user['capacity']) {
            return $this->create(null, '您的存储配额不足', 400);
        }

        $role = RoleModel::find($user['role_id']);
        $uploadClass = new UploadCLass;

        $validation = $uploadClass->validateFile($_FILES["file"]);
        if (!$validation['valid']) {
            return $this->create(null, $validation['msg'], 400);
        }

        $imageSize = @getimagesize($_FILES["file"]['tmp_name']);
        $width = $imageSize ? (int)$imageSize[0] : 0;
        $height = $imageSize ? (int)$imageSize[1] : 0;

        $result = $uploadClass->create($_FILES["file"], $role['storage_id']);
        
        if ($result['state'] != 1) {
            return $this->create(null, $result['msg'], 400);
        }

        $img = new ImagesModel;
        $img->save([
            'user_id'    => $user['id'],
            'storage_id' => $role['storage_id'],
            'folder_id'  => $folderId,
            'name'       => $result['name'],
            'size'       => $_FILES["file"]['size'],
            'width'      => $width,
            'height'     => $height,
            'path'       => $result['path'],
            'mime'       => $_FILES["file"]['type'],
            'url'        => $result['url'],
            'ip'         => $request->ip(),
        ]);
        $this->setLog($user['id'], "上传了图片", "ID:" . $img['id'], $img['name'], 2);
        
        return $this->create($img, '成功', 200);
    }

    public function random(Request $request): Response|null
    {
        $folderId = (int)$request->param("folder_id", 0);
        $type = $request->param("type", "redirect");
        $orientation = $request->param("orientation", "auto");

        if ($folderId <= 0) {
            return $this->create(null, '请指定目录ID', 400);
        }

        $folder = FolderModel::where('id', $folderId)->where('is_public', 1)->find();
        if (!$folder) {
            return $this->create(null, '目录不存在或未开放', 400);
        }

        $wantVertical = match($orientation) {
            'vertical'   => true,
            'horizontal' => false,
            default      => (bool)preg_match('/Mobile|Android|iPhone|iPod|Windows Phone/i', $request->header('user-agent', ''))
        };

        $query = ImagesModel::where('folder_id', $folderId);
        $image = $wantVertical
            ? (clone $query)->whereRaw('height > width')->orderRaw('RAND()')->find()
            : (clone $query)->whereRaw('width >= height')->orderRaw('RAND()')->find();

        if (!$image) {
            $image = $query->orderRaw('RAND()')->find();
        }

        if (!$image) {
            return $this->create(null, '目录下没有图片', 400);
        }

        if ($type === 'json') {
            return $this->create(['url' => $image['url']], '成功', 200);
        }

        header('Location: ' . $image['url']);
        exit;
    }

    public function delete(Request $request): Response
    {
        $id = $request->param("id");
        $key = $request->param("key");
        
        if (!$key || $key === 'undefined') {
            return $this->create([], '密钥key为空', 400);
        }
        
        if (!$id) {
            return $this->create([], '图片id为空', 400);
        }
        
        $user = UserModel::where("Secret_key", $key)->find();
        if (!$user || $user['state'] == 0) {
            return $this->create(null, '用户不存在或被停用', 400);
        }
        
        $role = RoleModel::find($user['role_id']);
        $imgs = ImagesModel::find($id);
        $uid = $user['id'];

        $canDelete = match(true) {
            $role?->is_admin == 1 => true,
            $role?->is_del_own == 1 && $imgs['user_id'] == $uid => true,
            $role?->is_del_all == 1 && $imgs['storage_id'] == $role->storage_id => true,
            default => false
        };

        if (!$canDelete) {
            return $this->create('当前角色组没有删除权限', '删除失败', 400);
        }

        (new UploadCLass)->delete($imgs["path"], $imgs['storage_id']);
        $name = $imgs['name'];
        $imgs->delete();
        $this->setLog($uid, "删除了图片", "ID:" . $id, $name, 2);
        
        return $this->create($name, '删除成功', 200);
    }
}
