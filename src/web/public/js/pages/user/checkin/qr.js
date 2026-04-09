import * as ui from '../../../modules/ui.js';
import * as utils from '../../../modules/utils.js';
import { runSuccessFlow } from './success.js';
import api from '../../../core/api/index.js';

/**
 * TODO:
 * @param {string} qrCode
 * @param {HTMLDivElement} hintDiv
 * @returns
 */
export const verifyEventQr = async (qrCode, hintDiv) => {
  try {
    // FIXME: test
    //await utils.sleep(3000);

    // server request
    const res = await api.checkin.verifyQr(qrCode);

    // handle server response
    if (res.data.checkinComplete) {
      // go to the app
      ui.showHint(hintDiv, 'QR code ok! 🎉');

      await utils.sleep(800);

      runSuccessFlow(document.querySelector('[data-checkin="qr-step"]'));
      // TODO: handle failures
    } else if (res.data.qrValidated) {
      // TODO: if the ticket is valid, prompt for qr validation
      ui.showHint(hintDiv, 'QR ok! Valide seu ingresso 🎟️');
      await utils.sleep(1200);

      // FIXME:
      ui.transitionToTicket(
        document.querySelector('[data-checkin="qr-step"]'),
        document.querySelector('[data-checkin="ticket-step"]')
      );
    } else {
      // TODO: if the ticket is invalid, return to the input
      // ui.showError(hintDiv, 'QR inválido 😕 Tenta de novo');
      throw new Error('Invalid');
    }
  } catch (err) {
    console.error(err);
    alert(err);
  }
};
