# QuoteAPI 快速开始指南

## 一键部署

1. 确保已安装 Docker 和 Docker Compose

2. 克隆或下载项目到本地

3. 在项目根目录执行：

```bash
docker-compose up -d
```

4. 等待构建完成后，访问 `http://localhost:3088`

5. 使用默认管理员账号登录：
   - 用户名：`admin`
   - 密码：`admin`

## 使用流程

### 1. 创建仓库
登录后 → 点击"创建仓库" → 填写仓库名和描述 → 保存

### 2. 添加语句
进入仓库详情 → 点击"添加语句" → 输入内容 → 保存

### 3. 使用API
```bash
curl http://localhost:3088/api/random/你的仓库名
```

返回：
```json
{
  "content": "语句内容",
  "link": "/quote/1"
}
```

## 常用命令

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 备份数据
docker cp quoteapi-backend:/app/data/quoteapi.db ./backup.db
```

## 安全建议

首次部署后：
1. 立即修改 admin 密码
2. 修改 `.env` 中的 `JWT_SECRET`
3. 如部署到公网，建议配置 HTTPS

完整文档请查看 README.md
