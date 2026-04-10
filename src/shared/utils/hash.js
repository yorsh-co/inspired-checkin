import crypto from 'crypto';

export const hashUA = (ua) =>
  crypto
    .createHash('sha256')
    .update(ua || '')
    .digest('hex');

export const hash = (value) => {
  return crypto.createHash('sha256').update(value).digest('hex');
};
