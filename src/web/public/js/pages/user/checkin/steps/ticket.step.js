import dom from '../dom.js';
import store from '../state/store.js';
import { goToStep } from '../ui/navigation.js';
import { formatTicket, isValidTicket } from '../ui/formatters.js';

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

  // validate input
  const input = dom.inputs.ticketCode;
  input.classList.remove('error');

  const value = formatTicket(input.value);
  input.value = value;

  const hintDiv = dom.ticket.hint;
  ui.hint.clearError(hintDiv);

  if (!value) {
    if (!fromPaste) {
      console.error('[Ticket input] empty');
      ui.hint.showError(hintDiv, 'Coloca seu código de ingresso ✨');
    }
    return;
  }

  if (!isValidTicket(value)) {
    console.error('[Ticket input] invalid');

    ui.hint.showError(
      hintDiv,
      fromPaste && value.length === 5
        ? 'Código inválido 😕'
        : 'O código precisa ter 5 letras ou números',
    );
    return;
  }

  // submit input
  try {
    isSubmitting = true;

    ui.hint.showHint(hintDiv, 'Buscando seu ingresso... 🎫');

    input.blur();
    input.disabled = true;

    await utils.timing.ensureMinimum(inputStartTime, 1200);

    await goToStep('verification', { skeleton: true });

    // validate ticket code with the server
    console.debug('Submitting to server');
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

    ui.hint.showError(hintDiv, 'Código inválido 😕 Tenta de novo'); // FIXME: error-specific messages

    input.disabled = false;
    input.focus();
  } finally {
    isSubmitting = false;
  }
};
