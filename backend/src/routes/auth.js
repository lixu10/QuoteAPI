import express from 'express';
import { AuthService } from '../services/AuthService.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();
const authService = new AuthService();

router.post('/register', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    const user = await authService.register(username, password);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/users', authMiddleware, adminMiddleware, (req, res, next) => {
  try {
    const users = authService.getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    await authService.deleteUser(parseInt(req.params.id));
    res.json({ message: '用户删除成功' });
  } catch (error) {
    next(error);
  }
});

export default router;
