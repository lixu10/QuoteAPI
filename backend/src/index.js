import express from 'express';
import cors from 'cors';
import dbManager from './config/database.js';
import config from './config/index.js';
import authRoutes from './routes/auth.js';
import repositoryRoutes from './routes/repositories.js';
import quoteRoutes from './routes/quotes.js';
import apiRoutes from './routes/api.js';
import statsRoutes from './routes/stats.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

async function startServer() {
  try {
    // 初始化数据库
    await dbManager.initialize();
    console.log('Database initialized successfully');

    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use('/auth', authRoutes);
    app.use('/repositories', repositoryRoutes);
    app.use('/quotes', quoteRoutes);
    app.use('/api', apiRoutes);
    app.use('/stats', statsRoutes);

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
