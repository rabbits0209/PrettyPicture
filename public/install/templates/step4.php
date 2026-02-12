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
                <li class="on"><em>1</em>检测环境</li>
                <li class="on"><em>2</em>创建数据</li>
                <li class="current"><em>3</em>完成安装</li>
            </ul>
        </div>
        <div class="install">
            <?php if ($flag): ?>
                <div class="success_tip">
                    <a href="<?php echo 'http://' . $_SERVER['HTTP_HOST'] . '/'; ?>">🎉 安装完成，点击进入系统</a>
                    <p>为了站点安全，请删除 <code>public/install</code> 目录</p>
                    <p style="color: red">默认管理员账号：admin</p>
                    <p style="color: red">默认管理员密码：123456</p>
                </div>
                <div class="bottom tac">
                    <a href="<?php echo 'http://' . $_SERVER['HTTP_HOST']; ?>" class="btn">立即进入</a>
                </div>
            <?php else: ?>
                <div class="error_tip">
                    <?php echo $msg; ?>
                    <p style="margin-top: 20px; font-weight: 500;">可能的原因：</p>
                    <ul style="margin-top: 10px; padding-left: 20px;">
                        <li>① 数据库非纯净数据库，存在残留数据</li>
                        <li>② 数据库版本过低或过高</li>
                        <li>③ 数据库类型不匹配</li>
                    </ul>
                </div>
                <div class="bottom tac">
                    <a href="./index.php?step=3" class="btn">返回重试</a>
                </div>
            <?php endif; ?>
        </div>
    </section>
</div>
<?php require './templates/footer.php'; ?>
</body>
</html>
