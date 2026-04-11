import { setupQr } from '../../../../modules/qr.js';
import utils from '../../../../modules/utils/index.js';

import dom from '../dom.js';
import inputs from '../ui/inputs.js';
import { runSuccessFlow } from '../steps/success.step.js';
import { onQrScan } from '../steps/qr.step.js';
import { populateStepValues } from '../ui/values.js';

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

      populateStepValues('verification', userData, {
        formatters: {
          phoneStart: (value) => utils.formatPhone.locale(value, 'pt-BR'),
        },
      });

      // TODO: setup back button

      inputs.verificationCode.setup();
      inputs.verificationCode.start();
    },
  },

  qr: {
    next: ['ticket', 'verification', 'success'],

    el: dom.steps.qr,

    async onEnter(state) {
      setupQr({
        // TODO: review
        qrReaderDiv: dom.qr.reader,
        startCameraBtn: dom.qr.startBtn,
        hintDiv: dom.qr.hint,
        onScan: onQrScan,
      });

      const { userData } = state;

      if (!userData) {
        throw new Error('User data is missing');
      }

      populateStepValues('qr', userData, {
        formatters: {
          phoneStart: (value) => utils.formatPhone.locale(value, 'pt-BR'),
        },
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
