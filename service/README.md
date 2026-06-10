# AI记事本后端服务

基于 Node.js + Express + MySQL 构建的AI记事本后端服务。

## 功能特性

- 用户认证（注册、登录、JWT令牌）
- 笔记管理（创建、编辑、删除、搜索）
- 日程管理（创建、编辑、删除、提醒）
- 图片上传与OCR识别
- AI智能问答
- 知识库管理

## 技术栈

- **框架**: Express 4.x
- **数据库**: MySQL 8.0 + Sequelize ORM
- **认证**: JWT + BCrypt
- **日志**: Winston + Morgan
- **文件上传**: Multer

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env` 文件并修改配置：

```bash
cp .env.example .env
```

修改 `.env` 中的数据库连接信息和其他配置。

### 初始化数据库

```bash
npm run init-db
```

### 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## 目录结构

```
service/
├── config/          # 配置文件
├── scripts/         # 脚本文件
├── src/
│   ├── api/         # API路由
│   ├── controllers/ # 控制器
│   ├── services/    # 服务层
│   ├── models/      # 数据模型
│   ├── middleware/  # 中间件
│   ├── utils/       # 工具函数
│   └── app.js       # 应用入口
├── uploads/         # 上传文件目录
├── tests/           # 测试文件
└── package.json
```

## API接口

### 用户接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/users/register | 用户注册 |
| POST | /api/users/login | 用户登录 |
| GET | /api/users/me | 获取当前用户 |
| PUT | /api/users/me | 更新用户信息 |
| PUT | /api/users/password | 修改密码 |

### 笔记接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/notes | 获取笔记列表 |
| GET | /api/notes/:id | 获取笔记详情 |
| POST | /api/notes | 创建笔记 |
| PUT | /api/notes/:id | 更新笔记 |
| DELETE | /api/notes/:id | 删除笔记 |
| GET | /api/notes/search?q=xxx | 搜索笔记 |

### 日程接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/schedules | 获取日程列表 |
| GET | /api/schedules/today | 获取今日日程 |
| GET | /api/schedules/monthly | 获取月度日程 |
| POST | /api/schedules | 创建日程 |
| PUT | /api/schedules/:id | 更新日程 |
| DELETE | /api/schedules/:id | 删除日程 |

### 聊天接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/chat/ask | 发送问题 |
| GET | /api/chat/history | 获取历史记录 |
| DELETE | /api/chat/history | 清空历史 |

### 图片接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/images/upload | 上传图片 |
| GET | /api/images | 获取图片列表 |
| DELETE | /api/images/:id | 删除图片 |
| POST | /api/images/:id/ocr | OCR识别 |

### 知识库接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/knowledge | 获取知识库列表 |
| GET | /api/knowledge/:id | 获取知识详情 |
| POST | /api/knowledge | 创建知识 |
| PUT | /api/knowledge/:id | 更新知识 |
| DELETE | /api/knowledge/:id | 删除知识 |

## 许可证

MIT License
