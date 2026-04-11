import { setupQr } from '../../../modules/qr.js';
import { attachScrollOnResize } from '../../../components/container/resize-scroll.js';

import {
  setupTicketInput,
  setupVerificationInput,
  startPlaceholderTyping,
} from './inputs.js';
import { onQrScan } from './qr.step.js';
import { goToStep } from './navigation.js';
import { store } from './store.js';
import { initCheckinEffects } from './effects.js';
import { setupButton } from '../../../test.js';
import api from '../../../core/api/index.js';
import { setupDebugButton } from '../../../debug/debug.js';

try {
  window.history.replaceState(null, '', '/checkin');

  // load step
  window.addEventListener('load', async () => {
    const checkinData = JSON.parse(
      document.getElementById('checkin-data').textContent,
    );

    const initialStep = checkinData?.meta?.nextStep || 'ticket';

    store.setState({
      currentStep: null,
      userData: checkinData?.data?.userPreview || null,
    });

    await goToStep(initialStep);
  });

  initCheckinEffects();

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

  setupQr({
    qrReaderId: 'checkin-qr-reader',
    startCameraBtn: document.querySelector('[data-checkin="start-camera-btn"]'),
    hintDiv: document.querySelector('[data-checkin="qr-hint-div"]'),
    onScan: onQrScan,
  });

  // scroll on resize
  const container = document.querySelector('[data-checkin="main-container"]');
  attachScrollOnResize(container);

  // cursor glow
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();

    container.style.setProperty('--x', `${e.clientX - rect.left}px`);
    container.style.setProperty('--y', `${e.clientY - rect.top}px`);
  });

  // debug
  setupDebugButton(api.checkin.resetSession, 'reset session');
} catch (err) {
  console.error(err);
  alert(err); // FIXME:
}
