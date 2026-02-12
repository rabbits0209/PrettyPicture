<?php

declare(strict_types=1);

namespace app\controller;

use app\BaseController;
use app\model\{Storage as StorageModel, Role as RoleModel, User as UserModel};
use think\exception\ValidateException;
use app\validate\Page as PageValidate;
use think\{Exception, Request, Response};

class Role extends BaseController
{
    public function index(Request $request): Response
    {
        $data = $request->param();
        
        try {
            Validate(PageValidate::class)->check($data);
        } catch (ValidateException $exception) {
            return $this->create(null, $exception->getError(), 400);
        }
        
        $result = RoleModel::where('name', 'like', '%' . $data['name'] . '%')
            ->order('id desc')
            ->paginate([
                'list_rows' => (int)$data['size'],
                'page'      => (int)$data['page'],
            ]);
        
        $list = $result->toArray();
        foreach ($list['data'] as &$value) {
            $storage = StorageModel::find($value['storage_id']);
            $value['storage_name'] = $value['storage_id'] == 0 ? '存储桶不存在' : ($storage['name'] ?? '存储桶不存在');
            $value['user_num'] = UserModel::where('role_id', $value['id'])->count();
        }
        
        return $this->create($list, '查询成功', 200);
    }

    public function save(Request $request): Response
    {
        $uid = $request->uid;
        $data = $request->param();
        RoleModel::toClear($data['default']);
        $id = RoleModel::create($data)->getData('id');
        $this->setLog($uid, "新增了角色组", $data['name'], "ID:" . $id);
        
        return $this->create(null, $id ? '添加成功' : '添加失败', $id ? 200 : 400);
    }

    public function update(Request $request): Response
    {
        $uid = $request->uid;
        $data = $request->param();
        
        if ($data['default'] == 1) {
            RoleModel::toClear($data['default']);
        }
        
        if ($data['default'] == 0) {
            return $this->create(null, '至少需保留一个默认角色组', 400);
        }
        
        $id = RoleModel::update($data)->getData('id');
        $this->setLog($uid, "修改了角色组", $data['name'], "ID:" . $id);
        
        return $this->create(null, $id ? '修改成功' : '修改失败', $id ? 200 : 400);
    }

    public function delete(Request $request, int $id): Response
    {
        $uid = $request->uid;
        
        if ($id == 1) {
            return $this->create(null, '此账号为根管理员分组，无法删除', 400);
        }
        
        try {
            RoleModel::isDel($id);
            RoleModel::destroy($id);
            $defaultId = RoleModel::where('default', 1)->value('id');
            $userList = UserModel::where("role_id", $id)->select();
            
            foreach ($userList as $value) {
                $user = UserModel::find($value['id']);
                $user->role_id = $defaultId;
                $user->save();
            }
            
            $this->setLog($uid, "删除了角色组", "", "ID:" . $id);
            return $this->create(null, '删除成功', 200);
        } catch (Exception $e) {
            return $this->create([], $e->getMessage(), 400);
        }
    }
}
