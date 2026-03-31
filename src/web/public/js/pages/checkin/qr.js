import * as utils from '../../modules/utils.js';

/**
 * TODO:
 * @param {} qrCode
 * @returns
 */
export const verifyEventQR = async (qrCode) => {
  await utils.sleep(3000);

  const res = await fetch('/api/verify-presence', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ qrCode }),
  });

  if (!res.ok) throw new Error('invalid');

  return res.json();
};
