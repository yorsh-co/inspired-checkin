import { formatTicket, isValidTicket } from './utils.js';
import { clear, clearError, showError } from '../../modules/ui.js';
import {
  attachScrollOnFocus,
  attachScrollOnBlur,
} from '../../components/input/focus-scroll.js';

/**
 *
 * @param {params} params
 * @param {HTMLInputElement} params.input
 * @param {HTMLDivElement} params.hintDiv
 * @param {(fromPaste?: boolean) => Promise<void>|void} params.onSubmit
 */
export const setupInput = ({ input, hintDiv, onSubmit }) => {
  let typingTimer;

  /*input.addEventListener('focus', () => {
    setTimeout(() => {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  });*/
  attachScrollOnFocus(input);
  attachScrollOnBlur(input);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      clearError(hintDiv);
      onSubmit();
    }
  });

  let lastValue = '';

  input.addEventListener('input', () => {
    clearTimeout(typingTimer);

    const formatted = formatTicket(input.value);
    input.value = formatted;

    if (formatted !== lastValue) {
      clearError(hintDiv);
    }

    lastValue = formatted;

    if (!isValidTicket(formatted)) return;

    typingTimer = setTimeout(onSubmit, 300);
  });

  input.addEventListener('paste', () => {
    setTimeout(() => {
      const formatted = formatTicket(input.value);
      input.value = formatted;
      clearError(hintDiv);

      if (isValidTicket(formatted)) {
        onSubmit(true);
      } else {
        showError(hintDiv, 'Código inválido ✨');
      }
    }, 0);
  });
};
