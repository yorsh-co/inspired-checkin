import animate from './animations.js';

const TRANSITION_DELAY = 120;

const runTransition = (el, updater) =>
  new Promise((resolve) => {
    const version = (el._hintVersion = (el._hintVersion || 0) + 1);

    el.classList.add('changing');

    setTimeout(() => {
      if (el._hintVersion !== version) return resolve();

      updater();

      requestAnimationFrame(() => {
        el.classList.remove('changing');
      });

      resolve();
    }, TRANSITION_DELAY);
  });

const set = (el, { text = '', type = 'hint' } = {}) =>
  runTransition(el, () => {
    el.textContent = text;

    el.classList.toggle('error', type === 'error');

    el.dataset.hintState = type;
  });

const clear = (el) =>
  runTransition(el, () => {
    el.textContent = '';
    el.classList.remove('error');

    el.dataset.hintState = '';
  });

const shake = (el) => {
  animate.shake(el);
};

const hint = {
  set,
  clear,
  shake,

  showHint: (el, msg) => set(el, { text: msg, type: 'hint' }),

  showError: async (el, msg) => {
    await set(el, { text: msg, type: 'error' });
    animate.shake(el);
  },

  change: (el, msg) => set(el, { text: msg }),
};

export default hint;
