import * as test from '../../test.js';

import * as ui from '../../modules/ui.js';
import * as utils from '../../modules/utils.js';
import { runSuccessFlow } from './success.js';
import { api } from '../../core/api/index.js';

/**
 * TODO:
 * @param {string} qrCode
 * @param {HTMLDivElement} hintDiv
 * @returns
 */
export const verifyEventQR = async (qrCode, hintDiv) => {
  try {
    // FIXME: test
    await utils.sleep(3000);

    // server request TODO:
    //const res = await api.checkin.verifyQR(qrCode);
    const res = await test.fakeRequest(200);

    if (res.ok) {
      ui.showHint(hintDiv, 'QR code ok! 🎉');
      await utils.sleep(800);

      runSuccessFlow(document.querySelector('[data-checkin="qr-step"]'));
    }
  } catch (err) {
    console.error(err);
    alert(err);
  }
};
