import pageDom from './dom.js';
import store from './state/store.js';
import { goToStep } from './ui/navigation.js';

import { attachScrollOnResize } from '../../../components/container/resize-scroll.js';

import api from '../../../core/api/index.js';
import { setupDebugButton } from '../../../debug/debug.js';
import transition from '../../../modules/ui/transition.js';
import layoutDom from '../../../layouts/main/dom.js';
import utils from '../../../modules/utils/index.js';

// debug
setupDebugButton(api.checkin.resetSession, 'reset session');

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

    await goToStep(initialStep, { skeleton: false });

    //utils.sleep(300);
    transition.bootScreen(layoutDom.bootScreen);
  });

  // scroll on resize
  attachScrollOnResize(pageDom.main.container);

  // cursor glow
  const container = pageDom.main.container;
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();

    container.style.setProperty('--x', `${e.clientX - rect.left}px`);
    container.style.setProperty('--y', `${e.clientY - rect.top}px`);
  });
} catch (err) {
  console.error(err);
}
