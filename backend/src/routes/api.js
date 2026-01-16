import express from 'express';
import { ApiService } from '../services/ApiService.js';

const router = express.Router();
const apiService = new ApiService();

router.get('/random/:repoName', (req, res, next) => {
  try {
    const referer = req.headers.referer || req.headers.referrer;
    const ipAddress = req.ip || req.connection.remoteAddress;
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
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const quote = apiService.getQuoteDetails(
      parseInt(req.params.id),
      ipAddress,
      userAgent
    );
    res.json(quote);
  } catch (error) {
    next(error);
  }
});

router.get('/stats/:repoId', (req, res, next) => {
  try {
    const stats = apiService.getRepositoryStats(parseInt(req.params.repoId));
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

export default router;
