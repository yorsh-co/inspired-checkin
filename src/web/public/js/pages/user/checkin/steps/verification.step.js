import dom from '../dom.js';
import { goToStep } from '../ui/navigation.js';
import {
  formatVerificationCode,
  isValidVerificationCode,
} from '../ui/formatters.js';

import ui from '../../../../modules/ui/index.js';
import utils from '../../../../modules/utils/index.js';

import api from '../../../../core/api/index.js';
import store from '../state/store.js';

let isSubmitting = false;

/**
 *
 * @param {boolean} fromPaste
 * @returns
 */
export const onVerificationInput = async (fromPaste = false) => {
  if (isSubmitting) return;

  const inputStartTime = Date.now();

  // validate input
  const input = dom.inputs.verificationCode;
  input.classList.remove('error');

  const value = formatVerificationCode(input.value);
  input.value = value;

  const hintDiv = dom.verification.hint;
  const defaultHint =
    hintDiv.textContent || 'Digite os 4 últimos digitos do seu celular 👆';
  ui.hint.clearError(hintDiv);

  if (!value) {
    if (!fromPaste) {
      console.error('[Verification Input] empty');
      ui.hint.showError(hintDiv, defaultHint);
    }
    return;
  }

  if (!isValidVerificationCode(value)) {
    console.error('[Verification Input] invalid');
    ui.hint.showError(hintDiv, defaultHint);
    return;
  }

  const verificationStep = dom.steps.verification;
  const backBtn = dom.verification.backBtn;

  // submit input
  try {
    isSubmitting = true;

    ui.hint.showHint(hintDiv, 'Confirmando seu ingresso... ☑️');

    input.blur();
    input.disabled = true;

    backBtn.disabled = true;

    const { session } = store.getState();

    if (session.progress.qr) {
      ui.element.setProcessing(verificationStep, true);

      await utils.timing.ensureMinimum(inputStartTime, 1200);
    } else {
      await utils.timing.ensureMinimum(inputStartTime, 1200);

      await goToStep('qr', { skeleton: true });
    }

    // validate verification code with the server
    console.log('submitting to server');
    const res = await api.checkin.submitVerification(value);

    if (!res.success) throw new Error('Invalid');

    // handle server response
    store.setState({
      session: res.data.session,
    });

    const nextStep = res.meta?.nextStep;
    if (!nextStep) {
      throw new Error('Missing next step from server');
    }

    ui.element.setProcessing(verificationStep, false);

    await goToStep(nextStep, { skeleton: false });
  } catch (err) {
    console.error(err);

    // revert skeleton or processing
    await goToStep('verification');
    ui.element.setProcessing(verificationStep, false);

    ui.hint.showError(hintDiv, 'Telefone inválido 😕 Tenta de novo'); // FIXME: error-specific messages

    backBtn.disabled = false;

    input.disabled = false;
    input.focus();
  } finally {
    isSubmitting = false;
  }
};
