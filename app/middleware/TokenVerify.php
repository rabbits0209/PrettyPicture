<?php

declare(strict_types=1);

namespace app\middleware;

use Firebase\JWT\{JWT, Key};
use app\BaseController;
use think\Response;

class TokenVerify extends BaseController
{
    public function handle($request, \Closure $next): Response|string
    {
        $token = $request->header('token');
        
        if (!$token) {
            return $this->create([], '登录失效', -1);
        }

        try {
            JWT::$leeway = 60;
            $decoded = JWT::decode($token, new Key(TokenKey, 'HS256'));
            $request->uid = $decoded->username;
        } catch (\Firebase\JWT\SignatureInvalidException $e) {
            return $this->create([], $e->getMessage(), -1);
        } catch (\Firebase\JWT\BeforeValidException $e) {
            return $this->create([], $e->getMessage(), -1);
        } catch (\Firebase\JWT\ExpiredException) {
            return $this->create(null, '登录失效', -1);
        } catch (\Exception $e) {
            return $this->create(null, $e->getMessage(), -1);
        }

        return $next($request);
    }
}
