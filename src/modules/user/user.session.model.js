import { hashUA } from '../../shared/utils/hash.js';

/** @import { UserSession } from '../../types/session.js' */

/**
 *
 * @param {Object} req
 * @returns {UserSession}
 */
export const createUserSession = (req) => ({
  type: 'user',
  version: 1,

  userId: null,
  checkinNumber: null,

  ua: hashUA(req.headers['user-agent']),

  updatedAt: null,
  createdAt: new Date(),
});
