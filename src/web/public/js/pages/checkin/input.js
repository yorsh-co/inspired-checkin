import { formatTicket, isValidTicket } from './utils.js';
import { clearError, showError } from './ui.js';

/**
 *
 * @param {params} params
 * @param {HTMLInputElement} params.input
 * @param {HTMLDivElement} params.error
 * @param {(fromPaste?: boolean) => Promise<void>|void} params.onSubmit
 */
export const setupInput = ({ input, error, onSubmit }) => {
  let typingTimer;

  input.addEventListener('focus', () => {
    setTimeout(() => {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  });

  input.addEventListener('input', () => {
    clearTimeout(typingTimer);

    const formatted = formatTicket(input.value);
    input.value = formatted;

    clearError(error);

    if (!isValidTicket(formatted)) return;

    typingTimer = setTimeout(onSubmit, 300);
  });

  input.addEventListener('paste', () => {
    setTimeout(() => {
      const formatted = formatTicket(input.value);
      input.value = formatted;

      if (isValidTicket(formatted)) {
        onSubmit(true);
      } else {
        showError(error, 'Código inválido ✨');
      }
    }, 0);
  });
};
