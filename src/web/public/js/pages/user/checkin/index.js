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
import { populateVerificationValues } from './verification.step.js';

try {
  window.history.replaceState(null, '', '/checkin');

  // load step
  window.addEventListener('load', async () => {
    const data = JSON.parse(
      document.getElementById('checkin-data').textContent,
    );

    const initialStep = data?.nextStep || 'ticket';
    
    if (initialStep === 'verification') populateVerificationValues(data.user);

    store.setState({ currentStep: null });

    await goToStep(initialStep);
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
} catch (err) {
  console.error(err);
  alert(err); // FIXME:
}
