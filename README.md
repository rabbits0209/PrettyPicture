# PrettyPicture 图床

一个简洁美观的图床系统，基于 ThinkPHP 8 + React 18 构建。支持多种云存储，具备完善的用户权限管理。

## 📸 界面预览

| | | |
|:---:|:---:|:---:|
| ![首页](images/qq_pic_merged_1771048833095.jpg) | ![图库](images/qq_pic_merged_1771048848645.jpg) | ![上传](images/qq_pic_merged_1771048865053.jpg) |
| ![目录](images/qq_pic_merged_1771048881427.jpg) | ![设置](images/qq_pic_merged_1771048897065.jpg) | ![管理](images/qq_pic_merged_1771048911076.jpg) |

## ✨ 功能特性

### 📷 图片管理
- 图片上传（支持拖拽、粘贴）
- 目录分类管理
- 批量操作（复制链接、移动目录、删除）
- 瀑布流展示
- 图片搜索与筛选

### ☁️ 多存储策略
- 本地存储
- 阿里云 OSS
- 腾讯云 COS
- 七牛云 KODO
- 华为云 OBS
- AWS S3（兼容 MinIO、Cloudflare R2 等）

### 👤 用户系统
- 用户注册/登录
- 邮箱验证码
- 密码找回
- 个人资料管理
- 存储配额控制

### 🔐 权限管理
- 角色组管理
- 细粒度权限控制（上传、删除、查看等）
- 管理员后台

### 🔌 API 接口
- 密钥认证上传
- 图片删除接口
- 随机图片接口（支持横竖屏自适应）

## 🛠 技术栈

| 后端 | 前端 |
|------|------|
| PHP >= 8.2 | React 18 |
| ThinkPHP 8 | TypeScript |
| MySQL | Tailwind CSS |
| JWT 认证 | Zustand |
| PHPMailer | Vite |

## 📦 安装部署

### 环境要求
- PHP >= 8.2(安装PRO,fileinfo,curl扩展)
- MySQL >= 5.7
- Node.js >= 18（仅构建时需要）
- Composer

### 方式一：下载发布包（推荐）

从 [GitHub Actions](../../actions) 下载最新的 `prettypicture-release.zip`，解压后直接部署。

### 方式二：手动构建

```bash
# 1. 克隆项目
git clone https://github.com/your-repo/PrettyPicture.git
cd PrettyPicture

# 2. 安装后端依赖
composer install --no-dev

# 3. 构建前端
cd PrettyPicture-react
npm install
npm run build

# 4. 复制前端构建文件
cp -r dist/* ../public/
```

### 配置

1. 访问 `/install` 目录进行安装

2. 配置 Web 服务器，将根目录指向 `public/`

3. 确保 `runtime/` 目录可写

## 🔌 API 使用

### 上传图片
```http
POST /api/upload?key=YOUR_SECRET_KEY&folder_id=0
Content-Type: multipart/form-data

file: 图片文件
```

### 删除图片
```http
DELETE /api/delete?key=YOUR_SECRET_KEY&id=IMAGE_ID
```

### 随机图片
```http
GET /api/random?folder_id=1&type=redirect&orientation=auto

# 参数说明
folder_id: 公开目录ID（必填）
type: redirect（跳转）或 json（返回URL）
orientation: auto | vertical | horizontal
```

## 📁 项目结构

```
PrettyPicture/
├── app/                    # 后端应用
│   ├── controller/         # 控制器
│   ├── model/              # 数据模型
│   ├── services/           # 服务类
│   └── middleware/         # 中间件
├── config/                 # 配置文件
├── public/                 # Web 根目录
└── PrettyPicture-react/    # 前端源码
    └── src/
        ├── api/            # API 接口
        ├── components/     # 组件
        ├── pages/          # 页面
        └── store/          # 状态管理
```

## 📄 License

Apache License 2.0
