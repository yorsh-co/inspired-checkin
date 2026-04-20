import dom from './dom.js';
import store from './state/store.js';
import transition from './ui/transition.js';
import { goToStep } from './ui/navigation.js';


import api from '../../../core/api/index.js';
import layoutDom from '../../../layouts/main/dom.js';
import { setupTopBarBtn } from '../../../components/top-bar/buttons.js';
import { attachScrollOnResize } from '../../../components/container/resize-scroll.js';
import utils from '../../../modules/utils/index.js';
import { setupCursorGlow } from '../../../modules/ui/cursorGlow.js';

const BOOT_INTERVAL = 1000;
const bootStartTime = Date.now();

// load step
const init = async () => {
  try {
    window.history.replaceState(null, '', '/checkin');

    // extract initial data
    const el = document.getElementById('checkin-data');
    if (!el) throw new Error('Missing checkin-data');

    const initialData = JSON.parse(el.textContent);

    const initialStep = initialData?.meta?.nextStep || 'ticket';
    const data = initialData?.data || {};

    store.setState({
      currentUiStepKey: null,
      session: data.session || {},
    });

    if (store.getState().currentUiStepKey !== initialStep) {
      await goToStep(initialStep, { skeleton: false });
    }

    // close boot-screen
    await utils.timing.waitForNextPaint();

    await utils.timing.waitForNextInterval(bootStartTime, BOOT_INTERVAL);

    const bootScreen = layoutDom.bootScreen;
    const boot = transition.bootScreen(bootScreen);
    boot.hide();
  } catch (err) {
    // FIXME: ui feedback
    console.error('[Init Error]', err);
  }
};

// load page-specific topbar
const setupTopBar = () => {
  const topBar = layoutDom.topBar || {};

  // top-bar buttons
  const topBarBtnConfig = [
    {
      key: 'debugBtn',
      handler: api.checkin.debugSession,
    },
    {
      key: 'logoutIcon',
      handler: async (e) => {
        const btn = e.currentTarget;
        btn.disabled = true;

        await api.checkin.reset();
        window.location.href = '/checkin';
      },
    },
  ];
  topBarBtnConfig.forEach(({ key, handler }) => {
    const btnEl = topBar[key];
    if (btnEl) setupTopBarBtn(btnEl, handler);
  });

  // allow top-bar display
  document.body.dataset.topbar = 'true';
};

// dom enhancements
const setupDomEnhancements = () => {
  attachScrollOnResize(dom.main.container);

  setupCursorGlow(dom.main.container);
};

// init app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setupTopBar();
    setupDomEnhancements();
    init();
  });
} else {
  setupTopBar();
  setupDomEnhancements();
  init();
}
