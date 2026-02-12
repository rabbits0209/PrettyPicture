<?php

declare(strict_types=1);

namespace app\services;

use app\model\Storage as StorageModel;
use app\enums\StorageType;
use OSS\OssClient;
use OSS\Core\OssException;
use Qiniu\Auth;
use Qiniu\Storage\UploadManager;
use Qcloud\Cos\Client;
use Obs\ObsClient;
use Aws\S3\S3Client;
use Aws\Exception\AwsException;

class UploadCLass
{
    protected array $storage = [];
    private string $getPath;
    private readonly array $allowedExtensions;
    private readonly array $allowedMimeTypes;

    public function __construct()
    {
        $this->getPath = FOLDER . date("Y") . '/' . date("m") . '/';
        $this->allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'ico', 'svg'];
        $this->allowedMimeTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/bmp',
            'image/webp', 'image/x-icon', 'image/vnd.microsoft.icon', 'image/svg+xml',
        ];
    }

    public function validateFile(array $file): array
    {
        $ext = $this->getExtension($file['name']);
        
        return match(true) {
            !in_array($ext, $this->allowedExtensions) 
                => ['valid' => false, 'msg' => '不允许上传此类型文件，仅支持: ' . implode(', ', $this->allowedExtensions)],
            !in_array($file['type'], $this->allowedMimeTypes) 
                => ['valid' => false, 'msg' => '文件MIME类型不合法'],
            !$this->validateRealMimeType($file) 
                => ['valid' => false, 'msg' => '文件内容与扩展名不匹配'],
            $file['type'] === 'image/svg+xml' && $this->containsPhpCode($file['tmp_name']) 
                => ['valid' => false, 'msg' => '文件内容包含非法代码'],
            default 
                => ['valid' => true, 'msg' => '']
        };
    }

    private function validateRealMimeType(array $file): bool
    {
        if (!function_exists('finfo_open')) {
            return true;
        }
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $realMimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        return in_array($realMimeType, $this->allowedMimeTypes);
    }

    private function containsPhpCode(string $filePath): bool
    {
        $content = file_get_contents($filePath);
        return (bool)preg_match('/<\?php|<\?=/i', $content);
    }

    private function getExtension(string $name): string
    {
        return strtolower(pathinfo($name, PATHINFO_EXTENSION));
    }

    public function getName(string $name): string
    {
        $ext = $this->getExtension($name);
        $ext = in_array($ext, $this->allowedExtensions) ? $ext : 'jpg';
        return substr(md5(date("YmdHis") . random_int(1000, 9999)), 8, 16) . '.' . $ext;
    }

    private function success(string $path, string $name): array
    {
        return [
            'path'  => $path,
            'name'  => $name,
            'url'   => rtrim($this->storage['space_domain'], '/') . '/' . $path,
            'state' => 1,
        ];
    }

    private function error(string $msg): array
    {
        return ['msg' => $msg, 'state' => 0];
    }

    private function prepareUpload(array $file): array
    {
        $name = $this->getName($file['name']);
        return [
            'name'     => $name,
            'path'     => $this->getPath . $name,
            'filePath' => $file['tmp_name'],
        ];
    }

    public function create(array $file, int $sid): array
    {
        $this->storage = StorageModel::find($sid)?->toArray() ?? [];
        
        if (empty($this->storage)) {
            return $this->error('存储策略不存在');
        }

        $type = StorageType::tryFrom($this->storage['type']);
        
        return match($type) {
            StorageType::Local => $this->localUpload($file),
            StorageType::Cos   => $this->tencentUpload($file),
            StorageType::Oss   => $this->aliyunUpload($file),
            StorageType::Obs   => $this->huaweiUpload($file),
            StorageType::Kodo  => $this->qiniuUpload($file),
            StorageType::S3    => $this->awsUpload($file),
            default            => $this->error('不支持的存储类型')
        };
    }

    public function delete(string $path, int $sid): bool
    {
        $this->storage = StorageModel::find($sid)?->toArray() ?? [];
        
        if (empty($this->storage)) {
            return false;
        }

        $type = StorageType::tryFrom($this->storage['type']);

        try {
            return match($type) {
                StorageType::Local => $this->localDelete($path),
                StorageType::Cos   => $this->tencentDelete($path),
                StorageType::Oss   => $this->aliyunDelete($path),
                StorageType::Obs   => $this->huaweiDelete($path),
                StorageType::Kodo  => $this->qiniuDelete($path),
                StorageType::S3    => $this->awsDelete($path),
                default            => false
            };
        } catch (\Exception) {
            return false;
        }
    }

    private function localUpload(array $file): array
    {
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || ($_SERVER['SERVER_PORT'] ?? 80) == 443) ? "https://" : "http://";
        $path = './' . $this->getPath;
        
        if (!file_exists($path)) {
            mkdir($path, 0777, true);
        }

        $name = $this->getName($file['name']);
        if (move_uploaded_file($file["tmp_name"], $path . $name)) {
            return [
                'path'  => $this->getPath . $name,
                'name'  => $name,
                'url'   => $protocol . ($_SERVER['HTTP_HOST'] ?? 'localhost') . '/' . $this->getPath . $name,
                'state' => 1,
            ];
        }
        return $this->error('上传失败');
    }

    private function localDelete(string $path): bool
    {
        $realPath = realpath($path);
        $basePath = realpath('./');
        if ($realPath === false || !str_starts_with($realPath, $basePath)) {
            return false;
        }
        $ext = strtolower(pathinfo($realPath, PATHINFO_EXTENSION));
        if (!in_array($ext, $this->allowedExtensions)) {
            return false;
        }
        return @unlink($realPath);
    }

    private function aliyunUpload(array $file): array
    {
        $params = $this->prepareUpload($file);
        try {
            $client = new OssClient(
                $this->storage['AccessKey'],
                $this->storage['SecretKey'],
                $this->storage['region']
            );
            $client->uploadFile($this->storage['bucket'], $params['path'], $params['filePath']);
            return $this->success($params['path'], $params['name']);
        } catch (OssException $e) {
            return $this->error($e->getMessage());
        }
    }

    private function aliyunDelete(string $path): bool
    {
        $client = new OssClient(
            $this->storage['AccessKey'],
            $this->storage['SecretKey'],
            $this->storage['region']
        );
        $client->deleteObject($this->storage['bucket'], $path);
        return true;
    }

    private function getTencentClient(): Client
    {
        return new Client([
            'region'      => $this->storage['region'],
            'schema'      => 'https',
            'credentials' => [
                'secretId'  => $this->storage['AccessKey'],
                'secretKey' => $this->storage['SecretKey']
            ]
        ]);
    }

    private function tencentUpload(array $file): array
    {
        $params = $this->prepareUpload($file);
        try {
            $this->getTencentClient()->upload(
                $this->storage['bucket'],
                $params['path'],
                fopen($params['filePath'], 'rb')
            );
            return $this->success($params['path'], $params['name']);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    private function tencentDelete(string $path): bool
    {
        $this->getTencentClient()->deleteObject([
            'Bucket' => $this->storage['bucket'],
            'Key'    => $path,
        ]);
        return true;
    }

    private function qiniuUpload(array $file): array
    {
        $params = $this->prepareUpload($file);
        $auth = new Auth($this->storage['AccessKey'], $this->storage['SecretKey']);
        $token = $auth->uploadToken($this->storage['bucket']);
        
        [$ret, $err] = (new UploadManager())->putFile($token, $params['path'], $params['filePath']);
        
        return $err !== null ? $this->error((string)$err) : $this->success($params['path'], $params['name']);
    }

    private function qiniuDelete(string $path): bool
    {
        $auth = new Auth($this->storage['AccessKey'], $this->storage['SecretKey']);
        $bucketManager = new \Qiniu\Storage\BucketManager($auth, new \Qiniu\Config());
        $bucketManager->delete($this->storage['bucket'], $path);
        return true;
    }

    private function getHuaweiClient(): ObsClient
    {
        return new ObsClient([
            'key'      => $this->storage['AccessKey'],
            'secret'   => $this->storage['SecretKey'],
            'endpoint' => $this->storage['region']
        ]);
    }

    private function huaweiUpload(array $file): array
    {
        $params = $this->prepareUpload($file);
        try {
            $this->getHuaweiClient()->putObject([
                'Bucket'     => $this->storage['bucket'],
                'Key'        => $params['path'],
                'SourceFile' => $params['filePath']
            ]);
            return $this->success($params['path'], $params['name']);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    private function huaweiDelete(string $path): bool
    {
        $this->getHuaweiClient()->deleteObject([
            'Bucket' => $this->storage['bucket'],
            'Key'    => $path,
        ]);
        return true;
    }

    private function getAwsClient(): S3Client
    {
        $config = [
            'version'     => 'latest',
            'credentials' => [
                'key'    => $this->storage['AccessKey'],
                'secret' => $this->storage['SecretKey'],
            ],
        ];

        $region = $this->storage['region'];
        if (preg_match('/^https?:\/\//', $region)) {
            $config['endpoint'] = $region;
            $config['region'] = 'us-east-1';
            $config['use_path_style_endpoint'] = true;
        } else {
            $config['region'] = $region;
        }

        return new S3Client($config);
    }

    private function awsUpload(array $file): array
    {
        $params = $this->prepareUpload($file);
        try {
            $this->getAwsClient()->putObject([
                'Bucket'     => $this->storage['bucket'],
                'Key'        => $params['path'],
                'SourceFile' => $params['filePath'],
                'ACL'        => 'public-read',
            ]);
            return $this->success($params['path'], $params['name']);
        } catch (AwsException $e) {
            return $this->error($e->getMessage());
        }
    }

    private function awsDelete(string $path): bool
    {
        try {
            $this->getAwsClient()->deleteObject([
                'Bucket' => $this->storage['bucket'],
                'Key'    => $path,
            ]);
        } catch (AwsException) {
        }
        return true;
    }
}
