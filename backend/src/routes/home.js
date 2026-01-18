import express from 'express';
import { HomeShowcaseService } from '../services/HomeShowcaseService.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { getClientIp } from '../utils/getClientIp.js';

const router = express.Router();
const showcaseService = new HomeShowcaseService();

// 公开API：获取首页展示数据
router.get('/data', async (req, res, next) => {
  try {
    const requestData = {
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'],
      referer: req.headers.referer || req.headers.referrer
    };

    const data = await showcaseService.getShowcaseData(requestData);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// 管理员API：获取当前配置
router.get('/config', authMiddleware, adminMiddleware, (req, res, next) => {
  try {
    const config = showcaseService.getShowcaseConfig();
    res.json(config || { hasShowcase: false });
  } catch (error) {
    next(error);
  }
});

// 管理员API：获取可用的仓库列表
router.get('/repositories', authMiddleware, adminMiddleware, (req, res, next) => {
  try {
    const repos = showcaseService.getAvailableRepositories();
    res.json(repos);
  } catch (error) {
    next(error);
  }
});

// 管理员API：获取可用的端口列表
router.get('/endpoints', authMiddleware, adminMiddleware, (req, res, next) => {
  try {
    const endpoints = showcaseService.getAvailableEndpoints();
    res.json(endpoints);
  } catch (error) {
    next(error);
  }
});

// 管理员API：设置展示配置
router.post('/set', authMiddleware, adminMiddleware, (req, res, next) => {
  try {
    const { sourceType, sourceName } = req.body;

    if (!sourceType || !sourceName) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    if (!['repository', 'endpoint'].includes(sourceType)) {
      return res.status(400).json({ error: '无效的来源类型' });
    }

    const id = showcaseService.setShowcase(sourceType, sourceName);
    res.json({ message: '设置成功', id });
  } catch (error) {
    next(error);
  }
});

// 管理员API：清除展示配置
router.post('/clear', authMiddleware, adminMiddleware, (req, res, next) => {
  try {
    showcaseService.clearShowcase();
    res.json({ message: '已清除展示配置' });
  } catch (error) {
    next(error);
  }
});

export default router;
