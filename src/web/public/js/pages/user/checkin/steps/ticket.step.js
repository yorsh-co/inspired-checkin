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
 * @param {boolean} fromPaste
 * @returns
 */
export const onTicketInput = async (fromPaste = false) => {
  if (isSubmitting) return;
  
  const inputStartTime = Date.now();

  const flow = stepConfig.ticket.getFlow();

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
      (fromPaste && value.length === 5)
        ? 'Código inválido 😕'
        : 'O código precisa ter 5 letras ou números';
    flow.error(msg);
    return;
  }

  // submit input
  try {
    isSubmitting = true;
    
    flow.processing('Buscando seu ingresso... 🎫');

    await utils.timing.ensureMinimum(inputStartTime, 1200);

    await goToStep('verification', { skeleton: true });

    // validate ticket code with the server
    console.debug('submitting to server');
    const res = await withSkeleton(() => api.checkin.submitTicket(value));

    if (!res.success) throw new Error('Invalid');

    // handle server response
    store.setState({
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
