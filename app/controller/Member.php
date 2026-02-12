<?php

declare(strict_types=1);

namespace app\controller;

use app\BaseController;
use app\model\{Storage as StorageModel, Role as RoleModel, User as UserModel, Images as ImagesModel};
use think\exception\ValidateException;
use app\validate\{Page as PageValidate, User as UserValidate};
use think\{Request, Response};

class Member extends BaseController
{
    public function index(Request $request): Response
    {
        $data = $request->param();
        
        try {
            Validate(PageValidate::class)->check($data);
        } catch (ValidateException $exception) {
            return $this->create(null, $exception->getError(), 400);
        }
        
        $result = UserModel::where('email', 'like', '%' . $data['name'] . '%')
            ->order('id desc')
            ->paginate([
                'list_rows' => (int)$data['size'],
                'page'      => (int)$data['page'],
            ]);
            
        foreach ($result as $value) {
            $role = RoleModel::find($value['role_id']);
            $value['role_name'] = $role?->name;
            $value['user_size'] = ImagesModel::where('user_id', $value['id'])->sum('size');
            unset($value->password, $value->Secret_key);
        }
        
        return $this->create($result, '查询成功', 200);
    }

    public function save(Request $request): Response
    {
        $data = $request->param();
        $ip = $request->ip();
        $uid = $request->uid;
        
        try {
            Validate(UserValidate::class)->check($data);
        } catch (ValidateException $exception) {
            return $this->create(null, $exception->getError(), 400);
        }

        if (empty($data['password'])) {
            return $this->create(null, '请输入密码', 400);
        }

        if (UserModel::where("email", $data['email'])->find()) {
            return $this->create(null, '用户已存在', 400);
        }

        $userold = UserModel::onlyTrashed()->where("email", $data['email'])->find();
        
        if ($userold) {
            $userold->restore();
            $userold = UserModel::where("email", $data['email'])->find();
            $userold->role_id = $data['role_id'];
            $userold->username = $data['username'];
            $userold->phone = $data['phone'];
            $userold->password = password_hash($data['password'], PASSWORD_DEFAULT);
            $userold->capacity = $data['capacity'];
            $userold->state = $data['state'];
            $userold->save();
            $this->setLog($uid, "新增了成员", $data['email'], "ID:" . $userold['id']);
            return $this->create("", '添加成功', 200);
        }

        $user = new UserModel;
        $user->save([
            'role_id'    => $data['role_id'],
            'password'   => password_hash($data['password'], PASSWORD_DEFAULT),
            'username'   => $data['username'],
            'phone'      => $data['phone'],
            'email'      => $data['email'],
            'capacity'   => $data['capacity'],
            'Secret_key' => md5($data['email'] . mt_rand(1000, 9999)),
            'avatar'     => $data['avatar'],
            'state'      => $data['state'],
            'reg_ip'     => $ip,
        ]);
        $this->setLog($uid, "新增了成员", $data['email'], "ID:" . $user['id']);
        
        return $this->create("", '添加成功', 200);
    }

    public function update(Request $request): Response
    {
        $data = $request->param();
        $uid = $request->uid;
        
        try {
            Validate(UserValidate::class)->check($data);
        } catch (ValidateException $exception) {
            return $this->create(null, $exception->getError(), 400);
        }
        
        $user = UserModel::find($data['id']);
        $user2 = UserModel::where("email", $data['email'])->find();
        
        if ($user2 && $user2['id'] != $user['id']) {
            return $this->create(null, '此邮箱已存在', 400);
        }
        
        $role_id = $user['id'] == 1 ? $user['role_id'] : $data['role_id'];
        
        if ($data['pwd'] == 1) {
            if (empty($data['new_password'])) {
                return $this->create(null, '请输入新密码', 400);
            }
            $user->password = password_hash($data['new_password'], PASSWORD_DEFAULT);
        }
        
        $user->role_id = $role_id;
        $user->username = $data['username'];
        $user->phone = $data['phone'];
        $user->email = $data['email'];
        $user->capacity = $data['capacity'];
        $user->state = $data['state'];
        $user->save();
        $this->setLog($uid, "修改了成员信息", "", "被修改成员ID:" . $user['id']);
        
        return $this->create(null, '修改成功', 200);
    }

    public function delete(Request $request, int $id): Response
    {
        $uid = $request->uid;
        
        if ($id == 1) {
            return $this->create(null, '此账号为根管理员账号，无法删除', 400);
        }
        
        try {
            UserModel::destroy($id);
            $this->setLog($uid, "删除了成员", "", "ID:" . $id);
            return $this->create(null, '删除成功', 200);
        } catch (\Error $e) {
            return $this->create([], $e->getMessage(), 400);
        }
    }
}
