import express from 'express';
import { EndpointService } from '../services/EndpointService.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const endpointService = new EndpointService();

// 获取用户的所有端口
router.get('/', authMiddleware, (req, res, next) => {
  try {
    const endpoints = endpointService.getUserEndpoints(req.user.id);
    res.json(endpoints);
  } catch (error) {
    next(error);
  }
});

// 获取单个端口详情
router.get('/:id', authMiddleware, (req, res, next) => {
  try {
    const endpoint = endpointService.getEndpoint(parseInt(req.params.id));
    if (!endpoint) {
      return res.status(404).json({ error: '端口不存在' });
    }

    // 检查权限
    if (endpoint.user_id !== req.user.id) {
      return res.status(403).json({ error: '无权访问此端口' });
    }

    res.json(endpoint);
  } catch (error) {
    next(error);
  }
});

// 创建新端口
router.post('/', authMiddleware, (req, res, next) => {
  try {
    const { name, description, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({ error: '端口名称和代码不能为空' });
    }

    const id = endpointService.createEndpoint(name, req.user.id, description, code);
    res.status(201).json({ id, name });
  } catch (error) {
    next(error);
  }
});

// 更新端口
router.put('/:id', authMiddleware, (req, res, next) => {
  try {
    const { name, description, code } = req.body;
    const data = {};

    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (code !== undefined) data.code = code;

    endpointService.updateEndpoint(parseInt(req.params.id), req.user.id, data);
    res.json({ message: '更新成功' });
  } catch (error) {
    next(error);
  }
});

// 删除端口
router.delete('/:id', authMiddleware, (req, res, next) => {
  try {
    endpointService.deleteEndpoint(parseInt(req.params.id), req.user.id);
    res.json({ message: '删除成功' });
  } catch (error) {
    next(error);
  }
});

// 切换端口启用状态
router.post('/:id/toggle', authMiddleware, (req, res, next) => {
  try {
    endpointService.toggleEndpoint(parseInt(req.params.id), req.user.id);
    res.json({ message: '状态切换成功' });
  } catch (error) {
    next(error);
  }
});

// 执行端口（公开API，通过端口名称访问）
router.get('/run/:name', async (req, res, next) => {
  try {
    const requestData = {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      referer: req.headers.referer || req.headers.referrer
    };

    const result = await endpointService.executeEndpoint(req.params.name, requestData);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
