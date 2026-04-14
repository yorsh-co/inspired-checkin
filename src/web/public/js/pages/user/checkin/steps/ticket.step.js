import dom from '../dom.js';
import store from '../state/store.js';
import { goToStep } from '../ui/navigation.js';
import { formatTicket, isValidTicket } from '../ui/formatters.js';

import api from '../../../../core/api/index.js';
import hint from '../../../../modules/ui/hint.js';
import { withSkeleton } from '../../../../modules/ui/skeleton.js';
import utils from '../../../../modules/utils/index.js';

let isSubmitting = false;

/**
 *
 * @param {boolean} fromPaste
 * @returns
 */
export const onTicketInput = async (fromPaste = false) => {
  if (isSubmitting) return;

  // validate input
  const input = dom.inputs.ticketCode;
  input.classList.remove('error');

  const value = formatTicket(input.value);
  input.value = value;

  const hintDiv = dom.ticket.hint;
  hint.clearError(hintDiv);

  if (!value) {
    if (!fromPaste) {
      console.error('[Ticket input] empty');
      hint.showError(hintDiv, 'Coloca seu código de ingresso ✨');
    }
    return;
  }

  if (!isValidTicket(value)) {
    console.error('[Ticket input] invalid');

    hint.showError(
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
    hint.clearAll(hintDiv);
    hint.showHint(hintDiv, 'Buscando seu ingresso... ⏳');

    input.blur();
    input.disabled = true;

    await utils.sleep(800);

    await goToStep('verification', { skeleton: true });

    // validate ticket number with the server
    console.debug('Submitting to server');
    const res = await withSkeleton(() => api.checkin.submitTicket(value));

    //ui.clear(hintDiv);
    if (!res.success) throw new Error('Invalid');

    // handle server response
    store.setState({
      userData: res.data.userPreview,
    });

    const nextStep = res.meta?.nextStep;
    if (!nextStep) {
      throw new Error('Missing next step from server');
    }

    await goToStep(nextStep, { skeleton: false });
    
  } catch (err) {
    console.error(err);

    await goToStep('ticket');

    //ui.stopLoading(inputWrapper);

    hint.showError(hintDiv, 'Código inválido 😕 Tenta de novo'); // FIXME: error-specific messages

    input.disabled = false;
    input.focus();
  } finally {
    isSubmitting = false;
  }
};
