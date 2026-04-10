import './config/env.js';
import app from './app.js';
import { env } from './config/env.js';
import redis, { initRedis, checkRedis } from './shared/db/redis.js';

const connectRedisWithRetry = async (retries = 5, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      if (redis.status === 'end' || redis.status === 'wait') {
        await redis.connect();
      }

      await redis.ping();

      console.log('Redis ready for commands');
      return;
    } catch (err) {
      console.log(`Redis not ready, retrying... (${i + 1}/${retries})`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }

  throw new Error('Redis failed to become ready after retries');
};

const start = async () => {
  try {
    initRedis();
    await connectRedisWithRetry();

    app.listen(env.port || 3000, () => {
      console.log(`Server running on port ${env.port || 3000}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
