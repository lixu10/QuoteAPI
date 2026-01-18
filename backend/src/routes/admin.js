import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { Repository } from '../models/Repository.js';
import { Endpoint } from '../models/Endpoint.js';
import dbManager from '../config/database.js';

const router = express.Router();
const repoModel = new Repository();
const endpointModel = new Endpoint();

// 所有路由都需要管理员权限
router.use(authMiddleware);
router.use(adminMiddleware);

// 获取所有仓库（包含用户信息）
router.get('/repositories', (req, res) => {
  try {
    const db = dbManager.getDb();
    const stmt = db.prepare(`
      SELECT r.*, u.username,
             COUNT(DISTINCT q.id) as quote_count
      FROM repositories r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN quotes q ON r.id = q.repository_id
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `);
    const repos = stmt.all();
    res.json(repos);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({ error: '获取仓库列表失败' });
  }
});

// 获取所有端口（包含用户信息）
router.get('/endpoints', (req, res) => {
  try {
    const db = dbManager.getDb();
    const stmt = db.prepare(`
      SELECT e.*, u.username
      FROM endpoints e
      LEFT JOIN users u ON e.user_id = u.id
      ORDER BY e.created_at DESC
    `);
    const endpoints = stmt.all();
    res.json(endpoints);
  } catch (error) {
    console.error('Error fetching endpoints:', error);
    res.status(500).json({ error: '获取端口列表失败' });
  }
});

// 更新仓库的 visibility
router.put('/repositories/:id/visibility', (req, res) => {
  try {
    const { id } = req.params;
    const { visibility } = req.body;

    if (!['public', 'restricted', 'private'].includes(visibility)) {
      return res.status(400).json({ error: '无效的可见性设置' });
    }

    const repo = repoModel.findById(parseInt(id));
    if (!repo) {
      return res.status(404).json({ error: '仓库不存在' });
    }

    repoModel.update(parseInt(id), { visibility });
    res.json({ message: '更新成功', visibility });
  } catch (error) {
    console.error('Error updating repository visibility:', error);
    res.status(500).json({ error: '更新失败' });
  }
});

// 更新端口的 visibility
router.put('/endpoints/:id/visibility', (req, res) => {
  try {
    const { id } = req.params;
    const { visibility } = req.body;

    if (!['public', 'restricted', 'private'].includes(visibility)) {
      return res.status(400).json({ error: '无效的可见性设置' });
    }

    const endpoint = endpointModel.findById(parseInt(id));
    if (!endpoint) {
      return res.status(404).json({ error: '端口不存在' });
    }

    endpointModel.updateEndpoint(parseInt(id), { visibility });
    res.json({ message: '更新成功', visibility });
  } catch (error) {
    console.error('Error updating endpoint visibility:', error);
    res.status(500).json({ error: '更新失败' });
  }
});

// 删除仓库（管理员）
router.delete('/repositories/:id', (req, res) => {
  try {
    const { id } = req.params;
    const repo = repoModel.findById(parseInt(id));
    if (!repo) {
      return res.status(404).json({ error: '仓库不存在' });
    }
    repoModel.delete(parseInt(id));
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('Error deleting repository:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

// 删除端口（管理员）
router.delete('/endpoints/:id', (req, res) => {
  try {
    const { id } = req.params;
    const endpoint = endpointModel.findById(parseInt(id));
    if (!endpoint) {
      return res.status(404).json({ error: '端口不存在' });
    }
    endpointModel.delete(parseInt(id));
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('Error deleting endpoint:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

export default router;
