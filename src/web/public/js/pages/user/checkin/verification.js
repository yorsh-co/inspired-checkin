import * as ui from '../../../modules/ui.js';
import * as utils from '../../../modules/utils.js';
import { runSuccessFlow } from './success.js';
import api from '../../../core/api/index.js';

let isSubmitting = false;

/**
 *
 * @param {boolean} fromPaste
 * @returns
 */
export const onVerificationInput = async (fromPaste = false) => {
  if (isSubmitting) return;
  console.log('verification code submitted');

  // validate input TODO:
  const input = document.querySelector('[data-checkin="verification-input"]');
  const value = input.value;
  console.log('verification input', value);

  const hintDiv = document.querySelector(
    '[data-checkin="verification-hint-div"]',
  );
  const defaultHint = hintDiv.textContent;
  input.classList.remove('error');

  if (!value) {
    if (!fromPaste) {
      console.error('input is empty');
      ui.showError(hintDiv, 'Digite os 4 últimos digitos do seu telefone 👆'); // or `defaultHint`
    }
    return;
  }

  if (!isValidTicket(value)) {
    // TODO:
    console.error('input is invalid');
    ui.showError(hintDiv, 'Digite os 4 últimos digitos do seu telefone 👆'); // or `defaultHint`
    return;
  }
  console.log('input is valid');

  // submit input
  isSubmitting = true;
  ui.clear(hintDiv);
  ui.showHint(hintDiv, 'Confirmando seu ingresso... ⏳');
  input.blur();

  const backButton = document.querySelector(
    '[data-checkin="verification-back-btn"]',
  );
  ui.startLoading(backButton);
  backButton.disabled = true;

  try {
    input.disabled = true;
    console.log('submitting to server');

    // validate ticket number with the server
    const res = await api.checkin.submitVerification(value);
    console.log(res.checkinStatus);

    ui.clear(hintDiv);

    // handle server response
    switch (res.nextStep) {
      case 'qr': {
        ui.showHint(hintDiv, 'Ingresso ok! Agora escaneia o QR code 📷');
        await utils.sleep(1200);

        ui.transitionToQR(
          document.querySelector('[data-checkin="verification-step"]'),
          document.querySelector('[data-checkin="qr-step"]'),
        );
      }
      case 'success': {
        ui.showHint(hintDiv, 'Ingresso ok! 🎉');
        await utils.sleep(800);

        runSuccessFlow(
          document.querySelector('[data-checkin="verification-step"]'),
        );
        break;
      }
      default: {
        ui.showError(hintDiv, 'Telefone inválido 😕 Tenta de novo');
        throw new Error('Invalid');
      }
    }
  } catch (err) {
    console.error(err);

    ui.stopLoading(backButton);
    backButton.disabled = false;
    isSubmitting = false;

    ui.showError(hintDiv, 'Telefone inválido 😕 Tenta de novo'); // FIXME: error-specific messages

    input.disabled = false;
    input.focus();
  }
};
