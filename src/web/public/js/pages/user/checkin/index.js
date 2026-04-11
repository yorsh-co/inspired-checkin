import api from '../../../core/api/index.js';
import { attachScrollOnResize } from '../../../components/container/resize-scroll.js';
import { setupDebugButton } from '../../../debug/debug.js';

import { dom } from './dom.js';
import { goToStep } from './ui/navigation.js';
import { store } from './state/store.js';
import { setupStepHandlers } from './state/del.step-handlers.js';

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
