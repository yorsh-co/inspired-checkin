import { formatTicket, isValidTicket } from './utils.js';
import { goToStep } from './navigation.js';
import { store } from './store.js';

import * as ui from '../../../modules/ui.js';
import * as utils from '../../../modules/utils.js';

import api from '../../../core/api/index.js';

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
  const input = document.querySelector('[data-checkin="ticket-input"]');
  input.classList.remove('error');

  const value = formatTicket(input.value);
  input.value = value;
  console.log('ticket', input.value);

  const hintDiv = document.querySelector('[data-checkin="ticket-hint-div"]');
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

  const inputWrapper = document.querySelector(
    '[data-checkin="ticket-input-wrapper"]',
  );

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

      await goToStep(res.meta.nextStep);
    } else {
      ui.showError(hintDiv, 'Código inválido 😕 Tenta de novo');
      throw new Error('Invalid');
    }

    /*
    switch (res.meta.nextStep) {
      case 'verification': {
        ui.showHint(hintDiv, 'Encontrado! Agora confirme seu ingresso 🎫');
        await utils.sleep(1200);

        await ui.showStep(
          document.querySelector('[data-checkin="verification-step"]'),
          document.querySelector('[data-checkin="ticket-step"]'),
        );
        if (utils.isDesktop()) {
          ui.focusInput({ q: '[data-checkin="verification-input"]' });
        }

        break;
      }
      default: {
        ui.showError(hintDiv, 'Código inválido 😕 Tenta de novo');
        throw new Error('Invalid');
      }
    }
      */
  } catch (err) {
    console.error(err);

    ui.stopLoading(inputWrapper);
    isSubmitting = false;

    ui.showError(hintDiv, 'Código inválido 😕 Tenta de novo'); // FIXME: error-specific messages

    input.disabled = false;
    input.focus();
  }
};
