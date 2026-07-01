import { ConflictError } from '../../shared/errors/app-error.js';

/** @import { CheckinSession } from '../../types/session.js' */
/** @import { CheckinStep, CheckinProgress } from '../../types/checkin.js' */

/**
 *
 * @param {CheckinSession} session
 * @param {CheckinStep} step
 * @param {Object} [payload={}]
 *
 * @returns {CheckinSession}
 */
export const applyStep = (session, step, payload = {}) => {
  const progress = session.progress;

  validateStep(session, step);

  const now = Date.now();

  /** @type {CheckinSession} */
  const updated = {
    ...session,
    ...payload,

    progress: { ...progress },

    ticket: { ...session.ticket, ...payload.ticket },
    verification: { ...session.verification, ...payload.verification },
    qr: { ...session.qr, ...payload.qr },

    updatedAt: now,
  };

  switch (step) {
    case 'ticket': {
      updated.progress.ticket = true;
      updated.ticket.timestamp = now;

      // if the user already checked in, set the qr step to true so it is skipped
      if (updated.checkinComplete && !updated.progress.qr) {
        updated.progress.qr = true;
      }
      break;
    }
    case 'verification': {
      updated.progress.verified = true;
      updated.verification.timestamp = now;
      break;
    }
    case 'qr': {
      updated.progress.qr = true;
      updated.qr.timestamp = now;
      break;
    }
  }

  updated.currentStep = getNextStep(updated.progress);

  return updated;
};

/**
 *
 * @param {CheckinSession} session
 * @param {CheckinStep} step
 */
export const validateStep = (session, step) => {
  switch (step) {
    case 'ticket': {
      return;
    }

    case 'verification': {
      if (!session.progress.ticket) {
        throw new ConflictError('Cannot verify without a validated ticket');
      }
      return;
    }

    case 'qr': {
      if (!session.progress.verified && session.source !== 'qr') {
        throw new ConflictError('QR scan requires a verified ticket');
      }
      return;
    }

    default: {
      return;
    }
  }
};

/**
 *
 * @param {CheckinProgress} progress
 * @returns {CheckinStep}
 */
export const getNextStep = (progress) => {
  if (!progress.ticket) return 'ticket';
  if (!progress.verified) return 'verification';
  if (!progress.qr) return 'qr';
  return 'success';
};

/**
 *
 * @param {CheckinProgress} progress
 * @returns {Boolean}
 */
export const isComplete = (progress) => {
  return progress.ticket && progress.verified && progress.qr;
};
