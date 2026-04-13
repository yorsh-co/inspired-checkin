import { formatter } from './formatters.js';

import pageDom from '../dom.js';
import { onTicketInput } from '../steps/ticket.step.js';
import { onVerificationInput } from '../steps/verification.step.js';

import {
  attachScrollOnFocus,
  attachScrollOnBlur,
} from '../../../../components/input/focus-scroll.js';

/**
 *
 * @param {HTMLInputElement} input
 * @param {{ onInput, formatValue, valueIsValid }} handlers
 */
export const setupInput = (input, handlers) => {
  if (!input) {
    console.error('input missing');
    return;
  }

  if (input.dataset.initialized === 'true') return;

  input.value = '';

  // handle enter keydown
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      handlers.onInput();
    }
  });

  // handle character input
  let typingTimer;

  input.addEventListener('input', () => {
    clearTimeout(typingTimer);

    const formatted = handlers.formatValue(input.value);
    input.value = formatted;

    if (!handlers.valueIsValid(formatted)) return;

    typingTimer = setTimeout(handlers.onInput, 300);
  });

  // handle paste
  input.addEventListener('paste', () => {
    setTimeout(() => {
      const formatted = handlers.formatValue(input.value);
      input.value = formatted;

      handlers.onInput(true);
    }, 0);
  });

  input.dataset.initialized = 'true';
  input.disabled = false;
};

/**
 *
 * @param {HTMLInputElement} input
 * @param {[{ text: string, pause: number }]} phrases
 */
export const startPlaceholderTyping = (input, phrases) => {
  if (input._placeholderCleanup) {
    input._placeholderCleanup();
  }

  let i = 0,
    j = 0;
  let deleting = false;
  let cursor = true;
  let destroyed = false;

  const interval = setInterval(() => (cursor = !cursor), 500);
  let timeoutId;

  const loop = () => {
    if (destroyed) return;

    const text = phrases[i].text;

    j += deleting ? -1 : 1;

    input.placeholder = cursor
      ? text.substring(0, j) + '|'
      : text.substring(0, j);

    // pause at the end of the word, before deleting
    if (!deleting && j === text.length) {
      deleting = true;
      return setTimeout(loop, phrases[i].pause);
    }

    // move to the next phrase
    if (deleting && j === 0) {
      deleting = false;
      i = (i + 1) % phrases.length;
    }

    // type or backspaces
    timeoutId = setTimeout(loop, deleting ? 30 : 60);
  };

  loop();

  input._placeholderCleanup = () => {
    destroyed = true;
    clearInterval(interval);
    clearTimeout(timeoutId);
  };
};

const inputs = {
  ticketCode: {
    setup: () => {
      setupInput(pageDom.inputs.ticketCode, {
        onInput: onTicketInput,
        formatValue: formatter.ticketCode.format,
        valueIsValid: formatter.ticketCode.isValid,
      });
      attachScrollOnFocus(pageDom.inputs.ticketCode);
      attachScrollOnBlur(pageDom.inputs.ticketCode);
    },
    start: () => {
      startPlaceholderTyping(pageDom.inputs.ticketCode, [
        { text: 'Digite seu código de ingresso...', pause: 1200 },
        { text: 'Cola seu ID do ticket aqui...', pause: 1000 },
        { text: 'Pronto pra a Inspire?', pause: 1400 },
        { text: 'Vamos fazer seu check-in ✨', pause: 1500 },
      ]);
    },
  },
  verificationCode: {
    setup: () =>
      setupInput(pageDom.inputs.verificationCode, {
        onInput: onVerificationInput,
        formatValue: formatter.verificationCode.format,
        valueIsValid: formatter.verificationCode.isValid,
      }),
    start: () => {
      startPlaceholderTyping(pageDom.inputs.verificationCode, [
        { text: 'Confirme seu celular...', pause: 1200 },
        { text: 'Digite os últimos 4 dígitos...', pause: 1000 },
        { text: 'Digite o final do seu telefone...', pause: 1400 },
        //{ text: 'Vamos fazer seu check-in ✨', pause: 1500 },
      ]);
    },
  },
};

export default inputs;
