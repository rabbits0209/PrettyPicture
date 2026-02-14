<?php

declare(strict_types=1);

namespace app\controller;

use app\BaseController;
use app\model\{Storage as StorageModel, Images as ImagesModel, User as UserModel, Role as RoleModel, Folder as FolderModel};
use app\services\UploadCLass;
use think\exception\ValidateException;
use app\validate\Page as PageValidate;
use think\{Request, Response};

class Images extends BaseController
{
    public function index(Request $request): Response
    {
        $data = $request->param();
        $uid = $request->uid;
        $data['uid'] = $uid;
        $folderId = (int)($data['folder_id'] ?? -1);
        
        try {
            Validate(PageValidate::class)->check($data);
        } catch (ValidateException $exception) {
            return $this->create(null, $exception->getError(), 400);
        }
        
        $query = ImagesModel::where('name', 'like', '%' . $data['name'] . '%');
        
        if ($folderId >= 0) {
            $query = $query->where('folder_id', $folderId);
        }
        
        $paginateConfig = [
            'list_rows' => (int)$data['size'],
            'page'      => (int)$data['page'],
        ];

        $result = match((int)$data['type']) {
            1 => $query->where('user_id', $uid)->order('id desc')->paginate($paginateConfig),
            default => $this->getImagesByRole($query, $uid, $paginateConfig)
        };

        foreach ($result as $value) {
            $user = UserModel::find($value['user_id']);
            $value['user_email'] = $user?->email ?? '';
            $value['user_name'] = $user?->username ?? '';
            
            $value['folder_name'] = match(true) {
                $value['folder_id'] > 0 => FolderModel::find($value['folder_id'])?->name ?? '未知目录',
                default => '默认'
            };
        }
        
        return $this->create($result, '查询成功', 200);
    }

    private function getImagesByRole(mixed $query, int $uid, array $paginateConfig): mixed
    {
        $userInfo = UserModel::find($uid);
        $role = RoleModel::find($userInfo?->role_id);
        
        return match(true) {
            $role?->is_admin == 1 || $role?->is_read_all == 1 
                => $query->order('id desc')->paginate($paginateConfig),
            $role?->is_read == 1 
                => $query->where('storage_id', $role->storage_id)->order('id desc')->paginate($paginateConfig),
            default 
                => $query->where('user_id', $uid)->order('id desc')->paginate($paginateConfig)
        };
    }

    public function delete(Request $request, int $id): Response
    {
        $uid = $request->uid;
        $userInfo = UserModel::find($uid);
        $role = RoleModel::find($userInfo?->role_id);
        $imgs = ImagesModel::find($id);
        
        if (!$imgs) {
            return $this->create(null, '图片不存在', 400);
        }

        $canDelete = match(true) {
            $role?->is_admin == 1 => true,
            $role?->is_del_own == 1 && $imgs->user_id == $uid => true,
            $role?->is_del_all == 1 && $imgs->storage_id == $role->storage_id => true,
            default => false
        };

        if (!$canDelete) {
            return $this->create('当前角色组没有删除权限', '删除失败', 400);
        }

        (new UploadCLass)->delete($imgs->path, $imgs->storage_id);
        $name = $imgs->name;
        $imgs->delete();
        $this->setLog($uid, "删除了图片", "ID:" . $id, $name, 2);
        
        return $this->create($name, '删除成功', 200);
    }

    public function move(Request $request): Response
    {
        $uid = $request->uid;
        $data = $request->param();
        
        if (!isset($data['ids']) || !is_array($data['ids']) || empty($data['ids'])) {
            return $this->create(null, '请选择要移动的图片', 400);
        }
        
        $folderId = isset($data['folder_id']) ? (int)$data['folder_id'] : 0;
        
        // 验证目标目录（0表示默认目录）
        if ($folderId > 0) {
            $folder = FolderModel::where('id', $folderId)->where('user_id', $uid)->find();
            if (!$folder) {
                return $this->create(null, '目标目录不存在', 400);
            }
        }
        
        $userInfo = UserModel::find($uid);
        $role = RoleModel::find($userInfo?->role_id);
        
        $successCount = 0;
        foreach ($data['ids'] as $id) {
            $img = ImagesModel::find($id);
            if (!$img) continue;
            
            // 检查权限：只能移动自己的图片，或者管理员可以移动所有
            $canMove = $role?->is_admin == 1 || $img->user_id == $uid;
            if (!$canMove) continue;
            
            $img->folder_id = $folderId;
            $img->save();
            $successCount++;
        }
        
        if ($successCount === 0) {
            return $this->create(null, '没有可移动的图片', 400);
        }
        
        $folderName = $folderId > 0 ? FolderModel::find($folderId)?->name : '默认目录';
        $this->setLog($uid, "移动了{$successCount}张图片到目录", $folderName, "");
        
        return $this->create(['count' => $successCount], "成功移动{$successCount}张图片", 200);
    }
}
