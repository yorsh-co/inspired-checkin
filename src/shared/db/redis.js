import Redis from 'ioredis';
import { env } from '../../config/env.js';

const redis = new Redis({
  host: env.redisHost,
  port: env.redisPort,
  lazyConnect: true
});

export default redis;
