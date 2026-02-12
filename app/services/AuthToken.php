<?php

declare(strict_types=1);

namespace app\services;

use Firebase\JWT\JWT;

class AuthToken
{
    public function createToken(int $username): string
    {
        try {
            $time = time();
            $token = [
                'iat'      => $time,
                'nbf'      => $time,
                'exp'      => $time + 85400 * 14,
                'username' => $username,
            ];
            return JWT::encode($token, TokenKey, 'HS256');
        } catch (\Exception) {
            return "";
        }
    }
}
