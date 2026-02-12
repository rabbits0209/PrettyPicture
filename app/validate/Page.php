<?php

declare(strict_types=1);

namespace app\validate;

use think\Validate;

class Page extends Validate
{
    protected $rule = [
        'page|页码'     => 'require|number|min:1',
        'size|每页数量' => 'require|number|min:1',
    ];
}
