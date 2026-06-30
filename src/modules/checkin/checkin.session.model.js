import { hashUA } from '../../shared/utils/hash.js';

/** @import { CheckinSession } from '../../types/session.js' */

/**
 *
 * @param {Object} req
 * @returns {CheckinSession}
 */
export const createCheckinSession = (req) => ({
  type: 'checkin',
  version: 1,
  progress: { qr: false, ticket: false, verified: false },
  currentStep: 'init',
  source: 'direct',

  userId: null,
  eventId: null,

  checkinAt: null,
  checkinNumber: null,
  checkinComplete: null,

  ticket: {},
  verification: {},
  qr: {},

  userPreview: {},

  failedAttempts: {
    ticket: 0,
    verification: 0,
    qr: 0,
  },
  captchaRequired: false,

  ua: hashUA(req.headers['user-agent']),

  updatedAt: null,
  createdAt: new Date(),
});
