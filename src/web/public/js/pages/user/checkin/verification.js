import { formatVerificationCode, isValidVerificationCode } from './utils.js';
import { runSuccessFlow } from './success.js';

import * as ui from '../../../modules/ui.js';
import * as utils from '../../../modules/utils.js';

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

  // validate input
  const input = document.querySelector('[data-checkin="verification-input"]');
  input.classList.remove('error');

  const value = formatVerificationCode(input.value);
  input.value = value;
  console.log('verification input', value);

  const hintDiv = document.querySelector(
    '[data-checkin="verification-hint-div"]',
  );
  const defaultHint = hintDiv.textContent || 'Digite os 4 últimos digitos do seu celular 👆';

  if (!value) {
    if (!fromPaste) {
      console.error('input is empty');
      ui.showError(hintDiv, defaultHint);
    }
    return;
  }

  if (!isValidVerificationCode(value)) {
    console.error('input is invalid');
    ui.showError(hintDiv, defaultHint);
    return;
  }

  console.log('input is valid');
  
  const inputWrapper = document.querySelector(
      '[data-checkin="verification-input-wrapper"]',
    );
    const backButton = document.querySelector(
      '[data-checkin="verification-back-btn"]',
    );

  // submit input
  try {
    isSubmitting = true;
    ui.clear(hintDiv);
    ui.showHint(hintDiv, 'Confirmando seu ingresso... ⏳');
    input.blur();
    
    ui.startLoading(inputWrapper);
    backButton.disabled = true;
    input.disabled = true;
  return;
    console.log('submitting to server');

    // verify user with the server
    const res = await api.checkin.submitVerification(value);
    console.log(res.checkinStatus);

    ui.clear(hintDiv);

    // handle server response
    switch (res.nextStep) {
      case 'qr': {
        ui.showHint(hintDiv, 'Ingresso ok! Agora escaneia o QR code 📷');
        await utils.sleep(1200);

        ui.showStep(
          document.querySelector('[data-checkin="qr-step"]'),
          document.querySelector('[data-checkin="verification-step"]'),
        );

        break;
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

    ui.stopLoading(inputWrapper);
    backButton.disabled = false;
    isSubmitting = false;

    ui.showError(hintDiv, 'Telefone inválido 😕 Tenta de novo'); // FIXME: error-specific messages

    input.disabled = false;
    input.focus();
  }
};
