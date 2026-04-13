import pageDom from '../dom.js';
import { goToStep } from '../ui/navigation.js';
import {
  formatVerificationCode,
  isValidVerificationCode,
} from '../ui/formatters.js';

import * as ui from '../../../../modules/ui/transition.js';
import utils from '../../../../modules/utils/index.js';

import api from '../../../../core/api/index.js';

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
  const input = pageDom.inputs.verificationCode;
  input.classList.remove('error');

  const value = formatVerificationCode(input.value);
  input.value = value;
  console.log('verification input', value);

  const hintDiv = pageDom.verification.hint;
  const defaultHint =
    hintDiv.textContent || 'Digite os 4 últimos digitos do seu celular 👆';

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

  const inputWrapper = pageDom.verification.inputWrapper;
  const backButton = pageDom.verification.backBtn;

  // submit input
  try {
    isSubmitting = true;
    ui.clear(hintDiv);
    ui.showHint(hintDiv, 'Confirmando seu ingresso... ⏳');
    input.blur();

    ui.startLoading(inputWrapper);
    backButton.disabled = true;
    input.disabled = true;

    console.log('submitting to server');

    // verify user with the server
    const res = await api.checkin.submitVerification(value);

    ui.clear(hintDiv);

    // handle server response
    if (res.success) {
      ui.showHint(
        hintDiv,
        `Ingresso ok!${res.meta.nextStep === 'qr' ? ' Agora escaneia o QR code 📷' : ' 🎉'}`,
      );
      await utils.sleep(1200);

      const nextStep = res.meta?.nextStep;
      if (!nextStep) {
        throw new Error('Missing next step from server');
      }

      await goToStep(nextStep);
    } else {
      ui.showError(
        hintDiv,
        'Celular inválido 😕 Confirma que o número do ingresso está certo e tenta de novo',
      );
      throw new Error('Invalid');
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
