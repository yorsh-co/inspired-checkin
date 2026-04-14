import { setupQr } from '../../../../modules/qr.js';
import utils from '../../../../modules/utils/index.js';

import pageDom from '../dom.js';
import inputs from '../ui/inputs.js';
import { goToStep } from '../ui/navigation.js';
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

      ui.hint.clearAll(pageDom.ticket.hint);

      inputs.ticketCode.setup();
      inputs.ticketCode.start();
    },
    
    async onExit() {
      inputs.ticketCode.stop();
    }
  },

  verification: {
    next: ['ticket', 'qr', 'success'],

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
      console.error('OK!!!');

      ui.skeleton.clear(pageDom.steps.verification);

      populateStepValues('verification', userData, {
        formatters: {
          phoneStart: value => utils.formatPhone.locale(value, 'pt-BR')
        }
      });

      if (pageDom.verification.backBtn) {
        pageDom.verification.backBtn.onclick = () => goToStep('ticket');
      } else {
        console.warn('[Verification] back button not found');
      }

      ui.hint.clearAll(pageDom.ticket.hint);

      inputs.verificationCode.setup();
      inputs.verificationCode.start();
    },

    async onExit() {
      inputs.verificationCode.stop();
    }
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
        onScan: onQrScan
      });

      const { userData } = state;

      if (!userData) {
        throw new Error('User data is missing');
      }

      populateStepValues('qr', userData, {
        formatters: {
          phoneStart: value => utils.formatPhone.locale(value, 'pt-BR')
        }
      });
    }
  },

  success: {
    el: pageDom.steps.success,

    async onEnter() {
      await runSuccessFlow();
    }
  }
};

export default stepConfig;
