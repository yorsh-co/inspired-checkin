import { setupQr } from '../../../../modules/qr.js';
import utils from '../../../../modules/utils/index.js';

import dom from '../dom.js';
import inputs from '../ui/inputs.js';
import { goToStep } from '../ui/navigation.js';
import { runSuccessFlow } from '../steps/success.step.js';
import { onQrScan } from '../steps/qr.step.js';
import { populateStepValues } from '../ui/values.js';
import ui from '../../../../modules/ui/index.js';

const stepConfig = {
  ticket: {
    next: ['verification'],

    el: dom.steps.ticket,
    focusTarget: dom.inputs.ticketCode,

    async onEnter(_state, { skeleton }) {
      if (skeleton) {
        ui.skeleton.render(dom.steps.ticket);
        return;
      }

      ui.skeleton.clear(dom.steps.ticket);

      ui.hint.clearAll(dom.ticket.hint);

      inputs.ticketCode.setup();
      inputs.ticketCode.start();
    },
    
    async onExit() {
      // FIXME: reset inputs
      // FIXME: ADD SKELETON CLASS BACK??
      inputs.ticketCode.setup();
      inputs.ticketCode.stop();
      
      ui.skeleton.render(dom.steps.ticket);
    }
  },

  verification: {
    next: ['ticket', 'qr', 'success'],

    el: dom.steps.verification,
    focusTarget: dom.inputs.verificationCode,

    async onEnter(state, { skeleton }) {
      const { userData } = state;

      if (skeleton) {
        ui.skeleton.render(dom.steps.verification);
        return;
      }

      if (!userData) {
        throw new Error('User data is missing');
      }

      ui.skeleton.clear(dom.steps.verification);

      populateStepValues('verification', userData, {
        formatters: {
          phoneStart: value => utils.formatPhone.locale(value, 'pt-BR')
        }
      });

      if (dom.verification.backBtn) {
        dom.verification.backBtn.onclick = () => goToStep('ticket');
      } else {
        console.warn('[Verification] back button not found');
      }

      ui.hint.clearAll(dom.ticket.hint);

      inputs.verificationCode.setup();
      inputs.verificationCode.start();
    },

    async onExit() {
      // FIXME: reset inputs
      // FIXME: ADD SKELETON CLASS BACK??
      inputs.verificationCode.setup();
      inputs.verificationCode.stop();
      
      ui.skeleton.render(dom.steps.verification);
    }
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
    el: dom.steps.success,

    async onEnter() {
      await runSuccessFlow();
    }
  }
};

export default stepConfig;
