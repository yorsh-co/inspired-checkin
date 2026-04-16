import store from '../state/store.js';
import { goToStep } from '../ui/navigation.js';

import api from '../../../../core/api/index.js';
import utils from '../../../../modules/utils/index.js';

/**
 *
 * @param {string} qrCode
 * @param {HTMLDivElement} hintDiv
 * @returns
 */
export const onQrScan = async (qrCode) => {
  const scanStartTime = Date.now();

  // server request
  const res = await api.checkin.submitQrCode(qrCode);

  if (!res.success) throw new Error('Invalid');

  // handle server response
  store.setState({
    session: res.data.session,
  });

  const nextStep = res.meta?.nextStep;
  if (!nextStep) {
    throw new Error('Missing next step from server');
  }

  await utils.timing.ensureMinimum(scanStartTime, 1200);

  await goToStep(nextStep);
};
