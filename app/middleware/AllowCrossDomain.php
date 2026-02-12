<?php

declare(strict_types=1);

namespace app\middleware;

use Closure;
use think\{Request, Response};

class AllowCrossDomain
{
    public function handle(Request $request, Closure $next): Response
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Headers: *');
        header('Content-type:application/json; charset=UTF-8');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE, HEAD');

        if ($request->isOptions()) {
            return Response::create();
        }

        return $next($request);
    }
}
