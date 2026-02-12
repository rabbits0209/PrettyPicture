<?php

declare(strict_types=1);

namespace app\middleware;

use app\BaseController;
use app\model\{Role as RoleModel, User as UserModel};
use think\Response;

class AuthVerify extends BaseController
{
    public function handle($request, \Closure $next): Response|string
    {
        $uid = $request->uid;
        
        $roleId = UserModel::where('id', $uid)->value('role_id');
        $isAdmin = RoleModel::find($roleId)?->is_admin ?? 0;
        
        if ($isAdmin != 1) {
            return $this->create([], '您没有操作权限', 400);
        }
        
        return $next($request);
    }
}
