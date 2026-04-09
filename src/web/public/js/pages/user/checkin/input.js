import {
  formatTicket,
  isValidTicket,
  formatVerificationCode,
  isValidVerificationCode,
} from './utils.js';
import {
  attachScrollOnFocus,
  attachScrollOnBlur,
} from '../../../components/input/focus-scroll.js';
import { onTicketInput } from './ticket.js';
import { onVerificationInput } from './verification.js';

/**
 *
 */
export const setupTicketInput = () => {
  const input = document.querySelector('[data-checkin="ticket-input"]');
  input.value = '';

  attachScrollOnFocus(input);
  attachScrollOnBlur(input);

  // handle enter keydown
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      onTicketInput();
    }
  });

  // handle input
  let typingTimer;

  input.addEventListener('input', () => {
    clearTimeout(typingTimer);

    const formatted = formatTicket(input.value);
    input.value = formatted;

    if (!isValidTicket(formatted)) return;

    typingTimer = setTimeout(onTicketInput, 300);
  });

  // handle paste
  input.addEventListener('paste', () => {
    setTimeout(() => {
      const formatted = formatTicket(input.value);
      input.value = formatted;

      onTicketInput(true);
    }, 0);
  });
};

/**
 *
 */
export const setupVerificationInput = () => {
  const input = document.querySelector('[data-checkin="verification-input"]');
  input.value = '';

  attachScrollOnFocus(input);
  attachScrollOnBlur(input);

  // handle enter keydown
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      onVerificationInput();
    }
  });

  // handle input
  input.addEventListener('input', () => {
    const formatted = formatVerificationCode(input.value);
    input.value = formatted;

    if (!isValidVerificationCode(formatted)) return;

    onVerificationInput();
  });

  // handle paste
  input.addEventListener('paste', () => {
    setTimeout(() => {
      const formatted = formatVerificationCode(input.value);
      input.value = formatted;

      onVerificationInput(true);
    }, 0);
  });
};

/**
 *
 */
export const startTicketInputPlaceholderTyping = () => {
  const input = document.querySelector('[data-checkin="ticket-input"]');
  const phrases = [
    { text: 'Digite seu código de ingresso...', pause: 1200 },
    { text: 'Cola seu ID do ticket aqui...', pause: 1000 },
    { text: 'Pronto pra a Inspire?', pause: 1400 },
    { text: 'Vamos fazer seu check-in ✨', pause: 1500 },
  ];

  let i = 0,
    j = 0;
  let deleting = false;
  let cursor = true;

  setInterval(() => (cursor = !cursor), 500);

  const loop = () => {
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
    setTimeout(loop, deleting ? 30 : 60);
  };

  loop();
};
