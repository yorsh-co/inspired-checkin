import { formatTicket, isValidTicket } from './utils.js';
import { startLoading, stopLoading, showError, transitionToQR } from './ui.js';

let isSubmitting = false;

const fakeRequest = () =>
  new Promise((res, rej) =>
    setTimeout(() => (Math.random() > 0.4 ? res() : rej()), 1800),
  );

export const handleSubmit = async (fromPaste = false) => {
  if (isSubmitting) return;

  const input = document.querySelector('[data-checkin="ticket-input"]');
  const value = formatTicket(input.value);
  input.value = value;

  const errorDiv = document.querySelector('data-checkin="error-div"');
  errorDiv.textContent = '';
  input.classList.remove('error');

  if (!value) {
    if (!fromPaste) {
      showError(errorDiv, 'Digite seu código de ingresso ✨');
    }
    return;
  }

  if (!isValidTicket(value)) {
    showError(errorDiv, 'O código deve ter 5 letras ou números ✨');
    return;
  }

  isSubmitting = true;
  input.blur();

  const inputWrapper = document.querySelector('[data-checkin="input-wrapper"]');
  startLoading(inputWrapper);

  try {
    input.disabled = true;

    await fakeRequest(); // TODO:

    transitionToQR(
      document.querySelector('[data-checkin="checkin-form"]'),
      document.querySelector('[data-checkin="qr-step"]'),
    );
  } catch {
    stopLoading(inputWrapper);
    isSubmitting = false;

    showError(errorDiv, 'Código inválido — tenta de novo ✨');

    input.disabled = false;
    input.focus();
  }
};
