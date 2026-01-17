# 端口配置说明

## Docker 部署端口

使用 `docker-compose up -d` 部署时的端口配置：

### 主机端口（Host Ports）
- **前端应用**: `http://localhost:3088`
  - 访问 Web 界面
  - 访问 API 文档 `/api-docs`

- **后端 API**: `http://localhost:3077`
  - 直接访问 API 端点（通常不需要直接访问）
  - API 调用会通过前端的 Nginx 反向代理转发

### 容器内部端口
- 前端容器: 80（映射到主机 3088）
- 后端容器: 3077（映射到主机 3077）

## 本地开发端口

使用 `npm run dev` 本地开发时的端口配置：

- **前端开发服务器**: `http://localhost:5173`
- **后端开发服务器**: `http://localhost:3077`

## 端口选择说明

### 为什么使用 3088 而不是 80？

**端口 80 可能被占用的情况：**
1. 系统已有 Web 服务器运行（IIS、Apache、Nginx 等）
2. 其他 Docker 容器使用了 80 端口
3. Windows 某些系统服务占用（如 Windows Update、World Wide Web Publishing Service）

**使用 3088 的优势：**
- 避免与系统服务冲突
- 无需管理员权限
- 端口号规律清晰（3077 后端，3088 前端）

### 如何修改端口？

如果您想使用其他端口，只需修改 `docker-compose.yml` 文件：

```yaml
frontend:
  ports:
    - "您的端口:80"  # 例如 "8080:80"
```

然后重新构建：
```bash
docker-compose down
docker-compose up -d --build
```

## 防火墙配置

如果需要从外部访问，请确保防火墙允许以下端口：
- TCP 3088（前端）
- TCP 3077（可选，如需直接访问后端 API）

## 生产环境建议

生产环境部署时建议：
1. 使用 Nginx 或其他反向代理
2. 配置 HTTPS（SSL/TLS）
3. 使用标准端口（80/443）
4. 启用防火墙规则
5. 考虑使用 CDN

## 端口测试

部署完成后，测试端口是否正常：

```bash
# 测试前端
curl http://localhost:3088

# 测试后端 API
curl http://localhost:3077/health

# 通过前端代理测试 API
curl http://localhost:3088/api/health
```

如果都返回正常响应，说明端口配置成功。
