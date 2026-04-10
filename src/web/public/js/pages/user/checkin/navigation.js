import * as ui from '../../../modules/ui.js';
import * as utils from '../../../modules/utils.js';
import { store } from './store.js';

const stepMap = {
  qr: '[data-checkin="qr-step"]',
  ticket: '[data-checkin="ticket-step"]',
  verification: '[data-checkin="verification-step"]',
  success: '[data-checkin="success-step"]',
};

const inputMap = {
  ticket: '[data-checkin="ticket-input"]',
  verification: '[data-checkin="verification-input"]',
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
