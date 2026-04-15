export const qs = (selector, { required = true } = {}) => {
  const el = document.querySelector(selector);

  if (!el && required) {
    console.error(`[DOM] Missing required element: ${selector}`);
  }

  return el;
};

const layoutDom = Object.freeze({
  bootScreen: qs('[data-main="boot-screen"]'),
  topBar: {
    logoutIcon: qs('[data-top-bar="logout-icon"]'),
    debugBtn: qs('[data-top-bar="debug-btn"]'),
  },
});

export default layoutDom;
