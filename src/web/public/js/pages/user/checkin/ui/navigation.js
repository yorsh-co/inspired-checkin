import * as ui from '../../../../modules/ui.js';
import * as utils from '../../../../modules/utils.js';
import { store } from '../state/store.js';

export const stepNames = {
  qr: 'qr',
  ticket: 'ticket',
  verification: 'verification',
  success: 'success',
};

const stepMap = {
  qr: '[data-checkin="qr-step"]',
  ticket: '[data-checkin="ticket-step"]',
  verification: '[data-checkin="verification-step"]',
  success: '[data-checkin="success-step"]',
};

export const inputMap = {
  ticket: '[data-checkin="ticket-code-input"]',
  verification: '[data-checkin="verification-code-input"]',
};

export const goToStep = async (nextStep) => {
  const { currentStep } = store.getState();

  if (currentStep === nextStep) return;

  const nextEl = document.querySelector(stepMap[nextStep]);
  const currentEl = currentStep
    ? document.querySelector(stepMap[currentStep])
    : null;

  await ui.showStep(nextEl, currentEl);

  store.setState({ currentStep: nextStep });

  if (utils.isDesktop()) {
    const input = inputMap[nextStep];
    if (input) ui.focusInput({ q: input });
  }
};
