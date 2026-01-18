import express from 'express';
import { EndpointService } from '../services/EndpointService.js';
import { authMiddleware } from '../middleware/auth.js';
import { getClientIp } from '../utils/getClientIp.js';
import { Endpoint } from '../models/Endpoint.js';
import dbManager from '../config/database.js';

const router = express.Router();
const endpointService = new EndpointService();
const endpointModel = new Endpoint();

// 检查端口访问权限的辅助函数
function checkEndpointAccess(req, endpoint) {
  if (!endpoint) {
    return { allowed: false, error: '端口不存在', status: 404 };
  }

  const visibility = endpoint.visibility || 'public';

  // public: 任何人都可以访问
  if (visibility === 'public') {
    return { allowed: true };
  }

  // 获取用户信息（可能来自 JWT 或 API KEY）
  const userId = req.user?.id || req.apiKeyUser?.id;
  const isAdmin = req.user?.isAdmin || req.apiKeyUser?.isAdmin;

  // restricted: 需要登录或有效的 API KEY
  if (visibility === 'restricted') {
    if (userId) {
      return { allowed: true };
    }
    return {
      allowed: false,
      error: '此端口需要提供有效的 API KEY 才能访问',
      status: 401
    };
  }

  // private: 只有创建者可以访问
  if (visibility === 'private') {
    if (userId === endpoint.user_id || isAdmin) {
      return { allowed: true };
    }
    return {
      allowed: false,
      error: '此端口为私有，只有创建者可以访问',
      status: 403
    };
  }

  return { allowed: false, error: '无权访问此资源', status: 403 };
}

// 获取所有公开的端口列表（带分页和搜索）
router.get('/all', (req, res, next) => {
  try {
    const db = dbManager.getDb();
    const { search = '', page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // 获取当前用户信息
    const userId = req.user?.id || req.apiKeyUser?.id;
    const isAdmin = req.user?.isAdmin || req.apiKeyUser?.isAdmin;

    let whereClause = 'WHERE e.is_active = 1';
    const params = [];

    // 根据用户权限过滤
    if (isAdmin) {
      // 管理员可以看到所有
    } else if (userId) {
      // 登录用户可以看到 public、restricted 和自己的 private
      whereClause += ` AND (e.visibility = 'public' OR e.visibility = 'restricted' OR (e.visibility = 'private' AND e.user_id = ?))`;
      params.push(userId);
    } else {
      // 未登录只能看到 public
      whereClause += ` AND (e.visibility IS NULL OR e.visibility = 'public')`;
    }

    // 搜索条件
    if (search) {
      whereClause += ' AND (e.name LIKE ? OR e.description LIKE ? OR u.username LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // 获取总数
    const countStmt = db.prepare(`
      SELECT COUNT(*) as total
      FROM endpoints e
      LEFT JOIN users u ON e.user_id = u.id
      ${whereClause}
    `);
    const { total } = countStmt.get(...params);

    // 获取分页数据
    const dataStmt = db.prepare(`
      SELECT e.id, e.name, e.description, e.visibility, e.call_count, e.is_active, e.created_at, e.metadata, e.code, u.username
      FROM endpoints e
      LEFT JOIN users u ON e.user_id = u.id
      ${whereClause}
      ORDER BY e.call_count DESC, e.created_at DESC
      LIMIT ? OFFSET ?
    `);
    const endpoints = dataStmt.all(...params, parseInt(limit), offset);

    res.json({
      data: endpoints,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// 执行端口（公开API，通过端口名称访问）- 必须在 /:id 之前定义
// 支持 GET 和 POST 请求
router.get('/run/:name', async (req, res, next) => {
  try {
    const endpoint = endpointModel.findByName(req.params.name);

    // 检查访问权限
    const accessCheck = checkEndpointAccess(req, endpoint);
    if (!accessCheck.allowed) {
      return res.status(accessCheck.status).json({ error: accessCheck.error });
    }

    const requestData = {
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'],
      referer: req.headers.referer || req.headers.referrer,
      params: req.query || {} // GET 请求的 query 参数
    };

    const result = await endpointService.executeEndpoint(req.params.name, requestData);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST 请求支持 JSON body 参数
router.post('/run/:name', async (req, res, next) => {
  try {
    const endpoint = endpointModel.findByName(req.params.name);

    // 检查访问权限
    const accessCheck = checkEndpointAccess(req, endpoint);
    if (!accessCheck.allowed) {
      return res.status(accessCheck.status).json({ error: accessCheck.error });
    }

    // 合并 query 参数和 body 参数，body 优先
    const params = { ...req.query, ...(req.body || {}) };

    const requestData = {
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'],
      referer: req.headers.referer || req.headers.referrer,
      params: params
    };

    const result = await endpointService.executeEndpoint(req.params.name, requestData);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

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
    if (endpoint.user_id !== req.user.id && !req.user.isAdmin) {
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
    const { name, description, code, visibility, metadata } = req.body;

    if (!name || !code) {
      return res.status(400).json({ error: '端口名称和代码不能为空' });
    }

    const id = endpointService.createEndpoint(name, req.user.id, description, code, visibility, metadata);
    res.status(201).json({ id, name });
  } catch (error) {
    next(error);
  }
});

// 更新端口
router.put('/:id', authMiddleware, (req, res, next) => {
  try {
    const { name, description, code, visibility, metadata } = req.body;
    const data = {};

    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (code !== undefined) data.code = code;
    if (visibility !== undefined) data.visibility = visibility;
    if (metadata !== undefined) {
      data.metadata = typeof metadata === 'string' ? metadata : JSON.stringify(metadata);
    }

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

export default router;
