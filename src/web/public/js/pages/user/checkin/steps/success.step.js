import dom from '../dom.js';

import utils from '../../../../modules/utils/index.js';
import ui from '../../../../modules/ui/index.js';


/**
 *
 */
export const runSuccessFlow = async () => {
  const successMessage = dom.success.message;
  const hintDiv = dom.success.hint;

  ui.hint.change(successMessage, 'Check-in feito! ✨');
  navigator.vibrate?.(50);
  await utils.sleep(1000);

  ui.hint.change(successMessage, 'Indo pro app...');
  await utils.sleep(1200);
  
  setTimeout(() => {
    ui.element.setShow(hintDiv, true);
  }, 3000);

  console.log('Redirecting...');
  return; // FIXME:
  window.location.href = '/';
};
