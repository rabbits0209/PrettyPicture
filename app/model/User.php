<?php

declare(strict_types=1);

namespace app\model;

use think\Exception;
use think\model\concern\SoftDelete;
use think\Model;

class User extends Model
{
    use SoftDelete;

    public static function login(string $username, string $password): static
    {
        if (empty($username)) {
            throw new Exception('请输入邮箱');
        }

        if (empty($password)) {
            throw new Exception('请输入密码');
        }

        $user = self::where('email', $username)->find();
        
        return match(true) {
            $user === null => throw new Exception('用户不存在'),
            !password_verify($password, $user->password) => throw new Exception('密码不正确'),
            $user->state === 0 => throw new Exception('你的账户已被停用，请联系管理员！'),
            default => $user
        };
    }
}
