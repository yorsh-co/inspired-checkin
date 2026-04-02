import { formatTicket, isValidTicket } from './utils.js';
import * as ui from '../../modules/ui.js';
import * as utils from '../../modules/utils.js';
import { runSuccessFlow } from './success.js';

const fakeRequest = () =>
  new Promise(
    (res, rej) =>
      setTimeout(
        () => (/*Math.random() > 0.4*/ true ? res(200) : rej(500)),
        1800
      ) // FIXME:
  );

let isSubmitting = false;

/**
 *
 * @param {boolean} fromPaste
 * @returns
 */
export const handleTicketNumber = async (fromPaste = false) => {
  if (isSubmitting) return;
  console.log('form submitted');

  // validate input
  const input = document.querySelector('[data-checkin="ticket-input"]');
  const value = formatTicket(input.value);
  input.value = value;
  console.log('ticket', input.value);

  const hintDiv = document.querySelector('[data-checkin="form-hint-div"]');
  input.classList.remove('error');

  if (!value) {
    if (!fromPaste) {
      console.error('input is empty');
      ui.showError(hintDiv, 'Coloca seu código de ingresso ✨');
    }
    return;
  }

  if (!isValidTicket(value)) {
    console.error('input is invalid');
    ui.showError(hintDiv, 'O código precisa ter 5 letras ou números');
    return;
  }
  console.log('input is valid');

  // submit input
  isSubmitting = true;
  ui.clear(hintDiv);
  ui.showHint(hintDiv, 'Validando seu ingresso... ⏳');
  input.blur();

  const inputWrapper = document.querySelector('[data-checkin="input-wrapper"]');
  ui.startLoading(inputWrapper);

  try {
    input.disabled = true;
    console.log('submitting to server');

    // validate ticket number with the server
    const res = await fakeRequest(); // TODO:
    console.log(res);
    ui.clear(hintDiv);

    // handle server response
    if (res === 309) {
      // TODO: if the ticket is valid, prompt for qr validation
      ui.showHint(hintDiv, 'Ingresso ok! Agora escaneia o QR code 📷');
      await utils.sleep(1000);

      ui.transitionToQR(
        document.querySelector('[data-checkin="form"]'),
        document.querySelector('[data-checkin="qr-step"]')
      );
    } else if (res === 200) {
      // go to the app
      ui.showHint(hintDiv, 'Ingresso ok! 🎉');

      await utils.sleep(800);

      runSuccessFlow(document.querySelector('[data-checkin="form"]'));
      /*
      ui.transitionToSuccess(
        document.querySelector('[data-checkin="form"]'),
        document.querySelector('[data-checkin="success"]')
      );

      const successMessage = document.querySelector(
        '[data-checkin="success-message"]'
      );
      //successMessage.textContent = 'Check-in feito! ✨';
      ui.change(successMessage, 'Check-in feito! ✨');
      navigator.vibrate?.(50);
      await utils.sleep(1000);

      //successMessage.textContent = 'Indo pro app... 🚀';
      ui.change(successMessage, 'Indo pro app... 🚀');
      await utils.sleep(1200);

      console.log('redirecting to app...');

      window.location.href = '/';
*/
    } else {
      // TODO: if the ticket is invalid, return to the input
      ui.showError(hintDiv, 'Código inválido 😕 Tenta de novo');
      throw new Error('Invalid');
    }
  } catch (err) {
    console.error(err);

    ui.stopLoading(inputWrapper);
    isSubmitting = false;

    ui.showError(hintDiv, 'Código inválido 😕 Tenta de novo'); // FIXME: error-specific messages

    input.disabled = false;
    input.focus();
  }
};
