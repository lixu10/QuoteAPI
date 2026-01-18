import express from 'express';
import ApiKey from '../models/ApiKey.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 所有路由都需要登录
router.use(authenticateToken);

// 获取当前用户的所有 API KEY
router.get('/', (req, res) => {
  try {
    const keys = ApiKey.getByUserId(req.user.userId);
    // 隐藏完整的 key，只显示前缀
    const safeKeys = keys.map(key => ({
      ...key,
      key_value: key.key_value.substring(0, 12) + '...' + key.key_value.slice(-4)
    }));
    res.json(safeKeys);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({ message: '获取 API KEY 失败' });
  }
});

// 创建新的 API KEY
router.post('/', (req, res) => {
  try {
    const { name } = req.body;
    const newKey = ApiKey.create(req.user.userId, name);
    res.status(201).json({
      message: 'API KEY 创建成功，请保存好您的密钥，它只会显示一次',
      key: newKey
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    res.status(500).json({ message: '创建 API KEY 失败' });
  }
});

// 重命名 API KEY
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updated = ApiKey.rename(parseInt(id), req.user.userId, name);
    if (!updated) {
      return res.status(404).json({ message: 'API KEY 不存在或无权限' });
    }
    res.json({ message: '重命名成功', key: updated });
  } catch (error) {
    console.error('Error renaming API key:', error);
    res.status(500).json({ message: '重命名失败' });
  }
});

// 切换 API KEY 状态
router.post('/:id/toggle', (req, res) => {
  try {
    const { id } = req.params;
    const updated = ApiKey.toggleActive(parseInt(id), req.user.userId);
    if (!updated) {
      return res.status(404).json({ message: 'API KEY 不存在或无权限' });
    }
    res.json({
      message: updated.is_active ? 'API KEY 已启用' : 'API KEY 已禁用',
      key: updated
    });
  } catch (error) {
    console.error('Error toggling API key:', error);
    res.status(500).json({ message: '操作失败' });
  }
});

// 删除 API KEY
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = ApiKey.delete(parseInt(id), req.user.userId);
    if (!deleted) {
      return res.status(404).json({ message: 'API KEY 不存在或无权限' });
    }
    res.json({ message: 'API KEY 已删除' });
  } catch (error) {
    console.error('Error deleting API key:', error);
    res.status(500).json({ message: '删除失败' });
  }
});

export default router;
