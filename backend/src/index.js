import express from 'express';
import cors from 'cors';
import dbManager from './config/database.js';
import config from './config/index.js';
import authRoutes from './routes/auth.js';
import repositoryRoutes from './routes/repositories.js';
import quoteRoutes from './routes/quotes.js';
import apiRoutes from './routes/api.js';
import statsRoutes from './routes/stats.js';
import endpointRoutes from './routes/endpoints.js';
import homeRoutes from './routes/home.js';
import apikeyRoutes from './routes/apikeys.js';
import adminRoutes from './routes/admin.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { apiKeyMiddleware } from './middleware/auth.js';

async function startServer() {
  try {
    // 初始化数据库
    await dbManager.initialize();
    console.log('Database initialized successfully');

    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // API KEY 中间件 - 在所有路由之前解析 API KEY
    app.use(apiKeyMiddleware);

    app.use('/auth', authRoutes);
    app.use('/repositories', repositoryRoutes);
    app.use('/quotes', quoteRoutes);
    app.use('/api', apiRoutes);
    app.use('/stats', statsRoutes);
    app.use('/endpoints', endpointRoutes);
    app.use('/api/home', homeRoutes);
    app.use('/apikeys', apikeyRoutes);
    app.use('/admin', adminRoutes);

    app.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });

    app.use(notFoundHandler);
    app.use(errorHandler);

    const server = app.listen(config.port, () => {
      console.log(`QuoteAPI server running on port ${config.port}`);
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        dbManager.close();
      });
    });

    return app;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
