import 'dotenv/config';

const required = ['AUTH_SECRET', 'QR_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

export const env = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  authSecret: process.env.AUTH_SECRET,
  qrSecret: process.env.QR_SECRET,
  sessionTtl: process.env.SESSION_TTL || 600,
  dbUrl: process.env.DATABASE_URL,
  redisHost: process.env.REDIS_HOST || localhost,
  redisPort: process.env.REDIS_PORT || 6379
};
