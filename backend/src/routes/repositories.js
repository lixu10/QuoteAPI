import express from 'express';
import { RepositoryService } from '../services/RepositoryService.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const repoService = new RepositoryService();

router.post('/', authMiddleware, (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: '仓库名不能为空' });
    }
    const id = repoService.createRepository(name, req.user.id, description);
    res.status(201).json({ id, name, description });
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

router.get('/all', (req, res, next) => {
  try {
    const repos = repoService.getAllRepositories();
    res.json(repos);
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
    res.json(repo);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authMiddleware, (req, res, next) => {
  try {
    const { name, description } = req.body;
    repoService.updateRepository(parseInt(req.params.id), req.user.id, { name, description });
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
