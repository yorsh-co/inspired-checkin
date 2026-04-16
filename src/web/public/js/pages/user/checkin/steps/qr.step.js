import { goToStep } from '../ui/navigation.js';

import api from '../../../../core/api/index.js';


/**
 * TODO:
 * @param {string} qrCode
 * @param {HTMLDivElement} hintDiv
 * @returns
 */
export const onQrScan = async (qrCode) => {

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

  await goToStep(nextStep);
};
