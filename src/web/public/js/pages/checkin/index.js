import { setupInput } from './input.js';
import { handleTicketNumber } from './submit.js';
import { startTyping } from './typing.js';
import { verifyEventQR } from './qr.js';
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
  hintDiv: document.querySelector('[data-checkin="form-hint-div"]'),
  onSubmit: handleTicketNumber,
});

startTyping(ticketInput);

setupQR(
  'checkin-qr-reader',
  document.querySelector('[data-checkin="start-camera-btn"]'),
  document.querySelector('[data-checkin="qr-hint-div"]'),
  verifyEventQR,
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
