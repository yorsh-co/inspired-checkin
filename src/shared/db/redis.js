import Redis from 'ioredis';
import { env } from '../../config/env.js';

const redis = new Redis({
  host: env.redisHost,
  port: env.redisPort,
  lazyConnect: true,
});
export default redis;

let initialized = false;

export const initRedis = () => {
  if (initialized) return;

  redis.on('connect', () => console.log('Redis connecting...'));
  redis.on('ready', () => console.log('Redis ready'));
  redis.on('error', (err) => console.error('Redis error:', err));

  initialized = true;
};

export const checkRedis = async () => {
  try {
    await redis.ping();
    console.log('Redis ping successful');
  } catch (err) {
    console.error('Redis ping failed');
    throw err;
  }
};
