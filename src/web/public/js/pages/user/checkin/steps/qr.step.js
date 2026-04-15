import { goToStep } from '../ui/navigation.js';

import ui from '../../../../modules/ui/index.js';
import utils from '../../../../modules/utils/index.js';

import api from '../../../../core/api/index.js';
import dom from '../dom.js';

/**
 * TODO:
 * @param {string} qrCode
 * @param {HTMLDivElement} hintDiv
 * @returns
 */
export const onQrScan = async (qrCode) => {

  // server request
  const res = await api.checkin.submitQrCode(qrCode);

  const hintDiv = dom.qr.hint;
  ui.hint.clearAll(hintDiv);

  // handle server response
  if (!res.success) throw new Error('Invalid');

  const nextStep = res.meta?.nextStep;
  if (!nextStep) {
    throw new Error('Missing next step from server');
  }

  await goToStep(nextStep);
};
