import { formatTicket, isValidTicket } from '../ui/formatters.js';
import { goToStep } from '../ui/navigation.js';
import { store } from '../state/store.js';

import * as ui from '../../../../modules/ui.js';
import * as utils from '../../../../modules/utils.js';

import api from '../../../../core/api/index.js';
import { dom } from '../dom.js';

let isSubmitting = false;

/**
 *
 * @param {boolean} fromPaste
 * @returns
 */
export const onTicketInput = async (fromPaste = false) => {
  if (isSubmitting) return;
  console.log('ticket submitted');

  // validate input
  const input = dom.inputs.ticketCode;
  input.classList.remove('error');

  const value = formatTicket(input.value);
  input.value = value;
  console.log('ticket', input.value);

  const hintDiv = dom.ticket.hint;
  ui.clearError(hintDiv);

  if (!value) {
    if (!fromPaste) {
      console.error('input is empty');
      ui.showError(hintDiv, 'Coloca seu código de ingresso ✨');
    }
    return;
  }

  if (!isValidTicket(value)) {
    console.error('input is invalid');

    ui.showError(
      hintDiv,
      fromPaste && value.length === 5
        ? 'Código inválido 😕'
        : 'O código precisa ter 5 letras ou números',
    );
    return;
  }

  console.log('input is valid');

  const inputWrapper = dom.ticket.inputWrapper;

  // submit input
  try {
    isSubmitting = true;
    ui.clear(hintDiv);
    ui.showHint(hintDiv, 'Buscando seu ingresso... ⏳');
    input.blur();

    ui.startLoading(inputWrapper);
    input.disabled = true;

    console.log('submitting to server');

    // validate ticket number with the server
    const res = await api.checkin.submitTicket(value);

    ui.clear(hintDiv);

    // handle server response
    if (res.success) {
      ui.showHint(hintDiv, 'Encontrado! Agora confirme seu ingresso 🎫');
      await utils.sleep(1200);

      store.setState({
        userData: res.data.userPreview,
      });

      const nextStep = res.meta?.nextStep;
      if (!nextStep) {
        throw new Error('Missing next step from server');
      }

      await goToStep(nextStep);
    } else {
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
