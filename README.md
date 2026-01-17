# QuoteAPI - 语句管理与API服务平台

一个轻量、现代化的多用户语句管理平台，为网站和应用提供随机语句、诗词、名言的API服务。

## 功能特性

- **多用户系统** - 支持用户注册、登录，管理员可管理所有用户
- **语句仓库** - 每个用户可创建多个语句仓库，支持批量导入
- **便捷管理** - 支持添加、修改、删除语句（支持多行文本）
- **公开访问** - 所有仓库和语句默认公开可访问，游客和登录用户均可浏览
- **API服务** - 提供RESTful API，随机返回仓库中的语句
- **智能端口** - 创建自定义Python API端口，实现复杂逻辑（条件判断、多仓库组合等）
- **数据统计** - 详细的IP追踪、访问来源、设备分布、时间趋势分析（仅创建者可见）
- **密码管理** - 用户可随时修改密码
- **Docker部署** - 一键部署，开箱即用

## 技术栈

**后端**
- Node.js + Express
- SQLite 数据库
- JWT 认证
- bcrypt 密码加密
- Python 3（用于端口功能）

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

打开浏览器访问 `http://localhost:3088`

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
- 在顶部表单输入语句内容（支持换行）
- 点击"添加"按钮即可

**批量导入：**
- 点击"批量导入"按钮
- 每行一条语句，支持多行文本
- 一次性导入多条语句

### 4. 修改密码

- 登录后点击右上角"修改密码"
- 输入原密码和新密码
- 保存即可

### 5. 创建智能端口

端口功能允许你编写Python代码创建自定义API，实现复杂的逻辑组合。

#### 什么是端口？

端口是一个可编程的API端点，你可以使用Python代码：
- 调用多个仓库的API
- 根据时间、日期、星期等条件返回不同内容
- 使用随机数、加密、编码等工具函数
- 获取访问者的IP、User-Agent等信息

#### 如何创建端口？

1. 登录后进入"我的端口"
2. 点击"创建端口"
3. 填写端口名称和描述
4. 编写Python代码（必须定义`result`变量）
5. 右侧有20+个内置函数可供使用

#### 端口示例：星期四返回KFC文案

```python
# 判断今天是否星期四
if current_weekday == 4:  # Thursday
    content = get_random_quote('KFC疯狂星期四')
    message = '今天是疯狂星期四！'
else:
    content = get_random_quote('诗词')
    message = '今天是' + current_weekday_cn

result = {
    'content': content,
    'message': message,
    'date': current_date
}
```

#### 内置函数列表（20+个）

**时间日期函数：**
- `current_date` - 当前日期 (YYYY-MM-DD)
- `current_time` - 当前时间 (HH:MM:SS)
- `current_year` - 当前年份
- `current_month` - 当前月份 (1-12)
- `current_day` - 当前日期 (1-31)
- `current_hour` - 当前小时 (0-23)
- `current_weekday` - 星期几 (0-6, 0=周日)
- `current_weekday_cn` - 星期几（中文）
- `is_weekend` - 是否周末 (True/False)
- `get_season()` - 获取季节（春/夏/秋/冬）
- `greeting()` - 根据时间问候（早上好/下午好/晚上好）
- `chinese_zodiac()` - 当前生肖
- `days_until_weekend()` - 距周末天数

**API调用函数：**
- `get_random_quote(仓库名)` - 获取指定仓库的随机语句

**随机数函数：**
- `random_int(min, max)` - 随机整数
- `random_float(min, max)` - 随机浮点数
- `random_choice(list)` - 从列表随机选择
- `shuffle_list(list)` - 打乱列表

**加密编码函数：**
- `md5(text)` - MD5哈希
- `sha256(text)` - SHA256哈希
- `base64_encode(text)` - Base64编码
- `base64_decode(text)` - Base64解码

**请求信息函数：**
- `ip_address` - 访问者IP地址
- `user_agent` - 浏览器User-Agent
- `referer` - 来源地址

#### 调用端口API

创建端口后，可以通过以下URL访问：

```bash
GET /endpoints/run/{端口名称}
```

示例：
```bash
curl http://localhost:3088/endpoints/run/daily-quote
```

### 6. 使用API

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
fetch('http://localhost:3088/api/random/诗词')
  .then(res => res.json())
  .then(data => console.log(data.content));
