import dom from './dom.js';
import store from './state/store.js';
import { goToStep } from './ui/navigation.js';

import api from '../../../core/api/index.js';
import transition from '../../../modules/ui/transition.js';
import layoutDom from '../../../layouts/main/dom.js';
import { setupTopBarBtn } from '../../../components/top-bar/buttons.js';
import { attachScrollOnResize } from '../../../components/container/resize-scroll.js';

const bootScreen = layoutDom.bootScreen;

try {
  window.history.replaceState(null, '', '/checkin');

  // load step
  window.addEventListener('load', async () => {
    try {
      const initialData = JSON.parse(
        document.getElementById('checkin-data').textContent,
      );

      const initialStep = initialData?.meta?.nextStep || 'ticket';
      const data = { ...(initialData?.data || {}) };

      store.setState({
        currentUiStepKey: null,
        session: data.session || {},
      });

      await goToStep(initialStep, { skeleton: false });

      requestAnimationFrame(() => {
        transition.bootScreen(bootScreen).hide();
      });
    } catch (err) {
      console.error('[Init Error]', err);
    }
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

  // top-bar buttons
  const topBarBtnConfig = [
    {
      key: 'debugBtn',
      handler: api.checkin.debugSession,
    },
    {
      key: 'logoutIcon',
      handler: async () => {
        await api.checkin.reset();
        goToStep('ticket');
      },
    },
  ];
  topBarBtnConfig.forEach((btnConfig) => {
    const btnEl = layoutDom.topBar[btnConfig.key];
    if (btnEl) setupTopBarBtn(btnEl, btnConfig.handler);
  });

  // allow top-bar display
  document.body.dataset.topbar = 'true';
} catch (err) {
  // FIXME: ui
  console.error('[Index Error]', err);
}
