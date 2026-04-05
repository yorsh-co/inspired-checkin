import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const issueToken = payload => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '2h'
  });
};

export { issueToken };
