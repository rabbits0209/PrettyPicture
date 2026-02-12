<?php

declare(strict_types=1);

namespace app\validate;

use think\Validate;

class Register extends Validate
{
    protected $rule = [
        'username|用户名' => 'require|length:3,8',
        'email|邮箱'    => 'require|/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/',
        'password|密码' => 'require|length:6,20',
        'code|验证码'   => 'require',
    ];
}
