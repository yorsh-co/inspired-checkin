import { setupQr } from '../../../../modules/qr.js';
import utils from '../../../../modules/utils/index.js';

import pageDom from '../dom.js';
import inputs from '../ui/inputs.js';
import { runSuccessFlow } from '../steps/success.step.js';
import { onQrScan } from '../steps/qr.step.js';
import { populateStepValues } from '../ui/values.js';
import ui from '../../../../modules/ui/index.js';

const stepConfig = {
  ticket: {
    next: ['verification'],

    el: pageDom.steps.ticket,
    focusTarget: pageDom.inputs.ticketCode,

    async onEnter(_state, { skeleton }) {
      if (skeleton) {
        ui.skeleton.render(pageDom.steps.ticket);
        return;
      }

      ui.skeleton.clear(pageDom.steps.ticket);

      inputs.ticketCode.setup();
      inputs.ticketCode.start();
    },
  },

  verification: {
    next: ['qr', 'success'],

    el: pageDom.steps.verification,
    focusTarget: pageDom.inputs.verificationCode,

    async onEnter(state, { skeleton }) {
      const { userData } = state;

      if (skeleton) {
        ui.skeleton.render(pageDom.steps.verification);
        return;
      }

      if (!userData) {
        throw new Error('User data is missing');
      }
      console.error('OK!!!')

      ui.skeleton.clear(pageDom.steps.verification);

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

    el: pageDom.steps.qr,

    async onEnter(state) {
      setupQr({
        // TODO: review
        qrReaderDiv: pageDom.qr.reader,
        startCameraBtn: pageDom.qr.startBtn,
        hintDiv: pageDom.qr.hint,
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
    el: pageDom.steps.success,

    async onEnter() {
      await runSuccessFlow();
    },
  },
};

export default stepConfig;
