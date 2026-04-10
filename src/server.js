import './config/env.js';
import app from './app.js';
import { env } from './config/env.js';
import redis, { initRedis, checkRedis } from './shared/db/redis.js';

const start = async () => {
  try {
    initRedis();
    await redis.connect();
    await checkRedis();

    app.listen(env.port || 3000, () => {
      console.log(`Server running on port ${env.port || 3000}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
