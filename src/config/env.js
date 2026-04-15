import 'dotenv/config';

const required = ['CHECKIN_QR_TOKEN', 'AUTH_SECRET'];

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

  jwtIssuer: process.env.JWT_ISSUER,
  authSecret: process.env.AUTH_SECRET,

  sessionTtl: process.env.SESSION_TTL || 600,

  dbUrl: process.env.DATABASE_URL,

  redisHost: process.env.REDIS_HOST || localhost,
  redisPort: process.env.REDIS_PORT || 6379,
};
