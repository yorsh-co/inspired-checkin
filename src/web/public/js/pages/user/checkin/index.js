import { setupQr } from '../../../modules/qr.js';
import { attachScrollOnResize } from '../../../components/container/resize-scroll.js';
import api from '../../../core/api/index.js';
import { setupDebugButton } from '../../../debug/debug.js';

import { inputs } from './ui/inputs.js';
import { onQrScan } from './steps/qr.step.js';
import { goToStep } from './ui/navigation.js';
import { store } from './state/store.js';
import {
  initCheckinEffects,
  setupStepHandlers,
} from './state/step-handlers.js';
import { dom } from './dom.js';

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

  setupStepHandlers();

  // scroll on resize
  attachScrollOnResize(dom.main.container);

  // cursor glow
  const container = dom.main.container;
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
