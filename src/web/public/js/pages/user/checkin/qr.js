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
export const onQrScan = async (qrCode, hintDiv) => {
  try {
    // server request
    const res = await api.checkin.submitQrCode(qrCode);
    console.log(res.checkinStatus);

    ui.clear(hintDiv);

    // handle server response
    switch (res.nextStep) {
      case 'ticket': {
        ui.showHint(hintDiv, 'QR ok! Agora valide seu ingresso 🎟️');
        await utils.sleep(1200);

        ui.transitionToNextStep(
          document.querySelector('[data-checkin="qr-step"]'),
          document.querySelector('[data-checkin="ticket-step"]'),
        );
      }
      case 'success': {
        ui.showHint(hintDiv, 'QR code ok! 🎉');
        await utils.sleep(800);

        runSuccessFlow(document.querySelector('[data-checkin="qr-step"]'));
        break;
      }
      default: {
        ui.showError(hintDiv, 'QR inválido 😕 Tenta de novo');
        throw new Error('Invalid');
      }
    }
  } catch (err) {
    console.error(err);
  }
};
