/** @import { CheckinSession } from '../../types/session.js' */
/** @import { CheckinStep } from '../../types/checkin.js' */

const LOCKOUT_THRESHOLDS = {
  ticket: 5,
  verification: 5,
  qr: 10,
};

/**
 *
 * @param {CheckinSession} session
 * @param {CheckinStep} step
 *
 * @returns {CheckinSession}
 */
export const recordFailedAttempt = (session, step) => {
  const failedAttempts = {
    ...session.failedAttempts,
    [step]: (session.failedAttempts?.[step] || 0) + 1,
  };

  const captchaRequired =
    session.captchaRequired || failedAttempts[step] >= LOCKOUT_THRESHOLDS[step];

  return {
    ...session,
    failedAttempts,
    captchaRequired,
    updatedAt: Date.now(),
  };
};

/**
 * @param {CheckinSession} session
 * @returns {CheckinSession}
 */
export const clearCaptchaRequirement = (session) => ({
  ...session,
  captchaRequired: false,
  failedAttempts: {},
  updatedAt: Date.now(),
});
