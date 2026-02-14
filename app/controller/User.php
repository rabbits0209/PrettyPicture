<?php

declare(strict_types=1);

namespace app\controller;

use app\BaseController;
use app\model\{User as UserModel, Role as RoleModel, Log as LogModel, Images as ImagesModel, Storage as StorageModel};
use app\validate\ResetPwd as ResetPwdValidate;
use think\exception\ValidateException;
use think\{Request, Response};

class User extends BaseController
{
    // 头像允许的类型和最大大小
    private const AVATAR_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    private const AVATAR_ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    private const AVATAR_MAX_SIZE = 5 * 1024 * 1024; // 5MB
    public function info(Request $request): Response
    {
        $uid = $request->uid;
        $url = $request->host();
        $scheme = $request->scheme();
        $user = UserModel::find($uid);
        $role = RoleModel::find($user?->role_id);
        
        $user['role'] = [
            "is_add"      => $role?->is_add,
            "is_admin"    => $role?->is_admin,
            "is_del_all"  => $role?->is_del_all,
            "is_del_own"  => $role?->is_del_own,
            "is_read"     => $role?->is_read,
            "is_read_all" => $role?->is_read_all,
            "name"        => $role?->name
        ];
        $user['scheme'] = $scheme;
        $user['url'] = $url;
        $user['capacity'] = (int)$user['capacity'];
        $user['user_size'] = ImagesModel::where('user_id', $uid)->sum('size');
        unset($user['password'], $user['role_id']);
        
        return $this->create($user, '查询成功', 200);
    }

    public function resetPwd(Request $request): Response
    {
        $uid = $request->uid;
        $data = $request->param();
        
        try {
            Validate(ResetPwdValidate::class)->check($data);
        } catch (ValidateException $exception) {
            return $this->create(null, $exception->getError(), 400);
        }
        
        $user = UserModel::find($uid);
        if (!password_verify($data['oldPwd'], $user['password'])) {
            return $this->create([], '当前密码不正确', 400);
        }
        
        $user->password = password_hash($data['newPwd'], PASSWORD_DEFAULT);
        $user->save();
        
        return $this->create([], '修改成功', 200);
    }

    public function resetKey(Request $request): Response
    {
        $uid = $request->uid;
        $user = UserModel::find($uid);
        $user->Secret_key = sha1($user['email'] . mt_rand(1000000, 99999999));
        $user->save();
        
        return $this->create(null, '重置成功', 200);
    }

    public function update(Request $request): Response
    {
        $uid = $request->uid;
        $data = $request->param();
        $user = UserModel::find($uid);
        
        // 头像只能通过 uploadAvatar 接口更新，这里忽略 avatar 字段
        if (isset($data['username'])) {
            $len = mb_strlen($data['username']);
            if ($len < 3 || $len > 8) {
                return $this->create(null, '用户名长度必须在3-8个字符之间', 400);
            }
            $user->username = $data['username'];
        }
        if (isset($data['phone'])) {
            $user->phone = $data['phone'];
        }
        $user->save();
        
        return $this->create([], '修改成功', 200);
    }

    public function uploadAvatar(Request $request): Response
    {
        $uid = $request->uid;
        
        if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
            return $this->create(null, '请选择头像文件', 400);
        }

        $file = $_FILES['avatar'];
        
        // 1. 检查文件大小
        if ($file['size'] > self::AVATAR_MAX_SIZE) {
            return $this->create(null, '头像文件不能超过5MB', 400);
        }

        // 2. 检查MIME类型（通过文件内容检测，而非客户端提供的type）
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $realMimeType = $finfo->file($file['tmp_name']);
        if (!in_array($realMimeType, self::AVATAR_ALLOWED_TYPES)) {
            return $this->create(null, '不支持的图片格式，仅支持 jpg/png/gif/webp', 400);
        }

