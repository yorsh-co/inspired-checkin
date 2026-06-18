import { hashUA } from '../../shared/utils/hash.js';

export const createAdminSession = (req) => ({
  type: 'admin',

  version: 1,

  ua: hashUA(req.headers['user-agent']),
});
