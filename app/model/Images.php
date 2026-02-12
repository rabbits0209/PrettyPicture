<?php

declare(strict_types=1);

namespace app\model;

use think\Model;
use think\Exception;

class Images extends Model
{
    public static function getImgs(array $role, array $data): mixed
    {
        $query = self::where('name', 'like', '%' . $data['name'] . '%');
        $paginateConfig = [
            'list_rows' => (int)$data['size'],
            'page'      => (int)$data['page'],
        ];

        return match(true) {
            $role['is_admin'] == 1 || $role['is_read_all'] == 1 
                => $query->order('id desc')->paginate($paginateConfig),
            $role['is_read'] == 1 
                => $query->where('storage_id', $role['storage_id'])->order('id desc')->paginate($paginateConfig),
            default 
                => $query->where('user_id', $data['uid'])->order('id desc')->paginate($paginateConfig)
        };
    }

    public static function delImgs(int $id): void
    {
        try {
            self::destroy($id);
        } catch (\Error $e) {
            throw new Exception($e->getMessage());
        }
    }
}
