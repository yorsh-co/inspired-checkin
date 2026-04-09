import { setupInput } from './input.js';
import { handleTicketNumber } from './ticket.js';
import { startTyping } from './typing.js';
import { verifyEventQr } from './qr.js';
import { setupQr } from '../../../modules/qr.js';
import { attachScrollOnResize } from '../../../components/container/resize-scroll.js';

try {
  const ticketInput = document.querySelector('[data-checkin="ticket-input"]');

  // UX setup
  window.history.replaceState(null, '', '/'); // FIXME: DO I NEED TO CHANGE IF CHRCKIN MOVES TO /checkin ?

  window.addEventListener('load', () => {
    if (window.innerWidth >= 768) {
      ticketInput.focus();
    }
  });

  // modules
  setupInput({
    input: ticketInput,
    hintDiv: document.querySelector('[data-checkin="ticket-hint-div"]'),
    onSubmit: handleTicketNumber,
  });

  startTyping(ticketInput);

  setupQr(
    'checkin-qr-reader',
    document.querySelector('[data-checkin="start-camera-btn"]'),
    document.querySelector('[data-checkin="qr-hint-div"]'),
    verifyEventQr,
  );

  // scroll on resize
  const container = document.querySelector('[data-checkin="main-container"]');
  attachScrollOnResize(container);

  // cursor glow
  /*container.addEventListener('mousemove', e => {
    const rect = container.getBoundingClientRect();

    container.style.setProperty('--x', `${e.clientX - rect.left}px`);
    container.style.setProperty('--y', `${e.clientY - rect.top}px`);
  });*/
  container.addEventListener('pointermove', (e) => {
    const rect = container.getBoundingClientRect();
    container.style.setProperty('--x', `${e.clientX - rect.left}px`);
    container.style.setProperty('--y', `${e.clientY - rect.top}px`);
  });
} catch (err) {
  console.error(err);
  alert(err); // FIXME:
}
