import express from 'express';
import { StatsService } from '../services/StatsService.js';
import { authMiddleware } from '../middleware/auth.js';
import { Repository } from '../models/Repository.js';

const router = express.Router();
const statsService = new StatsService();
const repoModel = new Repository();

// 获取仓库的综合统计数据（需要认证，且只能查看自己的仓库）
router.get('/repository/:id', authMiddleware, (req, res, next) => {
  try {
    const repoId = parseInt(req.params.id);
    const repo = repoModel.findById(repoId);

    if (!repo) {
      return res.status(404).json({ error: '仓库不存在' });
    }

    // 检查权限：只有仓库创建者可以查看统计
    if (repo.user_id !== req.user.id) {
      return res.status(403).json({ error: '无权访问此仓库的统计数据' });
    }

    const stats = statsService.getComprehensiveStats(repoId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

export default router;
