import {
  setupTicketInput,
  setupVerificationInput,
  startTicketInputPlaceholderTyping,
} from './input.js';
import { onQrScan } from './qr.js';

import { setupQr } from '../../../modules/qr.js';
import { attachScrollOnResize } from '../../../components/container/resize-scroll.js';

import * as ui from '../../../modules/ui.js';
import * as utils from '../../../modules/utils.js';

try {
  // UX setup
  window.history.replaceState(null, '', '/checkin');

  // FIXME: load depending on what was processed in the link
  window.addEventListener('load', async () => {
    await ui.showStep(document.querySelector('[data-checkin="ticket-step"]'));
    if (utils.isDesktop()) {
      ui.focusInput({ q: '[data-checkin="ticket-input"]' });
    }
  });

  // modules
  setupTicketInput();
  startTicketInputPlaceholderTyping();
  setupVerificationInput();

  setupQr(
    // FIXME: review this
    'checkin-qr-reader',
    document.querySelector('[data-checkin="start-camera-btn"]'),
    document.querySelector('[data-checkin="qr-hint-div"]'),
    onQrScan,
  );

  // scroll on resize
  const container = document.querySelector('[data-checkin="main-container"]');
  attachScrollOnResize(container);

  // cursor glow
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();

    container.style.setProperty('--x', `${e.clientX - rect.left}px`);
    container.style.setProperty('--y', `${e.clientY - rect.top}px`);
  });
} catch (err) {
  console.error(err);
  alert(err); // FIXME:
}
