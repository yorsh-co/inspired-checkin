import * as ui from './ui.js';
import * as utils from '../../modules/utils.js';
import { runSuccessFlow } from './success.js';

/**
 * TODO:
 * @param {string} qrCode
 * @param {HTMLDivElement} hintDiv
 * @returns
 */
export const verifyEventQR = async (qrCode, hintDiv) => {
  // FIXME: test
  await utils.sleep(3000);

  // server request TODO:
  /*const res = await fetch('/api/verify-presence', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ qrCode })
  });

  if (!res.ok) throw new Error('invalid');*/
  const res = await test.fakeRequest(200);

  if (res === 200) {
    runSuccessFlow(document.querySelector('[data-checkin="qr-step"]'));
  }
};
