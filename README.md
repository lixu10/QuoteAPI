# QuoteAPI - 语句管理与API服务平台

一个轻量、现代化的多用户语句管理平台，为网站和应用提供随机语句、诗词、名言的API服务。

## 功能特性

- **多用户系统** - 支持用户注册、登录，管理员可管理所有用户
- **语句仓库** - 每个用户可创建多个语句仓库
- **便捷管理** - 支持添加、修改、删除语句（支持多行文本）
- **公开访问** - 所有仓库和语句默认公开可访问
- **API服务** - 提供RESTful API，随机返回仓库中的语句
- **数据统计** - 详细的调用次数、访问来源、访问日志统计
- **Docker部署** - 一键部署，开箱即用

## 技术栈

**后端**
- Node.js + Express
- SQLite 数据库
- JWT 认证
- bcrypt 密码加密

**前端**
- React 18
- Vite
- React Router
- Axios

**部署**
- Docker
- Docker Compose
- Nginx

## 快速开始

### 使用 Docker Compose（推荐）

1. 克隆项目

```bash
git clone <repository-url>
cd QuoteAPI
```

2. 配置环境变量（可选）

```bash
cp .env.example .env
# 编辑 .env 文件，修改 JWT_SECRET
```

3. 启动服务

```bash
docker-compose up -d
```

4. 访问应用

打开浏览器访问 `http://localhost`

默认管理员账号：
- 用户名：`admin`
- 密码：`admin`

**首次登录后请立即修改密码！**

### 本地开发

#### 后端

```bash
cd backend
npm install
cp .env.example .env
# 编辑 .env 配置文件
npm run dev
```

后端服务运行在 `http://localhost:3077`

#### 前端

```bash
cd frontend
npm install
npm run dev
```

前端服务运行在 `http://localhost:5173`

## 使用指南

### 1. 用户注册与登录

- 访问首页，点击"注册"按钮
- 填写用户名和密码完成注册
- 使用注册的账号登录系统

### 2. 创建语句仓库

- 登录后进入"我的仓库"
- 点击"创建仓库"按钮
- 填写仓库名称和描述
- 仓库名称将作为API调用的标识符

### 3. 添加语句

- 进入仓库详情页
- 点击"添加语句"按钮
- 输入语句内容（支持换行）
- 保存即可

### 4. 使用API

#### 获取随机语句

```bash
GET /api/random/{仓库名}
```

**响应示例：**

```json
{
  "content": "春眠不觉晓，处处闻啼鸟",
  "link": "/quote/123"
}
```

**使用示例：**

```javascript
// JavaScript
fetch('http://localhost/api/random/诗词')
  .then(res => res.json())
  .then(data => console.log(data.content));
```

```python
# Python
import requests
response = requests.get('http://localhost/api/random/诗词')
data = response.json()
print(data['content'])
```

#### 获取语句详情

```bash
GET /api/quote/{语句ID}
```

### 5. 查看统计数据

在仓库详情页可以查看：
- 语句使用次数
- 页面访问次数
- API调用次数
- 访问来源统计
- 详细访问日志

### 6. 管理员功能

管理员账号登录后可以：
- 查看所有用户
- 删除用户（除默认管理员外）
- 管理所有仓库

## API 文档

### 认证相关

#### 用户注册
```
POST /auth/register
Content-Type: application/json

{
  "username": "user",
  "password": "password"
}
```

#### 用户登录
```
POST /auth/login
Content-Type: application/json

{
  "username": "user",
  "password": "password"
}

Response:
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "username": "user",
    "isAdmin": false
  }
}
```

### 仓库管理

#### 创建仓库
```
POST /repositories
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "仓库名",
  "description": "描述"
}
```

#### 获取用户仓库
```
GET /repositories
Authorization: Bearer {token}
```

#### 获取仓库详情
```
GET /repositories/{id}
```

#### 删除仓库
```
DELETE /repositories/{id}
Authorization: Bearer {token}
```

### 语句管理

#### 添加语句
```
POST /quotes
Authorization: Bearer {token}
Content-Type: application/json

{
  "repositoryId": 1,
  "content": "语句内容"
}
```

#### 获取仓库的所有语句
```
GET /quotes/repository/{repositoryId}
```

#### 删除语句
```
DELETE /quotes/{id}
Authorization: Bearer {token}
```

### 公开API

#### 随机获取语句
```
GET /api/random/{仓库名}

Response:
{
  "content": "语句内容",
  "link": "/quote/123"
}
```

#### 获取统计数据
```
GET /api/stats/{repositoryId}

Response:
{
  "logs": [...],
  "refererStats": [...]
}
```

## 项目结构

```
QuoteAPI/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── config/         # 配置文件
│   │   ├── models/         # 数据模型
│   │   ├── services/       # 业务逻辑
│   │   ├── routes/         # 路由
│   │   ├── middleware/     # 中间件
│   │   └── index.js        # 入口文件
│   ├── Dockerfile
│   └── package.json
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/    # 组件
│   │   ├── pages/         # 页面
│   │   ├── App.jsx        # 主应用
│   │   └── main.jsx       # 入口文件
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml      # Docker编排文件
└── README.md              # 本文档
```

## 环境变量说明

### 后端环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| PORT | 服务端口 | 3077 |
| JWT_SECRET | JWT密钥 | dev-secret-key |
| DB_PATH | 数据库路径 | ./data/quoteapi.db |
| NODE_ENV | 运行环境 | development |

## 数据持久化

使用 Docker Compose 部署时，数据会持久化存储在 Docker volume 中。

查看数据卷：
```bash
docker volume ls
```

备份数据：
```bash
docker cp quoteapi-backend:/app/data/quoteapi.db ./backup.db
```

恢复数据：
```bash
docker cp ./backup.db quoteapi-backend:/app/data/quoteapi.db
docker-compose restart backend
```

## 常见问题

### 1. 无法访问服务

检查 Docker 容器是否正常运行：
```bash
docker-compose ps
```

查看日志：
```bash
docker-compose logs -f
```

### 2. 忘记管理员密码

删除数据库文件重新初始化：
```bash
docker-compose down
docker volume rm quoteapi_quote-data
docker-compose up -d
```

### 3. 修改端口

编辑 `docker-compose.yml` 文件中的端口映射：
```yaml
ports:
  - "8080:80"  # 将前端端口改为8080
```

## 安全建议

1. **修改默认密码** - 首次部署后立即修改admin密码
2. **设置强密钥** - 修改 `.env` 中的 `JWT_SECRET` 为强随机字符串
3. **使用HTTPS** - 生产环境建议配置SSL证书
4. **定期备份** - 定期备份数据库文件
5. **网络隔离** - 使用防火墙限制不必要的端口访问

## 更新升级

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request

## 联系方式

如有问题或建议，请通过 GitHub Issues 联系
