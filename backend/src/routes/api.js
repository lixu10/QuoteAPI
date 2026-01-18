import express from 'express';
import { ApiService } from '../services/ApiService.js';
import { getClientIp } from '../utils/getClientIp.js';
import { Repository } from '../models/Repository.js';

const router = express.Router();
const apiService = new ApiService();
const repoModel = new Repository();

// 检查仓库访问权限的辅助函数
function checkRepoAccess(req, repo) {
  if (!repo) {
    return { allowed: false, error: '仓库不存在', status: 404 };
  }

  const visibility = repo.visibility || 'public';

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
      error: '此仓库需要提供有效的 API KEY 才能访问',
      status: 401
    };
  }

  // private: 只有创建者可以访问
  if (visibility === 'private') {
    if (userId === repo.user_id || isAdmin) {
      return { allowed: true };
    }
    return {
      allowed: false,
      error: '此仓库为私有，只有创建者可以访问',
      status: 403
    };
  }

  return { allowed: false, error: '无权访问此资源', status: 403 };
}

router.get('/random/:repoName', (req, res, next) => {
  try {
    const repo = repoModel.findByName(req.params.repoName);

    // 检查访问权限
    const accessCheck = checkRepoAccess(req, repo);
    if (!accessCheck.allowed) {
      return res.status(accessCheck.status).json({ error: accessCheck.error });
    }

    const referer = req.headers.referer || req.headers.referrer;
    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'];

    const result = apiService.getRandomQuote(
      req.params.repoName,
      referer,
      ipAddress,
      userAgent
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/quote/:id', (req, res, next) => {
  try {
    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'];

    const quote = apiService.getQuoteDetails(
      parseInt(req.params.id),
      ipAddress,
      userAgent
    );

    // 获取仓库并检查访问权限
    const repo = repoModel.findById(quote.repository_id);
    const accessCheck = checkRepoAccess(req, repo);
    if (!accessCheck.allowed) {
      return res.status(accessCheck.status).json({ error: accessCheck.error });
    }

    res.json(quote);
  } catch (error) {
    next(error);
  }
});

router.get('/stats/:repoId', (req, res, next) => {
  try {
    const repo = repoModel.findById(parseInt(req.params.repoId));

    // 检查访问权限
    const accessCheck = checkRepoAccess(req, repo);
    if (!accessCheck.allowed) {
      return res.status(accessCheck.status).json({ error: accessCheck.error });
    }

    const stats = apiService.getRepositoryStats(parseInt(req.params.repoId));
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

export default router;
