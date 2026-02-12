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
                <li class="current"><em>2</em>创建数据</li>
                <li><em>3</em>完成安装</li>
            </ul>
        </div>
        <form id="J_install_form" action="index.php?step=4" method="post">
            <input type="hidden" name="step" value="4">
            <input type="hidden" name="force" value="0">
            <div class="server">
                <table>
                    <tr>
                        <td class="td1" colspan="3">MySQL 数据库配置</td>
                    </tr>
                    <tr>
                        <td class="tar" width="30%">数据库服务器</td>
                        <td width="35%"><input type="text" name="dbhost" value="127.0.0.1" class="input"></td>
                        <td><span class="gray">一般为 127.0.0.1 或 localhost</span></td>
                    </tr>
                    <tr>
                        <td class="tar">数据库端口</td>
                        <td><input type="text" name="dbport" value="3306" class="input"></td>
                        <td><span class="gray">默认端口 3306</span></td>
                    </tr>
                    <tr>
                        <td class="tar">数据库用户名</td>
                        <td><input type="text" name="dbuser" value="root" class="input"></td>
                        <td><span class="gray">数据库登录用户名</span></td>
                    </tr>
                    <tr>
                        <td class="tar">数据库密码</td>
                        <td><input type="password" name="dbpw" value="" class="input" autocomplete="off"></td>
                        <td><span class="gray">数据库登录密码</span></td>
                    </tr>
                    <tr>
                        <td class="tar">数据库名称</td>
                        <td><input type="text" name="dbname" value="prettypicture" class="input"></td>
                        <td><span class="gray">不存在会自动创建</span></td>
                    </tr>
                    <tr>
                        <td class="td1" colspan="3">管理员账户配置</td>
                    </tr>
                    <tr>
                        <td class="tar">管理员邮箱</td>
                        <td><input type="email" name="admin_email" value="" class="input" required></td>
                        <td><span class="gray">用于登录的邮箱账号</span></td>
                    </tr>
                    <tr>
                        <td class="tar">管理员密码</td>
                        <td><input type="password" name="admin_password" value="" class="input" autocomplete="new-password" required></td>
                        <td><span class="gray">登录密码，建议8位以上</span></td>
                    </tr>
                    <tr>
                        <td class="tar">确认密码</td>
                        <td><input type="password" name="admin_password2" value="" class="input" autocomplete="new-password" required></td>
                        <td><span class="gray">再次输入密码</span></td>
                    </tr>
                </table>
            </div>
            <div class="bottom">
                <a href="./index.php?step=2" class="btn" style="background: #6c757d;">上一步</a>
                <button type="submit" class="btn">创建数据库</button>
            </div>
        </form>
    </section>
</div>
<?php require './templates/footer.php'; ?>
</body>
</html>
