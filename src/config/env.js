import 'dotenv/config';

const required = [];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

export const env = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  appUrl: process.env.APP_URL,
  appTitle: process.env.APP_TITLE,

  eventId: process.env.EVENT_ID,
  checkinQrToken: process.env.CHECKIN_QR_TOKEN,

  sessionTtl: {
    checkin: process.env.CHECKIN_SESSION_TTL || 600,
    user: process.env.USER_SESSION_TTL || 3600,
    admin: process.env.ADMIN_SESSION_TTL || 3600,
  },

  postgresConfig: {
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
  },

  redisConfig: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
  },

  captcha: {
    siteKey: process.env.TURNSTILE_SITE_KEY,
    secret: process.env.TURNSTILE_SECRET,
  },
};
