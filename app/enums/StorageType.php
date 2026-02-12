<?php

declare(strict_types=1);

namespace app\enums;

enum StorageType: string
{
    case Local = 'local';
    case Cos = 'cos';
    case Oss = 'oss';
    case Obs = 'obs';
    case Kodo = 'kodo';
    case S3 = 's3';

    public function label(): string
    {
        return match($this) {
            self::Local => '本地存储',
            self::Cos => '腾讯云 COS',
            self::Oss => '阿里云 OSS',
            self::Kodo => '七牛云 KODO',
            self::Obs => '华为云 OBS',
            self::S3 => 'AWS S3',
        };
    }

    public static function labels(): array
    {
        return array_combine(
            array_column(self::cases(), 'value'),
            array_map(fn(self $case) => $case->label(), self::cases())
        );
    }
}