        // 3. 检查文件扩展名
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, self::AVATAR_ALLOWED_EXTS)) {
            return $this->create(null, '不支持的文件扩展名', 400);
        }

        // 4. 验证是否为真实图片（防止伪造）
        $imageInfo = @getimagesize($file['tmp_name']);
        if ($imageInfo === false) {
            return $this->create(null, '无效的图片文件', 400);
        }

        // 5. 检查图片尺寸是否合理（防止超大图片攻击）
        if ($imageInfo[0] > 4096 || $imageInfo[1] > 4096) {
            return $this->create(null, '图片尺寸过大，最大支持4096x4096', 400);
        }

        // 6. 生成安全的文件名（避免路径遍历攻击）
        $newFileName = 'avatar_' . $uid . '_' . time() . '.' . $ext;
        $avatarDir = public_path() . 'avatars';
        
        if (!is_dir($avatarDir)) {
            mkdir($avatarDir, 0755, true);
        }

        $targetPath = $avatarDir . DIRECTORY_SEPARATOR . $newFileName;

        // 7. 删除旧头像文件
        $user = UserModel::find($uid);
        if ($user->avatar && !empty($user->avatar)) {
            $oldAvatarPath = parse_url($user->avatar, PHP_URL_PATH);
            if ($oldAvatarPath && strpos($oldAvatarPath, '/avatars/') === 0) {
                $oldFile = public_path() . ltrim($oldAvatarPath, '/');
                if (file_exists($oldFile) && is_file($oldFile)) {
                    // 确保文件在头像目录内（安全检查）
                    $realOldFile = realpath($oldFile);
                    $realAvatarDir = realpath($avatarDir);
                    if ($realOldFile && $realAvatarDir && strpos($realOldFile, $realAvatarDir) === 0) {
                        unlink($oldFile);
                    }
                }
            }
        }

        // 8. 移动上传文件
        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            return $this->create(null, '头像保存失败', 400);
        }

        // 9. 更新用户头像URL
        $scheme = $request->scheme();
        $host = $request->host();
        $avatarUrl = $scheme . '://' . $host . '/avatars/' . $newFileName;
        
        $user->avatar = $avatarUrl;
        $user->save();

        $this->setLog($uid, "更新了头像", "", "");

        return $this->create(['avatar' => $avatarUrl], '头像更新成功', 200);
    }

    public function home(Request $request): Response
    {
        $uid = $request->uid;
        
        return $this->create([
            "userCount"  => UserModel::count(),
            "imgSize"    => ImagesModel::sum('size'),
            "imgCount"   => ImagesModel::count(),
            "imgMyCount" => ImagesModel::where('user_id', $uid)->count(),
        ], '成功', 200);
    }

    public function storage(Request $request): Response
    {
        $storage = StorageModel::select();
        $data = [];
        
        foreach ($storage as $value) {
            $imgSize = ImagesModel::where('storage_id', $value['id'])->sum('size');
            $data[] = [
                'value' => round($imgSize / 1024 / 1024, 2),
                'name'  => $value['name'],
            ];
        }
        
        return $this->create($data, '成功', 200);
    }

    public function log(Request $request): Response
    {
        $data = $request->param();
        $uid = $request->uid;
        $userInfo = UserModel::find($uid);
        $role = RoleModel::find($userInfo?->role_id);

        $query = [];
        if ($data['type'] != 1) {
            $query['type'] = $data['type'];
        }

        $query['uid'] = match(true) {
            $role?->is_admin == 1 && $data['read'] != 1 => null,
            default => $uid
        };
        
        if ($query['uid'] === null) {
            unset($query['uid']);
        }

        $result = LogModel::where($query)->order('id desc')->paginate([
            'list_rows' => (int)$data['size'],
            'page'      => (int)$data['page'],
        ]);
        
        foreach ($result as $value) {
            $user = UserModel::find($value['uid']);
            $value['user'] = [
                'username' => $user?->username,
                'email'    => $user?->email,
                'avatar'   => $user?->avatar,
            ];
        }
        
        return $this->create($result, '成功', 200);
    }
}
