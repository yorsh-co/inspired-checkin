import { formatTicket, isValidTicket } from './utils.js';
import {
  startLoading,
  stopLoading,
  showError,
  transitionToQR
} from '../../modules/ui.js';

let isSubmitting = false;

const fakeRequest = () =>
  new Promise(
    (res, rej) =>
      setTimeout(
        () => (/*Math.random() > 0.4*/ true ? res(200) : rej(500)),
        1800
      ) // FIXME:
  );

/**
 *
 * @param {boolean} fromPaste
 * @returns
 */
export const handleSubmit = async (fromPaste = false) => {
  if (isSubmitting) return;
  console.log('form submitted');

  const input = document.querySelector('[data-checkin="ticket-input"]');
  const value = formatTicket(input.value);
  input.value = value;
  console.log('ticket', input.value);

  const errorDiv = document.querySelector('[data-checkin="error-div"]');
  errorDiv.textContent = '';
  input.classList.remove('error');

  if (!value) {
    if (!fromPaste) {
      console.error('input is empty');
      showError(errorDiv, 'Digite seu código de ingresso ✨');
    }
    return;
  }

  if (!isValidTicket(value)) {
    console.error('input is invalid');
    showError(errorDiv, 'O código deve ter 5 letras ou números ✨');
    return;
  }
  console.log('input is valid');

  isSubmitting = true;
  input.blur();

  const inputWrapper = document.querySelector('[data-checkin="input-wrapper"]');
  startLoading(inputWrapper);

  try {
    input.disabled = true;

    console.log('submitting to server');
    const res = await fakeRequest(); // TODO:

    console.log(res);

    // TODO: if the ticket is valid, prompt for qr validation
    // if the ticket is invalid, return to the input
    transitionToQR(
      document.querySelector('[data-checkin="checkin-form"]'),
      document.querySelector('[data-checkin="qr-step"]')
    );
  } catch (err) {
    console.error(err);

    stopLoading(inputWrapper);
    isSubmitting = false;

    showError(errorDiv, 'Código inválido — tenta de novo ✨');

    input.disabled = false;
    input.focus();
  }
};
