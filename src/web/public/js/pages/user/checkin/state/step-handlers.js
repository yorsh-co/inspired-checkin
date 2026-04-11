import { inputs } from '../ui/inputs.js';
import { stepNames } from '../ui/navigation.js';
import { store } from './store.js';
import { runSuccessFlow } from '../steps/success.step.js';
import { populateVerificationValues } from '../steps/verification.step.js';

const stepHandlers = {
  [stepNames.ticket]: async () => {
    inputs.ticketCode.setup();
    inputs.ticketCode.start();
  },

  [stepNames.verification]: async (state) => {
    const { userData } = state;

    if (!userData) {
      throw new Error('User data is missing');
    }

    populateVerificationValues(userData);

    inputs.verificationCode.setup();
    inputs.verificationCode.start();
  },

  [stepNames.qr]: async () => {
    setupQr({
      qrReaderId: 'checkin-qr-reader',
      startCameraBtn: document.querySelector(
        '[data-checkin="start-camera-btn"]',
      ),
      hintDiv: document.querySelector('[data-checkin="qr-hint-div"]'),
      onScan: onQrScan,
    });
  },

  [stepNames.success]: async () => {
    await runSuccessFlow();
  },
};

export const setupStepHandlers = () => {
  let prevStep = null;

  store.subscribe(async (state) => {
    const currentStep = state.currentStep;

    if (currentStep === prevStep) return;

    const handler = stepHandlers[currentStep];

    if (!handler) {
      console.warn(`[Step] No handler for step: ${currentStep}`);
      prevStep = currentStep;
      return;
    }

    try {
      await handler(state);
    } catch (err) {
      console.error('[Step Error]', err);

      store.setState({
        error: err.message || 'Unexpected error',
      });
    }

    prevStep = currentStep;
  });
};
