import dom from '../dom.js';
import store from '../state/store.js';
import stepConfig from '../state/step-config.js';
import { goToStep } from '../ui/navigation.js';
import { formatTicket, isValidTicket } from '../ui/formatters.js';
import { createStepFlow } from '../ui/flow.js';

import api from '../../../../core/api/index.js';
import { withSkeleton } from '../../../../modules/ui/skeleton.js';
import utils from '../../../../modules/utils/index.js';
import ui from '../../../../modules/ui/index.js';

let isSubmitting = false;

/**
 *
 * @param {Object} options
 * @param {boolean} [options.fromPaste=false]
 * @param {boolean} [options.captchaToken]
 * @returns
 */
export const onTicketInput = async (options = {}) => {
  if (isSubmitting) return;

  const { fromPaste = false } = options;
  let { captchaToken = null } = options;

  const inputStartTime = Date.now();

  const flow = stepConfig.ticket.getFlow();

  // check captcha
  const { session } = store.getState();
  if (session.captchaRequired && !captchaToken) {
    const captcha = stepConfig.ticket.captcha;

    captchaToken = await captcha.getToken();

    if (!captchaToken) {
      console.error('[Ticket input] missing captcha');

      flow.error('Complete a verificação antes ✨');
      return;
    }

    if (captcha.isExpired()) {
      console.error('[Ticket input] captcha expired');

      flow.error('Refaça a verificação ✨');

      await captcha.reset();

      return;
    }
  }

  // validate input
  const input = stepConfig.ticket.input;

  const value = formatTicket(input.value);
  input.value = value;

  if (!value) {
    if (!fromPaste) {
      console.error('[Ticket input] empty');
      flow.error('Coloca seu código de ingresso ✨');
    }
    return;
  }

  if (!isValidTicket(value)) {
    console.error('[Ticket input] invalid');

    const msg =
      fromPaste && value.length === 5
        ? 'Código inválido 😕'
        : 'O código precisa ter 5 letras ou números';
    flow.error(msg);
    return;
  }

  // submit input
  try {
    isSubmitting = true;

    flow.processing('Buscando seu ingresso... 🎫');

    await utils.timing.ensureMinimum(inputStartTime, 300);

    //await goToStep('verification', { skeleton: true });
    // removed as ticket code confirmation should be quick enough that errors will be returned almost immediately

    // validate ticket code with the server
    console.debug('submitting to server');
    //const res = await withSkeleton(() => api.checkin.submitTicket(value)); // not required if the verification skeleton is not displayed
    const res = await api.checkin.submitTicket(value, captchaToken);

    if (!res.success) throw new Error('Invalid'); // FIXME: add error-handling

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

    await goToStep(nextStep, { skeleton: false });
  } catch (err) {
    console.error(err);

    // remove skeleton
    await goToStep('ticket');

    flow.error('Código inválido 😕 Tenta de novo'); // FIXME: error-specific messages
  } finally {
    isSubmitting = false;
  }
};
