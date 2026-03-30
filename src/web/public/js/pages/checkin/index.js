import { setupInput } from './input.js';
import { handleSubmit } from './submit.js';
import { startTyping } from './typing.js';
import { handleQRScan } from './qr.js';
import { setupQR } from '../../modules/qr.js';
import { attachScrollOnResize } from '../../components/container/resize-scroll.js';

const ticketInput = document.querySelector('[data-checkin="ticket-input"]');

// UX setup
window.history.replaceState(null, '', '/');

window.addEventListener('load', () => {
  if (window.innerWidth >= 768) {
    ticketInput.focus();
  }
});

// modules
setupInput({
  input: ticketInput,
  error: document.querySelector('[data-checkin="error-div"]'),
  onSubmit: handleSubmit,
});

startTyping(ticketInput);

setupQR(
  'checkin-qr-reader',
  document.querySelector('[data-checkin="start-camera-btn"]'),
  document.querySelector('[data-checkin="error-div"]'),
  handleQRScan,
);

// resize scroll
const container = document.querySelector('[data-checkin="checkin-container"]');
attachScrollOnResize(container);

// cursor glow
container.addEventListener('mousemove', (e) => {
  const rect = container.getBoundingClientRect();

  container.style.setProperty('--x', `${e.clientX - rect.left}px`);
  container.style.setProperty('--y', `${e.clientY - rect.top}px`);
});
