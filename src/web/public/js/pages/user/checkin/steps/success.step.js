import dom from '../dom.js';

import * as ui from '../../../../modules/ui.js';
import * as utils from '../../../../modules/utils.js';

/**
 *
 */
export const runSuccessFlow = async () => {
  const successMessage = dom.success.message;

  ui.change(successMessage, 'Check-in feito! ✨');
  navigator.vibrate?.(50);
  await utils.sleep(1000);

  ui.change(successMessage, 'Indo pro app...');
  await utils.sleep(1200);

  console.log('redirecting to app...');
  return; // FIXME:
  window.location.href = '/';
};
