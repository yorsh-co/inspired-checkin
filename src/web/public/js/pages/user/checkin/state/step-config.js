import { setupQr } from '../../../../modules/qr.js';
import utils from '../../../../modules/utils/index.js';
import ui from '../../../../modules/ui/index.js';
import {
  attachScrollOnFocus,
  attachScrollOnBlur,
} from '../../../../components/input/focus-scroll.js';
import { TurnstileCaptcha } from '../../../../components/captcha/captcha.js';
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
import { createStepFlow } from '../ui/flow.js';
import store from './store.js';

const stepConfig = {
  ticket: {
    next: ['verification'],

    step: dom.steps.ticket,
    hint: dom.ticket.hint,
    input: dom.inputs.ticketCode,
    focusTarget: dom.inputs.ticketCode,

    captcha: new TurnstileCaptcha(dom.ticket.captcha, {
      action: 'ticket-code-input',
      callback: (t) => onTicketInput({ captchaToken: t }),
    }),

    getFlow() {
      if (!this._flow) {
        this._flow = createStepFlow({
          step: this.step,
          hint: this.hint,
          input: this.input,
        });
      }
      return this._flow;
    },

    async onEnter(state, { skeleton }) {
      if (skeleton) {
        ui.skeleton.render(this.step);
        return;
      }

      const { captchaRequired } = state;

      if (captchaRequired) {
        // await this.captcha.render(); FIXME: test once using the live url
      }

      ui.skeleton.clear(this.step);

      // set up input
      setupInput(this.input, {
        onInput: onTicketInput,
        formatValue: formatter.ticketCode.format,
        valueIsValid: formatter.ticketCode.isValid,
      });

      attachScrollOnFocus(this.input);
      //attachScrollOnBlur(dom.inputs.ticketCode);

      startPlaceholderTyping(dom.inputs.ticketCode, [
        { text: 'Digite seu código de ingresso...', pause: 1200 },
        { text: 'Cola seu ID do ticket aqui...', pause: 1000 },
        { text: 'Pronto pra a Inspire?', pause: 1400 },
        { text: 'Vamos fazer seu check-in ✨', pause: 1500 },
      ]);

      const flow = this.getFlow();
      flow.idle();
    },

    async onExit() {
      if (this.captcha.widgetId) {
        this.captcha.remove();
      }

      // reset input
      stopPlaceholderTyping(this.input);

      // reset flow
      const flow = this.getFlow();
      flow.hidden();

      // reset to skeleton
      ui.skeleton.render(this.step);
    },
  },

  verification: {
    next: ['ticket', 'qr', 'success'],

    step: dom.steps.verification,
    input: dom.inputs.verificationCode,
    hint: dom.verification.hint,
    btn: dom.verification.backBtn,
    focusTarget: dom.inputs.verificationCode,

    getFlow() {
      if (!this._flow) {
        this._flow = createStepFlow({
          step: this.step,
          hint: this.hint,
          input: this.input,
          btn: this.btn,
        });
      }
      return this._flow;
    },

    async onEnter(state, { skeleton }) {
      if (skeleton) {
        ui.skeleton.render(this.step);
        return;
      }

      const { session } = state;

      if (!session.userPreview) {
        throw new Error('User preview data is missing');
      }

      ui.skeleton.clear(this.step);

      // populate the table
      populateStepValues('verification', session.userPreview, {
        formatters: {
          phoneStart: (value) => utils.formatPhone.locale(value, 'pt-BR'),
        },
      });

      // setup table toggle
      const tableToggle = dom.verification.tableToggle;
      tableToggle.onclick = () => {
        const isCollapsed =
          dom.verification.tableWrapper.classList.toggle('collapsed');

        dom.verification.tableToggleLabel.textContent = isCollapsed
          ? 'keyboard_arrow_down'
          : 'keyboard_arrow_up';
      };
      tableToggle.disabled = false;

      // setup input
      setupInput(this.input, {
        onInput: onVerificationInput,
        formatValue: formatter.verificationCode.format,
        valueIsValid: formatter.verificationCode.isValid,
      });

      attachScrollOnFocus(this.input);

      startPlaceholderTyping(this.input, [
        { text: 'Confirme seu celular...', pause: 1200 },
        { text: 'Digite os últimos 4 dígitos...', pause: 1000 },
        { text: 'Digite o final do seu telefone...', pause: 1400 },
        //{ text: 'Vamos fazer seu check-in ✨', pause: 1500 },
      ]);

      // setup back button
      if (this.btn) {
        this.btn.onclick = () => {
          api.checkin.reset();

          goToStep('ticket');
        };
      }

      const flow = this.getFlow();
      flow.idle('Insira apenas os últimos 4 dígitos');
    },

    async onExit() {
      // reset input
      stopPlaceholderTyping(this.input);

      // reset secondary buttons
      dom.verification.tableToggle.disabled = true;

      // reset flow
      const flow = this.getFlow();
      flow.hidden();

      // reset to skeleton
      ui.skeleton.render(this.step);
    },
  },

  qr: {
    next: ['ticket', 'verification', 'success'],

    step: dom.steps.qr,
    hint: dom.qr.hint,
    btn: dom.qr.startBtn,

    getFlow() {
      if (!this._flow) {
        this._flow = createStepFlow({
          step: this.step,
          hint: this.hint,
          btn: this.btn,
        });
      }
      return this._flow;
    },

    async onEnter(state, { skeleton }) {
      const { session } = state;

      if (skeleton) {
        ui.skeleton.render(this.step);
        return;
      }

      if (!session.userPreview) {
        //throw new Error('User data is missing');
        console.warn('User data is missing');
      }

      ui.skeleton.clear(this.step);

      // populate the table
      populateStepValues('qr', session.userPreview, {
        formatters: {
          phoneStart: (value) => utils.formatPhone.locale(value, 'pt-BR'),
        },
      });

      // setup table toggle
      const tableToggle = dom.qr.tableToggle;
      tableToggle.onclick = () => {
        const isCollapsed = dom.qr.tableWrapper.classList.toggle('collapsed');

        dom.qr.tableToggleLabel.textContent = isCollapsed
          ? 'keyboard_arrow_down'
          : 'keyboard_arrow_up';
      };
      tableToggle.disabled = false;

      // setup the qr reader
      const flow = this.getFlow();

      setupQr({
        // TODO: review
        qrReaderDiv: dom.qr.reader,
        startCameraBtn: dom.qr.startBtn,
        hintDiv: dom.qr.hint,
        onScan: onQrScan,

        onProcessingStart: (msg) =>
          flow.processing(msg, { target: dom.qr.wrapper }),
        onProcessingEnd: (msg) => flow.idle(msg, { target: dom.qr.wrapper }),
        onError: (msg) => flow.error(msg),
      });

      flow.idle(
        'Escaneia o QR code da Inspire para confirmar que você chegou 📍',
      );
    },

    async onExit() {
      // rest secondary buttons
      dom.qr.tableToggle.disabled = true;

      // reset flow
      const flow = this.getFlow();
      flow.hidden();

      // reset to skeleton
      ui.skeleton.render(this.step);
    },
  },

  success: {
    step: dom.steps.success,

    async onEnter() {
      await runSuccessFlow();
    },
  },
};

export default stepConfig;
