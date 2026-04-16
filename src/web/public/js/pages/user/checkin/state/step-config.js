import { setupQr } from '../../../../modules/qr.js';
import utils from '../../../../modules/utils/index.js';
import ui from '../../../../modules/ui/index.js';
import {
  attachScrollOnFocus,
  attachScrollOnBlur,
} from '../../../../components/input/focus-scroll.js';
import api from '../../../../core/api/index.js';

import dom from '../dom.js';

import { goToStep } from '../ui/navigation.js';
import { runSuccessFlow } from '../steps/success.step.js';
import { onQrScan } from '../steps/qr.step.js';
import { populateStepValues } from '../ui/values.js';
import { onVerificationInput } from '../steps/verification.step.js';
import { onTicketInput } from '../steps/ticket.step.js';
import { formatter } from '../ui/formatters.js';
import {
  setupInput,
  startPlaceholderTyping,
  stopPlaceholderTyping,
} from '../ui/inputs.js';

const stepConfig = {
  ticket: {
    next: ['verification'],

    el: dom.steps.ticket,
    focusTarget: dom.inputs.ticketCode,
    hint: dom.ticket.hint,

    async onEnter(_state, { skeleton }) {
      if (skeleton) {
        ui.skeleton.render(this.el);
        return;
      }

      ui.skeleton.clear(this.el);
      ui.hint.clearAll(dom.ticket.hint);

      // set up input
      const input = dom.inputs.ticketCode;

      setupInput(input, {
        onInput: onTicketInput,
        formatValue: formatter.ticketCode.format,
        valueIsValid: formatter.ticketCode.isValid,
      });

      attachScrollOnFocus(dom.inputs.ticketCode);
      //attachScrollOnBlur(dom.inputs.ticketCode);

      input.disabled = false;

      startPlaceholderTyping(dom.inputs.ticketCode, [
        { text: 'Digite seu código de ingresso...', pause: 1200 },
        { text: 'Cola seu ID do ticket aqui...', pause: 1000 },
        { text: 'Pronto pra a Inspire?', pause: 1400 },
        { text: 'Vamos fazer seu check-in ✨', pause: 1500 },
      ]);

      if (
        !skeleton &&
        utils.isDesktop() &&
        this.focusTarget &&
        !this.focusTarget.disabled
      ) {
        nextStep.focusTarget.focus();
      }
    },

    async onExit() {
      // reset input
      const input = dom.inputs.ticketCode;

      stopPlaceholderTyping(input);

      input.value = '';
      input.disabled = true;
      input.blur();

      // clear the hint
      ui.hint.clearAll(this.hint);

      // reset to skeleton
      ui.skeleton.render(this.el);
    },
  },

  verification: {
    next: ['ticket', 'qr', 'success'],

    el: dom.steps.verification,
    focusTarget: dom.inputs.verificationCode,
    hint: dom.verification.hint,

    async onEnter(state, { skeleton }) {
      const { session } = state;

      if (skeleton) {
        ui.skeleton.render(this.el);
        return;
      }

      if (!session.userPreview) {
        throw new Error('User preview data is missing');
      }

      ui.skeleton.clear(this.el);

      // populate the table
      populateStepValues('verification', session.userPreview, {
        formatters: {
          phoneStart: (value) => utils.formatPhone.locale(value, 'pt-BR'),
        },
      });

      // setup table toggle
      const tableToggle = dom.verification.tableToggle;
      if (tableToggle.dataset.initialized !== 'true') {
        tableToggle.addEventListener('click', () => {
          const isCollapsed =
            dom.verification.tableWrapper.classList.toggle('collapsed');

          dom.verification.tableToggleLabel.textContent = isCollapsed
            ? 'keyboard_arrow_down'
            : 'keyboard_arrow_up';
        });
        tableToggle.dataset.initialized = 'true';
      }
      tableToggle.disabled = false;

      // setup input
      const input = dom.inputs.verificationCode;

      setupInput(input, {
        onInput: onVerificationInput,
        formatValue: formatter.verificationCode.format,
        valueIsValid: formatter.verificationCode.isValid,
      });

      attachScrollOnFocus(dom.inputs.verificationCode);

      input.disabled = false;

      startPlaceholderTyping(dom.inputs.verificationCode, [
        { text: 'Confirme seu celular...', pause: 1200 },
        { text: 'Digite os últimos 4 dígitos...', pause: 1000 },
        { text: 'Digite o final do seu telefone...', pause: 1400 },
        //{ text: 'Vamos fazer seu check-in ✨', pause: 1500 },
      ]);

      // setup back button
      if (dom.verification.backBtn) {
        dom.verification.backBtn.onclick = () => {
          api.checkin.reset();

          goToStep('ticket');
        };
        dom.verification.backBtn.disabled = false;
      }
    },

    async onExit() {
      // reset input
      const input = dom.inputs.verificationCode;

      stopPlaceholderTyping(input);

      input.value = '';
      input.disabled = true;
      input.blur();

      // reset buttons
      dom.verification.backBtn.disabled = true;
      dom.verification.tableToggle.disabled = true;

      // clear the hint
      ui.hint.clearAll(this.hint);

      // reset to skeleton
      ui.skeleton.render(this.el);
    },
  },

  qr: {
    next: ['ticket', 'verification', 'success'],

    el: dom.steps.qr,
    hint: dom.qr.hint,

    async onEnter(state, { skeleton }) {
      const { session } = state;

      if (skeleton) {
        ui.skeleton.render(this.el);
        return;
      }

      if (!session.userPreview) {
        //throw new Error('User data is missing');
        console.warn('User data is missing');
      }

      ui.skeleton.clear(this.el);

      // populate the table
      populateStepValues('qr', session.userPreview, {
        formatters: {
          phoneStart: (value) => utils.formatPhone.locale(value, 'pt-BR'),
        },
      });

      // setup table toggle
      const tableToggle = dom.qr.tableToggle;
      if (tableToggle.dataset.initialized !== 'true') {
        tableToggle.addEventListener('click', () => {
          const isCollapsed = dom.qr.tableWrapper.classList.toggle('collapsed');

          dom.qr.tableToggleLabel.textContent = isCollapsed
            ? 'keyboard_arrow_down'
            : 'keyboard_arrow_up';
        });
        tableToggle.dataset.initialized = 'true';
      }
      tableToggle.disabled = false;

      // setup the qr reader
      setupQr({
        // TODO: review
        qrReaderDiv: dom.qr.reader,
        startCameraBtn: dom.qr.startBtn,
        hintDiv: dom.qr.hint,
        onScan: onQrScan,
      });

      dom.qr.startBtn.disabled = false;
    },

    async onExit() {
      // rest buttons
      dom.qr.tableToggle.disabled = true;
      dom.qr.startBtn.disabled = true;

      // clear the hint
      ui.hint.clearAll(this.hint);

      // reset to skeleton
      ui.skeleton.render(this.el);
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
