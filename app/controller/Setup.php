<?php

declare(strict_types=1);

namespace app\controller;

use app\BaseController;
use app\model\{System as SystemModel, User as UserModel};
use think\Exception;
use app\services\EmailClass;
use think\{Request, Response};

class Setup extends BaseController
{
    public function index(Request $request, string $type = ""): Response
    {
        $system = SystemModel::where('type', $type)->select()->toArray();
        
        foreach ($system as &$value) {
            if (!empty($value['extend'])) {
                $value['extend'] = json_decode($value['extend'], true);
            }
            if ($value['attr'] === 'number') {
                $value['value'] = (int)$value['value'];
            }
        }
        
        return $this->create($system, '查询成功', 200);
    }

    public function update(Request $request): Response
    {
        $uid = $request->uid;
        $data = $request->param();
        
        foreach ($data['createData'] as $value) {
            $system = SystemModel::find($value['id']);
            $system->value = $value['value'];
            $system->save();
        }
        
        $this->setLog($uid, "修改了设置", "", "");
        return $this->create([], '成功', 200);
    }

    public function sendTest(Request $request): Response
    {
        $uid = $request->uid;
        $email = UserModel::where('id', $uid)->value('email');

        try {
            (new EmailClass)->send_mail($email, "邮箱对接成功", "您的邮箱对接成功");
            return $this->create([], '发送成功', 200);
        } catch (Exception $e) {
            return $this->create([], $e->getMessage(), 400);
        }
    }
}
