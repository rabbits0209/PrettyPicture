<?php

declare(strict_types=1);

namespace app;

use think\App;
use think\exception\ValidateException;
use think\Validate;
use think\Response;
use app\model\Log as LogModel;

abstract class BaseController
{
    protected $batchValidate = false;
    protected $middleware = [];

    public function __construct(
        protected App $app,
        protected ?\think\Request $request = null
    ) {
        $this->request = $this->app->request;
        $this->initialize();
    }

    protected function initialize(): void {}

    protected function validate(array $data, string|array $validate, array $message = [], bool $batch = false): array|string|true
    {
        if (is_array($validate)) {
            $v = new Validate();
            $v->rule($validate);
        } else {
            if (str_contains($validate, '.')) {
                [$validate, $scene] = explode('.', $validate);
            }
            $class = str_contains($validate, '\\') ? $validate : $this->app->parseClass('validate', $validate);
            $v = new $class();
            if (!empty($scene)) {
                $v->scene($scene);
            }
        }

        $v->message($message);

        if ($batch || $this->batchValidate) {
            $v->batch(true);
        }

        return $v->failException(true)->check($data);
    }

    protected function create(mixed $data, string $msg = '', int $code = 200, string $type = 'json'): Response
    {
        return Response::create([
            'code' => $code,
            'msg'  => $msg,
            'data' => $data
        ], $type);
    }

    public function setLog(int $uid, string $content, string $operate_id, string $operate_cont, int $type = 3): void
    {
        (new LogModel)->save([
            'uid'          => $uid,
            'content'      => $content,
            'operate_id'   => $operate_id,
            'operate_cont' => $operate_cont,
            'type'         => $type
        ]);
    }

    public function get_curl(string $url, mixed $post = 0, mixed $referer = 0, mixed $cookie = 0, mixed $header = 0, mixed $ua = 0, mixed $nobaody = 0): string|bool
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        $httpheader = [
            "Accept:*/*",
            "Accept-Encoding:gzip,deflate,sdch",
            "Accept-Language:zh-CN,zh;q=0.8",
            "Connection:close"
        ];
        curl_setopt($ch, CURLOPT_HTTPHEADER, $httpheader);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        
        if ($post) {
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
        }
        if ($header) {
            curl_setopt($ch, CURLOPT_HEADER, true);
        }
        if ($cookie) {
            curl_setopt($ch, CURLOPT_COOKIE, $cookie);
        }
        if ($referer) {
            curl_setopt($ch, CURLOPT_REFERER, $referer === 1 ? ($_SERVER['HTTP_HOST'] ?? '') : $referer);
        }
        curl_setopt($ch, CURLOPT_USERAGENT, $ua ?: 'Mozilla/5.0 (Linux; Android 4.4.2; NoxW Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/30.0.0.0 Mobile Safari/537.36');
        if ($nobaody) {
            curl_setopt($ch, CURLOPT_NOBODY, 1);
        }
        curl_setopt($ch, CURLOPT_ENCODING, "gzip");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $ret = curl_exec($ch);
        curl_close($ch);
        return $ret;
    }

    public function city(string $ip): string
    {
        $url = 'http://whois.pconline.com.cn/ipJson.jsp?json=true&ip=';
        $city = $this->get_curl($url . $ip);
        
        if (!$city) {
            return '';
        }
        
        $city = mb_convert_encoding($city, "UTF-8", "GB2312");
        $cityData = json_decode($city, true);
        
        return match(true) {
            !is_array($cityData) => '',
            !empty($cityData['city']) => ($cityData['pro'] ?? '') . $cityData['city'],
            default => $cityData['pro'] ?? ''
        };
    }

    public function __call(string $name, array $arguments): Response
    {
        return $this->create([], '方法不存在', 404);
    }
}
