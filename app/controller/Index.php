<?php

declare(strict_types=1);

namespace app\controller;

use app\BaseController;
use app\model\System as SystemModel;
use think\Response;

class Index extends BaseController
{
    public function index(): Response
    {
        $basics = SystemModel::where('type', "basics")->column('value', 'key');
        $upload = SystemModel::where('type', "upload")->column('value', 'key');
        
        return $this->create([
            "version"          => VERSION,
            "time"             => RELRAASE_TIME,
            "is_reg"           => (int)($basics['is_reg'] ?? 1),
            "upload_max"       => (int)($upload['upload_max'] ?? 50) * 1024,
            "upload_rule"      => $upload['upload_rule'] ?? 'jpg,jpeg,gif,png,ico,svg,webp',
            "is_show_storage"  => (int)($basics['is_show_storage'] ?? 1),
            "is_show_role"     => (int)($basics['is_show_role'] ?? 1),
            "is_show_member"   => (int)($basics['is_show_member'] ?? 1),
            "reg_email_verify" => (int)($basics['reg_email_verify'] ?? 1),
        ], '成功', 200);
    }
}
