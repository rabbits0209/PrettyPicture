<?php

declare(strict_types=1);

namespace app\controller;

use app\BaseController;
use app\model\{User as UserModel, Code as CodeModel, System as SystemModel, Role as RoleModel};
use think\Exception;
use app\services\{AuthToken, EmailClass};
use think\{Request, Response};
use think\facade\Validate;
use app\validate\Register as RegisterValidate;
use think\exception\ValidateException;

class Account extends BaseController
{
    public function login(Request $request): Response
    {
        $data = $request->param();
        $ip = $request->ip();

        try {
            $user = UserModel::login($data['username'], $data['password']);
            $token = (new AuthToken)->createToken($user['id']);
            $this->setLog($user['id'], "登录了系统", $this->city($ip), $ip);
            return $this->create($token, '登录成功', 200);
        } catch (Exception $e) {
            return $this->create([], $e->getMessage(), 400);
        }
    }

    public function register(Request $request): Response
    {
        $data = $request->param();
        $ip = $request->ip();
        $system = SystemModel::where('type', 'basics')->column('value', 'key');
        
        if ($system['is_reg'] != 1) {
            return $this->create(null, '管理员已关闭用户注册', 400);
        }

        $needEmailVerify = isset($system['reg_email_verify']) && $system['reg_email_verify'] == 1;

        try {
            $validator = Validate(RegisterValidate::class);
            if (!$needEmailVerify) {
                $validator->remove('code', 'require');
            }
            $validator->check($data);
        } catch (ValidateException $exception) {
            return $this->create(null, $exception->getError(), 400);
        }

        if ($needEmailVerify) {
            $res = CodeModel::where('email', $data['email'])
                ->where('code', $data['code'])
                ->where('create_time', '>', time() - 600)
                ->find();
            if (!$res) {
                return $this->create(null, '验证码错误', 400);
            }
        }

        if (UserModel::where("email", $data['email'])->find()) {
            return $this->create(null, '用户已存在', 400);
        }

        $role = RoleModel::where('default', 1)->find();
        $userold = UserModel::onlyTrashed()->where("email", $data['email'])->find();
        
        if ($userold) {
            $userold->restore();
            $userold = UserModel::where("email", $data['email'])->find();
            $userold->role_id = $role['id'];
            $userold->password = password_hash($data['password'], PASSWORD_DEFAULT);
            $userold->username = $data['username'];
            $userold->email = $data['email'];
            $userold->Secret_key = md5($data['email'] . $data['password']);
            $userold->avatar = $data['avatar'] ?? '';
            $userold->capacity = (int)$system['init_quota'] * 1024 * 1024 * 1024;
            $userold->state = 1;
            $userold->reg_ip = $ip;
            $userold->save();
            $this->setLog($userold['id'], "(注册)加入了系统", $this->city($ip), $ip);
        } else {
            $user = new UserModel;
            $user->save([
                'role_id'    => $role['id'],
                'password'   => password_hash($data['password'], PASSWORD_DEFAULT),
                'username'   => $data['username'],
                'email'      => $data['email'],
                'Secret_key' => md5($data['email'] . $data['password']),
                'avatar'     => $data['avatar'] ?? '',
                'capacity'   => (int)$system['init_quota'] * 1024 * 1024 * 1024,
                'state'      => 1,
                'reg_ip'     => $ip,
            ]);
            $this->setLog($user['id'], "(注册)加入了系统", $this->city($ip), $ip);
        }
        
        return $this->create(null, '注册成功', 200);
    }

    public function forget(Request $request): Response
    {
        $data = $request->param();

        $res = CodeModel::where('email', $data['email'])
            ->where('code', $data['code'])
            ->where('create_time', '>', time() - 600)
            ->find();
            
        if (!$res) {
            return $this->create(null, '验证码错误', 400);
        }

        if (!$this->cellemail($data['email'])) {
            return $this->create(null, '用户不存在', 400);
        }

        if (empty($data['password']) || strlen($data['password']) < 6) {
            return $this->create(null, '密码至少6位', 400);
        }

        $user = UserModel::where('email', $data['email'])->find();
        $user->password = password_hash($data['password'], PASSWORD_DEFAULT);
        $user->save();

        return $this->create(null, '密码重置成功', 200);
    }

    public function cellemail(string $email = ""): bool
    {
        return !Validate::rule(['email' => 'unique:user,email'])->check(['email' => $email]);
    }

    public function sendCode(Request $request): Response
    {
        $data = $request->param();
        $ip = $request->ip();
        
        if (!preg_match('/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/', $data['email'])) {
            return $this->create(null, '请输入正确的邮箱', 400);
        }

        $code_q = CodeModel::where('email', $data['email'])->order('id desc')->find();
        if ($code_q && (time() - (int)$code_q['create_time']) < 60) {
            return $this->create(null, '发送频繁', 400);
        }

        $code = mt_rand(1000, 9999);

        try {
            (new EmailClass)->send_mail($data['email'], "PrettyPicture验证", '您的验证码为：' . $code);
            (new CodeModel)->save([
                'email' => $data['email'],
                'code'  => $code,
                'ip'    => $ip
            ]);
            return $this->create([], '发送成功', 200);
        } catch (Exception $e) {
            return $this->create([], $e->getMessage(), 400);
        }
    }
}
