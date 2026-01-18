import express from 'express';
import { QuoteService } from '../services/QuoteService.js';
import { authMiddleware } from '../middleware/auth.js';
import { Repository } from '../models/Repository.js';

const router = express.Router();
const quoteService = new QuoteService();
const repoModel = new Repository();

// 检查仓库访问权限的辅助函数
function checkRepoAccess(req, repo) {
  if (!repo) {
    return { allowed: false, error: '仓库不存在', status: 404 };
  }

  const visibility = repo.visibility || 'public';
  const userId = req.user?.id || req.apiKeyUser?.id;
  const isAdmin = req.user?.isAdmin || req.apiKeyUser?.isAdmin;

  if (visibility === 'public') {
    return { allowed: true };
  }

  if (visibility === 'restricted') {
    if (userId) {
      return { allowed: true };
    }
    return { allowed: false, error: '此仓库需要提供有效的 API KEY 才能访问', status: 401 };
  }

  if (visibility === 'private') {
    if (userId === repo.user_id || isAdmin) {
      return { allowed: true };
    }
    return { allowed: false, error: '此仓库为私有，只有创建者可以访问', status: 403 };
  }

  return { allowed: false, error: '无权访问此资源', status: 403 };
}

router.post('/', authMiddleware, (req, res, next) => {
  try {
    const { repositoryId, content } = req.body;
    if (!repositoryId || !content) {
      return res.status(400).json({ error: '仓库ID和内容不能为空' });
    }
    const id = quoteService.createQuote(parseInt(repositoryId), req.user.id, content);
    res.status(201).json({ id, repositoryId, content });
  } catch (error) {
    next(error);
  }
});

router.get('/repository/:repoId', (req, res, next) => {
  try {
    const repo = repoModel.findById(parseInt(req.params.repoId));
    const accessCheck = checkRepoAccess(req, repo);
    if (!accessCheck.allowed) {
      return res.status(accessCheck.status).json({ error: accessCheck.error });
    }

    const quotes = quoteService.getQuotesByRepository(parseInt(req.params.repoId));
    res.json(quotes);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', (req, res, next) => {
  try {
    const quote = quoteService.getQuoteById(parseInt(req.params.id));
    if (!quote) {
      return res.status(404).json({ error: '语句不存在' });
    }
    res.json(quote);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authMiddleware, (req, res, next) => {
  try {
    const { content } = req.body;
    quoteService.updateQuote(parseInt(req.params.id), req.user.id, content);
    res.json({ message: '语句更新成功' });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authMiddleware, (req, res, next) => {
  try {
    quoteService.deleteQuote(parseInt(req.params.id), req.user.id);
    res.json({ message: '语句删除成功' });
  } catch (error) {
    next(error);
  }
});

export default router;
