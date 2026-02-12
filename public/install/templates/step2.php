<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $Title; ?> - <?php echo $Powered; ?></title>
    <link rel="stylesheet" href="./css/install.css">
</head>
<body>
<div class="wrap">
    <?php require './templates/header.php'; ?>
    <section class="section">
        <div class="step">
            <ul>
                <li class="current"><em>1</em>检测环境</li>
                <li><em>2</em>创建数据</li>
                <li><em>3</em>完成安装</li>
            </ul>
        </div>
        <div class="server">
            <table>
                <tr>
                    <td class="td1">环境检测</td>
                    <td class="td1" width="20%">推荐配置</td>
                    <td class="td1" width="30%">当前状态</td>
                    <td class="td1" width="20%">最低要求</td>
                </tr>
                <tr>
                    <td>操作系统</td>
                    <td>Linux</td>
                    <td><span class="correct_span">✓</span><?php echo $os; ?></td>
                    <td>不限制</td>
                </tr>
                <tr>
                    <td>服务器环境</td>
                    <td>Nginx / Apache</td>
                    <td><span class="correct_span">✓</span><?php echo $_SERVER['SERVER_SOFTWARE']; ?></td>
                    <td>Apache 2.0+</td>
                </tr>
                <tr>
                    <td>PHP 版本</td>
                    <td><?php echo PHP_EDITION; ?> ~ 7.4</td>
                    <td><span class="correct_span">✓</span><?php echo $phpv; ?></td>
                    <td><?php echo PHP_EDITION; ?>+</td>
                </tr>
                <tr>
                    <td>附件上传</td>
                    <td>> 2M</td>
                    <td><?php echo $uploadSize; ?></td>
                    <td>不限制</td>
                </tr>
                <tr>
                    <td>Session</td>
                    <td>开启</td>
                    <td><?php echo $session; ?></td>
                    <td>开启</td>
                </tr>
                <tr>
                    <td>GD 库</td>
                    <td>必须开启</td>
                    <td><?php echo $gd; ?></td>
                    <td>1.0+</td>
                </tr>
                <tr>
                    <td>MySQLi</td>
                    <td>必须开启</td>
                    <td><?php echo $mysql; ?></td>
                    <td>启用</td>
                </tr>
                <tr>
                    <td>cURL</td>
                    <td>必须扩展</td>
                    <td><?php echo $curl; ?></td>
                    <td>启用</td>
                </tr>
                <tr>
                    <td>BCMath</td>
                    <td>必须扩展</td>
                    <td><?php echo $bcmath; ?></td>
                    <td>启用</td>
                </tr>
                <tr>
                    <td>OpenSSL</td>
                    <td>必须扩展</td>
                    <td><?php echo $openssl; ?></td>
                    <td>启用</td>
                </tr>
            </table>

            <table>
                <tr>
                    <td class="td1">目录权限检查</td>
                    <td class="td1" width="20%">推荐配置</td>
                    <td class="td1" width="25%">写入</td>
                    <td class="td1" width="25%">读取</td>
                </tr>
                <?php foreach ($folder as $dir): 
                    $Testdir = APP_DIR . $dir;
                    if (!is_file($Testdir) && !is_dir($Testdir)) {
                        dir_create($Testdir);
                    }
                    $w = testwrite($Testdir) 
                        ? '<span class="correct_span">✓</span>可写' 
                        : '<span class="correct_span error_span">✗</span>不可写';
                    if (!testwrite($Testdir)) $err++;
                    
                    $r = is_readable($Testdir) 
                        ? '<span class="correct_span">✓</span>可读' 
                        : '<span class="correct_span error_span">✗</span>不可读';
                    if (!is_readable($Testdir)) $err++;
                ?>
                <tr>
                    <td><?php echo $dir; ?></td>
                    <td>读写</td>
                    <td><?php echo $w; ?></td>
                    <td><?php echo $r; ?></td>
                </tr>
                <?php endforeach; ?>
                <?php
                foreach ($file as $dir) {
                    @unlink(APP_DIR . $dir);
                }
                $file_env = APP_DIR . ".env";
                @fopen($file_env, "w");
                $w = testwrite($file_env) 
                    ? '<span class="correct_span">✓</span>可写' 
                    : '<span class="correct_span error_span">✗</span>不可写';
                if (!testwrite($file_env)) $err++;
                $r = is_readable($file_env) 
                    ? '<span class="correct_span">✓</span>可读' 
                    : '<span class="correct_span error_span">✗</span>不可读';
                if (!is_readable($file_env)) $err++;
                ?>
                <tr>
                    <td>.env 配置文件</td>
                    <td>读写</td>
                    <td><?php echo $w; ?></td>
                    <td><?php echo $r; ?></td>
                </tr>
            </table>

            <table>
                <tr>
                    <td class="td1" width="70%">函数检测</td>
                    <td class="td1" width="30%">当前状态</td>
                </tr>
                <tr>
                    <td>file_put_contents</td>
                    <td><?php echo $file_put_contents; ?></td>
                </tr>
                <tr>
                    <td>imagettftext</td>
                    <td><?php echo $imagettftext; ?></td>
                </tr>
            </table>
        </div>
        <div class="bottom">
            <a href="<?php echo $_SERVER['PHP_SELF']; ?>?step=2" class="btn">重新检测</a>
            <?php if ($err > 0): ?>
                <a href="javascript:alert('环境检测未通过，请先解决上述问题')" class="btn btn_old">下一步</a>
            <?php else: ?>
                <a href="<?php echo $_SERVER['PHP_SELF']; ?>?step=3" class="btn">下一步</a>
            <?php endif; ?>
        </div>
    </section>
</div>
<?php require './templates/footer.php'; ?>
</body>
</html>
