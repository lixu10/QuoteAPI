import express from 'express';
import { RepositoryService } from '../services/RepositoryService.js';
import { authMiddleware } from '../middleware/auth.js';
import dbManager from '../config/database.js';

const router = express.Router();
const repoService = new RepositoryService();

router.post('/', authMiddleware, (req, res, next) => {
  try {
    const { name, description, visibility } = req.body;
    if (!name) {
      return res.status(400).json({ error: '仓库名不能为空' });
    }
    const id = repoService.createRepository(name, req.user.id, description, visibility);
    res.status(201).json({ id, name, description, visibility: visibility || 'public' });
  } catch (error) {
    next(error);
  }
});

router.get('/', authMiddleware, (req, res, next) => {
  try {
    const repos = repoService.getUserRepositories(req.user.id);
    res.json(repos);
  } catch (error) {
    next(error);
  }
});

// 获取所有公开的仓库列表（带分页和搜索）
router.get('/all', (req, res, next) => {
  try {
    const db = dbManager.getDb();
    const { search = '', page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // 获取当前用户信息
    const userId = req.user?.id || req.apiKeyUser?.id;
    const isAdmin = req.user?.isAdmin || req.apiKeyUser?.isAdmin;

    let whereClause = 'WHERE 1=1';
    const params = [];

    // 根据用户权限过滤
    if (isAdmin) {
      // 管理员可以看到所有
    } else if (userId) {
      // 登录用户可以看到 public、restricted 和自己的 private
      whereClause += ` AND (r.visibility IS NULL OR r.visibility = 'public' OR r.visibility = 'restricted' OR (r.visibility = 'private' AND r.user_id = ?))`;
      params.push(userId);
    } else {
      // 未登录只能看到 public
      whereClause += ` AND (r.visibility IS NULL OR r.visibility = 'public')`;
    }

    // 搜索条件
    if (search) {
      whereClause += ' AND (r.name LIKE ? OR r.description LIKE ? OR u.username LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // 获取总数
    const countStmt = db.prepare(`
      SELECT COUNT(*) as total
      FROM repositories r
      LEFT JOIN users u ON r.user_id = u.id
      ${whereClause}
    `);
    const { total } = countStmt.get(...params);

    // 获取分页数据
    const dataStmt = db.prepare(`
      SELECT r.id, r.name, r.description, r.visibility, r.api_calls, r.created_at, u.username,
             COUNT(DISTINCT q.id) as quote_count
      FROM repositories r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN quotes q ON r.id = q.repository_id
      ${whereClause}
      GROUP BY r.id
      ORDER BY r.api_calls DESC, r.created_at DESC
      LIMIT ? OFFSET ?
    `);
    const repos = dataStmt.all(...params, parseInt(limit), offset);

    res.json({
      data: repos,
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

router.get('/:id', (req, res, next) => {
  try {
    const repo = repoService.getRepositoryWithStats(parseInt(req.params.id));
    if (!repo) {
      return res.status(404).json({ error: '仓库不存在' });
    }

    // 检查访问权限
    const visibility = repo.visibility || 'public';
    const userId = req.user?.id || req.apiKeyUser?.id;
    const isAdmin = req.user?.isAdmin || req.apiKeyUser?.isAdmin;

    // public: 任何人都可以访问
    if (visibility === 'public') {
      return res.json(repo);
    }

    // restricted: 需要登录或有效的 API KEY
    if (visibility === 'restricted') {
      if (userId) {
        return res.json(repo);
      }
      return res.status(401).json({ error: '此仓库需要提供有效的 API KEY 才能访问' });
    }

    // private: 只有创建者或管理员可以访问
    if (visibility === 'private') {
      if (userId === repo.user_id || isAdmin) {
        return res.json(repo);
      }
      return res.status(403).json({ error: '此仓库为私有，只有创建者可以访问' });
    }

    return res.status(403).json({ error: '无权访问此资源' });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authMiddleware, (req, res, next) => {
  try {
    const { name, description, visibility } = req.body;
    repoService.updateRepository(parseInt(req.params.id), req.user.id, { name, description, visibility });
    res.json({ message: '仓库更新成功' });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authMiddleware, (req, res, next) => {
  try {
    repoService.deleteRepository(parseInt(req.params.id), req.user.id);
    res.json({ message: '仓库删除成功' });
  } catch (error) {
    next(error);
  }
});

export default router;
