<?php

declare(strict_types=1);

namespace app\controller;

use app\BaseController;
use app\model\{Folder as FolderModel, Images as ImagesModel};
use think\{Request, Response};

class Folder extends BaseController
{
    public function index(Request $request): Response
    {
        $uid = $request->uid;
        $folders = FolderModel::getUserFolders($uid);
        return $this->create($folders, '查询成功', 200);
    }

    public function save(Request $request): Response
    {
        $uid = $request->uid;
        $data = $request->param();
        
        if (empty($data['name'])) {
            return $this->create(null, '目录名称不能为空', 400);
        }

        if (FolderModel::where('user_id', $uid)->where('name', $data['name'])->find()) {
            return $this->create(null, '目录名称已存在', 400);
        }

        $folder = new FolderModel;
        $folder->save([
            'user_id'   => $uid,
            'name'      => $data['name'],
            'is_public' => 0,
        ]);

        $this->setLog($uid, "创建了目录", "ID:" . $folder->id, $data['name']);
        return $this->create($folder, '创建成功', 200);
    }

    public function update(Request $request): Response
    {
        $uid = $request->uid;
        $data = $request->param();

        if (empty($data['id'])) {
            return $this->create(null, '目录ID不能为空', 400);
        }

        $folder = FolderModel::where('id', $data['id'])->where('user_id', $uid)->find();

        if (!$folder) {
            return $this->create(null, '目录不存在', 400);
        }

        if (isset($data['name']) && $data['name'] !== $folder->name) {
            if (FolderModel::where('user_id', $uid)->where('name', $data['name'])->where('id', '<>', $data['id'])->find()) {
                return $this->create(null, '目录名称已存在', 400);
            }
            $folder->name = $data['name'];
        }

        if (isset($data['is_public'])) {
            $folder->is_public = (int)$data['is_public'];
        }

        $folder->save();
        $this->setLog($uid, "更新了目录", "ID:" . $folder->id, $folder->name);
        return $this->create($folder, '更新成功', 200);
    }

    public function delete(Request $request): Response
    {
        $uid = $request->uid;
        $id = $request->param('id');

        $folder = FolderModel::where('id', $id)->where('user_id', $uid)->find();

        if (!$folder) {
            return $this->create(null, '目录不存在', 400);
        }

        $imgCount = ImagesModel::where('folder_id', $id)->count();
        if ($imgCount > 0) {
            return $this->create(null, '目录下还有' . $imgCount . '张图片，请先移动或删除', 400);
        }

        $name = $folder->name;
        $folder->delete();
        $this->setLog($uid, "删除了目录", "ID:" . $id, $name);
        return $this->create(null, '删除成功', 200);
    }
}
