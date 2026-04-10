import {
  setupTicketInput,
  setupVerificationInput,
  startPlaceholderTyping,
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
  startPlaceholderTyping(
    document.querySelector('[data-checkin="ticket-input"]'),
    [
      { text: 'Digite seu código de ingresso...', pause: 1200 },
      { text: 'Cola seu ID do ticket aqui...', pause: 1000 },
      { text: 'Pronto pra a Inspire?', pause: 1400 },
      { text: 'Vamos fazer seu check-in ✨', pause: 1500 },
    ],
  );

  setupVerificationInput();
  startPlaceholderTyping(
    document.querySelector('[data-checkin="verification-input"]'),
    [
      { text: 'Confirme seu celular...', pause: 1200 },
      { text: 'Digite os últimos 4 dígitos...', pause: 1000 },
      { text: 'Digite o final do seu telefone...', pause: 1400 },
      //{ text: 'Vamos fazer seu check-in ✨', pause: 1500 },
    ],
  );

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