```

```python
# Python
import requests
response = requests.get('http://localhost:3088/api/random/诗词')
data = response.json()
print(data['content'])
```

#### 获取语句详情

```bash
GET /api/quote/{语句ID}
```

### 7. 查看统计数据

仓库创建者在仓库详情页可以查看详细统计（仅创建者可见）：

**访问趋势**
- 7天调用趋势图
- 24小时分布图
- 总调用次数、最近7天调用次数
- 总独立IP数、最近7天独立IP数

**Top IP排行**
- 按调用次数排序的Top 10 IP地址
- 显示每个IP的访问次数和占比

**来源网站统计**
- 按Referer统计的访问来源
- 显示各来源网站的访问次数

**设备分布**
- 移动端 vs 桌面端统计
- 浏览器类型分布
- 操作系统统计

**访问日志**
- 最近50条访问记录
- 包含时间、IP、来源、User-Agent等详细信息

### 8. 管理员功能

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

#### 修改密码
```
POST /auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "oldPassword": "old-password",
  "newPassword": "new-password"
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
GET /stats/{repositoryId}
Authorization: Bearer {token} (仅创建者)

Response:
{
  "totalStats": {
    "totalCalls": 1000,
    "recentCalls": 150,
    "uniqueIps": 50,
    "recentUniqueIps": 20
  },
  "topIps": [...],
  "topReferers": [...],
  "dailyTrend": [...],
  "hourlyTrend": [...],
  "userAgentStats": {...},
  "recentLogs": [...]
}
```

### 端口管理

#### 创建端口
```
POST /endpoints
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "daily-quote",
  "description": "每日一句",
  "code": "result = {'content': get_random_quote('诗词')}"
}
```

#### 获取用户端口列表
```
GET /endpoints
Authorization: Bearer {token}
```

#### 更新端口
```
PUT /endpoints/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "description": "更新后的描述",
  "code": "新的Python代码"
}
```

#### 删除端口
```
DELETE /endpoints/{id}
Authorization: Bearer {token}
```

#### 启用/禁用端口
```
POST /endpoints/{id}/toggle
Authorization: Bearer {token}
```

#### 运行端口（公开API）
```
GET /endpoints/run/{端口名称}

Response:
{
  "content": "春眠不觉晓",
  "message": "今天是星期一",
  "date": "2024-01-15"
}
```

## 项目结构

```
QuoteAPI/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── config/         # 配置文件
│   │   │   └── database.js # 数据库初始化
│   │   ├── models/         # 数据模型
│   │   │   ├── BaseModel.js
│   │   │   ├── User.js
│   │   │   ├── Repository.js
│   │   │   ├── Quote.js
│   │   │   └── Endpoint.js # 端口模型
│   │   ├── services/       # 业务逻辑
│   │   │   ├── AuthService.js
│   │   │   ├── StatsService.js # 统计服务
│   │   │   └── EndpointService.js # 端口执行引擎
│   │   ├── routes/         # 路由
│   │   │   ├── auth.js
│   │   │   ├── repositories.js
│   │   │   ├── quotes.js
│   │   │   ├── stats.js # 统计API
│   │   │   └── endpoints.js # 端口API
│   │   ├── middleware/     # 中间件
│   │   │   └── auth.js
│   │   └── index.js        # 入口文件
│   ├── Dockerfile
│   └── package.json
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/    # 组件
│   │   │   ├── Header.jsx
│   │   │   └── RepositoryStats.jsx # 统计组件
│   │   ├── pages/         # 页面
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Repositories.jsx # 公开仓库列表
│   │   │   ├── RepositoryDetail.jsx
│   │   │   ├── ChangePassword.jsx # 修改密码页面
│   │   │   ├── Endpoints.jsx # 端口列表
│   │   │   ├── EndpointEditor.jsx # 端口编辑器
│   │   │   ├── Admin.jsx
│   │   │   └── ApiDocs.jsx
│   │   ├── App.jsx        # 主应用
│   │   ├── AuthContext.jsx
│   │   ├── api.js         # API客户端
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

### 2. 修改端口

编辑 `docker-compose.yml` 文件中的端口映射：
```yaml
ports:
  - "8080:80"  # 将前端端口改为8080
```

### 4. Python环境

端口功能需要Python 3环境。Docker部署时已自动包含，本地开发需确保已安装Python 3：
```bash
python3 --version  # 验证Python版本
```

## 安全建议

1. **修改默认密码** - 首次部署后立即修改admin密码
2. **设置强密钥** - 修改 `.env` 中的 `JWT_SECRET` 为强随机字符串
3. **使用HTTPS** - 生产环境建议配置SSL证书
4. **定期备份** - 定期备份数据库文件
5. **网络隔离** - 使用防火墙限制不必要的端口访问
6. **端口代码审查** - 端口功能执行用户提供的Python代码，建议仅信任的用户使用

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
