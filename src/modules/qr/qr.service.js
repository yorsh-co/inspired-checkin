import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

/**
 *
 * @param {*} payload Example: { type: 'event_checkin', eventId: 'evt_123456', scope: 'public_qr', version: 1, nbf: 1750000000, exp: 1750030000 }
 * @param {*} options Example: { audience: 'qr' || 'auth' || 'api' || 'password_reset' }
 * @returns
 */
const generateToken = (payload, options = {}) => {
  return jwt.sign(payload, env.qrSecret, {
    issuer: env.jwtIssuer,
    audience: options.audience || 'qr',
    ...options,
  });
};

/**
 *
 * @param {*} path
 * @param {*} token
 * @param {*} options
 * @returns
 */
const generateUrl = (path, token, options = {}) =>
  `${options.baseUrl || env.appUrl}${path}?token=${token}`;

/**
 *
 * @param {*} token
 * @param {*} options
 * @returns
 */
const verify = (token, options = {}) => {
  try {
    return jwt.verify(token, env.qrSecret, {
      issuer: env.jwtIssuer,
      audience: options.audience || 'qr',
      ...options,
    });
  } catch (err) {
    throw new Error('Invalid or expired QR code');
  }
};

export const qrService = {
  generateToken,
  generateUrl,
  verify,
};
