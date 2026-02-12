<?php

declare(strict_types=1);

namespace app\controller;

use app\BaseController;
use app\model\{Storage as StorageModel, Role as RoleModel, Images as ImagesModel};
use app\enums\StorageType;
use think\exception\ValidateException;
use app\validate\Page as PageValidate;
use think\{Request, Response};

class Storage extends BaseController
{
    public function index(Request $request): Response
    {
        $data = $request->param();
        
        try {
            Validate(PageValidate::class)->check($data);
        } catch (ValidateException $exception) {
            return $this->create(null, $exception->getError(), 400);
        }
        
        $result = StorageModel::order('id desc')->paginate([
            'list_rows' => (int)$data['size'],
            'page'      => (int)$data['page'],
        ]);

        foreach ($result as $value) {
            $value['imgCount'] = ImagesModel::where('storage_id', $value['id'])->count();
            $value['imgSize'] = ImagesModel::where('storage_id', $value['id'])->sum('size');
        }
      
        return $this->create($result, '查询成功', 200);
    }

    public function save(Request $request): Response
    {
        $uid = $request->uid;
        $data = $request->param();
        
        if (StorageModel::where("name", $data['name'])->find()) {
            return $this->create([], '桶名称已存在', 400);
        }
        
        if ($data['type'] === 'local' && StorageModel::where("type", "local")->count() > 1) {
            return $this->create([], '本地桶仅支持添加一个', 400);
        }
        
        $id = StorageModel::create($data)->getData('id');
        $this->setLog($uid, "新增了存储桶", $data['name'], "ID:" . $id);
        
        return $this->create(null, $id ? '添加成功' : '添加失败', $id ? 200 : 400);
    }

    public function update(Request $request): Response
    {
        $uid = $request->uid;
        $data = $request->param();
        $id = StorageModel::update($data)->getData('id');
        $this->setLog($uid, "修改了存储桶", $data['name'], "ID:" . $id);
        
        return $this->create(null, $id ? '修改成功' : '修改失败', $id ? 200 : 400);
    }

    public function delete(Request $request, int $id): Response
    {
        $uid = $request->uid;
        
        try {
            StorageModel::destroy($id);
            $roles = RoleModel::where("storage_id", $id)->select();
            foreach ($roles as $role) {
                $role->storage_id = 0;
                $role->save();
            }
            $this->setLog($uid, "删除了存储桶", "", "ID:" . $id);
            return $this->create(null, '删除成功', 200);
        } catch (\Error $e) {
            return $this->create([], $e->getMessage(), 400);
        }
    }

    public function type(): Response
    {
        return $this->create(StorageType::labels(), '成功', 200);
    }
}
