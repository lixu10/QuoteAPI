import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import ApiKey from '../models/ApiKey.js';

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: '未提供认证令牌' });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: '无效的认证令牌' });
  }
};

// 别名，兼容旧代码
export const authenticateToken = authMiddleware;

export const adminMiddleware = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: '需要管理员权限' });
  }
  next();
};

// API KEY 验证中间件
// 支持通过 header (X-API-Key) 或 query (?api_key=xxx) 传递
export const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;

  if (apiKey) {
    const userInfo = ApiKey.validate(apiKey);
    if (userInfo) {
      req.apiKeyUser = userInfo;
    }
  }
  next();
};

// 检查访问权限的中间件工厂函数
// visibility: 资源的可见性 ('public', 'restricted', 'private')
// ownerId: 资源所有者的 user_id
export const checkVisibility = (getResourceInfo) => {
  return async (req, res, next) => {
    try {
      const resourceInfo = await getResourceInfo(req);

      if (!resourceInfo) {
        return res.status(404).json({ error: '资源不存在' });
      }

      const { visibility, ownerId } = resourceInfo;
      req.resourceInfo = resourceInfo;

      // public: 任何人都可以访问
      if (visibility === 'public') {
        return next();
      }

      // 获取用户信息（可能来自 JWT 或 API KEY）
      const userId = req.user?.id || req.apiKeyUser?.id;

      // restricted: 需要登录或有效的 API KEY
      if (visibility === 'restricted') {
        if (userId) {
          return next();
        }
        return res.status(401).json({
          error: '此资源需要登录或提供有效的 API KEY 才能访问'
        });
      }

      // private: 只有创建者可以访问
      if (visibility === 'private') {
        if (userId === ownerId) {
          return next();
        }
        // 管理员也可以访问
        if (req.user?.isAdmin || req.apiKeyUser?.isAdmin) {
          return next();
        }
        return res.status(403).json({
          error: '此资源为私有，只有创建者可以访问'
        });
      }

      // 默认拒绝
      return res.status(403).json({ error: '无权访问此资源' });
    } catch (error) {
      console.error('Error checking visibility:', error);
      return res.status(500).json({ error: '权限检查失败' });
    }
  };
};
