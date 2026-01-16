import express from 'express';
import { QuoteService } from '../services/QuoteService.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const quoteService = new QuoteService();

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
