import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// Generate QR token (used when creating QR codes)
const generate = ({ eventId }) => {
  return jwt.sign(
    { eventId },
    env.qrSecret,
    { expiresIn: '2h' } // adjust as needed
  );
};

// Verify QR token (used in /scan)
const verify = token => {
  try {
    return jwt.verify(token, env.qrSecret);
  } catch (err) {
    throw new Error('Invalid or expired QR code');
  }
};

export { generate, verify };
