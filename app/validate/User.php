<?php

declare(strict_types=1);

namespace app\validate;

use think\Validate;

class User extends Validate
{
    protected $rule = [
        'username|用户名' => 'require|length:3,8',
        'email|邮箱'   => 'require|/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/',
        'capacity|配额' => 'require',
    ];
}
