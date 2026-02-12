<?php

declare(strict_types=1);

namespace app\validate;

use think\Validate;

class ResetPwd extends Validate
{
    protected $rule = [
        'oldPwd|当前密码' => 'require',
        'newPwd|新密码'   => 'require|/^[a-zA-Z0-9]{6,10}$/',
    ];
}
