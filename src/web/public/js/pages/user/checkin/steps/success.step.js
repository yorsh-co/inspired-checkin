import dom from '../dom.js';

import * as ui from '../../../../modules/ui/transition.js';
import utils from '../../../../modules/utils/index.js';

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
