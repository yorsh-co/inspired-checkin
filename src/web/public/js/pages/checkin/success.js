import * as ui from '../../modules/ui.js';
import * as utils from '../../modules/utils.js';

/**
 *
 * @param {HTMLDivElement} stepEl
 */
export const runSuccessFlow = async stepEl => {
  ui.transitionToSuccess(
    stepEl,
    document.querySelector('[data-checkin="success"]')
  );

  const successMessage = document.querySelector(
    '[data-checkin="success-message"]'
  );
  //successMessage.textContent = 'Check-in feito! ✨';
  ui.change(successMessage, 'Check-in feito! ✨');
  navigator.vibrate?.(50);
  await utils.sleep(1000);

  //successMessage.textContent = 'Indo pro app... 🚀';
  ui.change(successMessage, 'Indo pro app... 🚀');
  await utils.sleep(1200);

  console.log('redirecting to app...');

  window.location.href = '/';
};
