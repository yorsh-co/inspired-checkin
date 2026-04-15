import { CheckinSteps } from './checkin.steps.js';

export const validateStep = (session, step) => {
  switch (step) {
    case CheckinSteps.TICKET: {
      return true;
    }

    case CheckinSteps.VERIFICATION: {
      if (!session.progress.ticket) {
        throw new Error('Cannot verify without ticket');
      }
      return true;
    }

    case CheckinSteps.QR: {
      console.log(session.source);
      if (!session.progress.verified && session.source !== 'qr') {
        throw new Error('QR requires verified ticket');
      }
      return true;
    }

    default: {
      return true;
    }
  }
};

export const applyStep = (session, step, payload = {}) => {
  const progress = session.progress;

  validateStep(session, step);

  const updated = {
    ...session,
    progress: { ...progress },
    lastUpdatedAt: Date.now(),
  };

  switch (step) {
    case CheckinSteps.TICKET:
      updated.progress.ticket = true;
      updated.ticketId = payload.ticketId;
      break;

    case CheckinSteps.VERIFICATION:
      updated.progress.verified = true;
      break;

    case CheckinSteps.QR:
      updated.progress.qr = true;
      updated.eventId = payload.eventId;
      break;
  }

  updated.currentStep = getNextStep(updated.progress);

  return updated;
};

export const getNextStep = (progress) => {
  if (!progress.ticket) return CheckinSteps.TICKET;
  if (!progress.verified) return CheckinSteps.VERIFICATION;
  if (!progress.qr) return CheckinSteps.QR;
  return CheckinSteps.SUCCESS;
};

export const isComplete = (progress) => {
  return progress.ticket && progress.verified && progress.qr;
};
