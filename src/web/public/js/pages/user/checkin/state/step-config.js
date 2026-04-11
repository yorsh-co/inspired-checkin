import { setupQr } from '../../../../modules/qr.js';

import dom from '../dom.js';
import inputs from '../ui/inputs.js';
import { runSuccessFlow } from '../steps/success.step.js';
import { populateVerificationValues } from '../steps/verification.step.js';
import { onQrScan } from '../steps/qr.step.js';

const stepConfig = {
  ticket: {
    next: ['verification'],

    el: dom.steps.ticket,
    focusTarget: dom.inputs.ticketCode,

    async onEnter() {
      inputs.ticketCode.setup();
      inputs.ticketCode.start();
    },
  },

  verification: {
    next: ['qr', 'success'],

    el: dom.steps.verification,
    focusTarget: dom.inputs.verificationCode,

    async onEnter(state) {
      const { userData } = state;

      if (!userData) {
        throw new Error('User data is missing');
      }

      populateVerificationValues(userData);

      // TODO: setup back button

      inputs.verificationCode.setup();
      inputs.verificationCode.start();
    },
  },

  qr: {
    next: ['ticket', 'verification', 'success'],

    el: dom.steps.qr,

    async onEnter() {
      setupQr({
        // TODO: review
        qrReaderDiv: dom.qr.reader,
        startCameraBtn: dom.qr.startBtn,
        hintDiv: dom.qr.hint,
        onScan: onQrScan,
      });
    },
  },

  success: {
    el: dom.steps.success,

    async onEnter() {
      await runSuccessFlow();
    },
  },
};

export default stepConfig;
