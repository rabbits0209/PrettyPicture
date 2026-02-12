<?php

declare(strict_types=1);

namespace app\model;

use think\Exception;
use think\Model;

class Role extends Model
{
    public static function toClear(int $default): void
    {
        if ($default === 1) {
            $role = self::where('default', 1)->find();
            if ($role) {
                $role->default = 0;
                $role->save();
            }
        }
    }

    public static function isDel(int $id): void
    {
        $role = self::find($id);
        if ($role?->default === 1) {
            throw new Exception('至少需保留一个默认角色组');
        }
    }
}
