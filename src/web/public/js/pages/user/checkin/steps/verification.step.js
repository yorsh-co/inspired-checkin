import dom from '../dom.js';
import store from '../state/store.js';
import stepConfig from '../state/step-config.js';
import { goToStep } from '../ui/navigation.js';
import {
  formatVerificationCode,
  isValidVerificationCode,
} from '../ui/formatters.js';

import ui from '../../../../modules/ui/index.js';
import utils from '../../../../modules/utils/index.js';
import { withSkeleton } from '../../../../modules/ui/skeleton.js';
import api from '../../../../core/api/index.js';

let isSubmitting = false;

/**
 *
 * @param {boolean} fromPaste
 * @returns
 */
export const onVerificationInput = async (fromPaste = false) => {
  if (isSubmitting) return;

  const inputStartTime = Date.now();

  const flow = stepConfig.verification.getFlow();

  const defaultHint = 'Digite os 4 últimos digitos do seu celular 👆';

  // validate input
  const input = stepConfig.verification.input;

  const value = formatVerificationCode(input.value);
  input.value = value;

  if (!value) {
    if (!fromPaste) {
      console.error('[Verification Input] empty');
      flow.error(defaultHint);
    }
    return;
  }

  if (!isValidVerificationCode(value)) {
    console.error('[Verification Input] invalid');
    flow.error(defaultHint);
    return;
  }

  // submit input
  try {
    isSubmitting = true;

    flow.processing('Confirmando seu ingresso... ☑️');

    await utils.timing.ensureMinimum(inputStartTime, 300);

    // validate verification code with the server
    console.log('submitting to server');

    /* 
    // removed as verification code confirmation should be quick enough that errors will be returned almost immediately
    let res;

    const { session } = store.getState();

    if (!session.progress.qr) {
      // display qr skeleton if qr is pending
      await goToStep('qr', { skeleton: true });

      res = await withSkeleton(() => api.checkin.submitVerification(value));
    } else {
      res = await api.checkin.submitVerification(value);
    }*/

    const res = await api.checkin.submitVerification(value);

    if (!res.success) throw new Error('Invalid');

    await utils.timing.ensureMinimum(inputStartTime, 800);

    // handle server response
    store.setState({
      captchaRequired: res.meta?.captchaRequired,
      session: res.data.session,
    });

    const nextStep = res.meta?.nextStep;
    if (!nextStep) {
      throw new Error('Missing next step from server');
    }

    flow.success();

    await goToStep(nextStep, { skeleton: false });
  } catch (err) {
    console.error(err);

    // revert skeleton or processing
    await goToStep('verification');

    flow.error('Telefone inválido 😕 Tenta de novo'); // FIXME: error-specific messages
  } finally {
    isSubmitting = false;
  }
};
