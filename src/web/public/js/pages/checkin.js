import { initInput } from '../components/input.js';
import { initQR } from '../components/qrScanner.js';
import { verifyTicket } from '../core/api/api.js';

document.addEventListener('DOMContentLoaded', () => {
  initInput({
    onSubmit: handleSubmit
  });

  initQR({
    onScan: handleQRScan
  });
});

const handleSubmit = async ticket => {
  await verifyTicket(ticket);
  showQRStep();
};
