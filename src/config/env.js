import 'dotenv/config';

if (!process.env.JWT_SECRET) {
  throw new Error('Missing JWT_SECRET');
}

export const env = {
  jwtSecret: process.env.JWT_SECRET,
  port: process.env.PORT || 3000
};
