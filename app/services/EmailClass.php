<?php

declare(strict_types=1);

namespace app\services;

use app\model\System as SystemModel;
use think\Exception;
use PHPMailer\PHPMailer\PHPMailer;

class EmailClass
{
    public function send_mail(string $tomail, string $subject = '', string $content = ''): void
    {
        $data = SystemModel::where('type', 'email')->column('value', 'key');
        $email_template = SystemModel::where('type', 'email_template')->value('value');
        
        $mail = new PHPMailer();
        $mail->CharSet = 'UTF-8';
        $mail->IsSMTP();
        $mail->SMTPDebug = 0;
        $mail->SMTPAuth = true;
        $mail->SMTPSecure = $data['email_secure'];
        $mail->Host = $data['email_smtp'];
        $mail->Port = (int)$data['email_port'];
        $mail->Username = $data['email_usr'];
        $mail->Password = $data['email_pwd'];
        $mail->SetFrom($data['email_usr'], 'PrettyPicture');
        $mail->AddReplyTo('', '');
        $mail->Subject = $subject;

        $body = str_replace(
            ['[网站名称]', '[网站地址]', '[标题]', '[内容]'],
            ['PrettyPicture', '', $subject, $content],
            $email_template
        );

        $mail->MsgHTML($body);
        $mail->AddAddress($tomail);

        if (!$mail->Send()) {
            throw new Exception($mail->ErrorInfo);
        }
    }
}
