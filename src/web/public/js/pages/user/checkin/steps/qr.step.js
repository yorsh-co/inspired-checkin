import { goToStep } from '../ui/navigation.js';

import * as ui from '../../../../modules/ui.js';
import utils from '../../../../modules/utils/index.js';

import api from '../../../../core/api/index.js';

/**
 * TODO:
 * @param {string} qrCode
 * @param {HTMLDivElement} hintDiv
 * @returns
 */
export const onQrScan = async (qrCode, hintDiv) => {
  // server request
  const res = await api.checkin.submitQrCode(qrCode);

  ui.clear(hintDiv);

  // handle server response
  if (res.success) {
    ui.showHint(
      hintDiv,
      `QR code ok!${res.meta.nextStep === 'ticket' ? ' Agora valide seu ingresso 🎟️' : ' 🎉'}`,
    );
    await utils.sleep(1200);

    const nextStep = res.meta?.nextStep;
    if (!nextStep) {
      throw new Error('Missing next step from server');
    }

    await goToStep(nextStep);
  } else {
    ui.showError(hintDiv, 'QR inválido 😕 Tenta de novo');
    throw new Error('Invalid');
  }
};
