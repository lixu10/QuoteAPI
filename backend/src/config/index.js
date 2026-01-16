import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 3077,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key',
  dbPath: process.env.DB_PATH || './data/quoteapi.db',
  env: process.env.NODE_ENV || 'development'
};
