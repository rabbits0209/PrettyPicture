<?php

declare(strict_types=1);

namespace app\model;

use think\Model;
use think\Collection;

class Folder extends Model
{
    public static function getUserFolders(int $userId): Collection
    {
        return self::where('user_id', $userId)->order('id desc')->select();
    }
}
