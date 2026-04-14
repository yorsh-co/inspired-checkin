import animate from './animations.js';

const showError = async (el, msg) => {
  el.textContent = msg;
  animate.shake(el);
  el.classList.add('error');
};

const clearError = async (el) => {
  el.textContent = '';
  el.classList.remove('error');
};

const showHint = async (el, msg) => {
  if (el.textContent === msg) return;
  el.classList.add('changing');

  setTimeout(() => {
    el.classList.remove('error');
    el.textContent = msg;
    el.classList.remove('changing');
  }, 120);
};

const clearHint = async (el) => {
  el.classList.add('changing');

  setTimeout(() => {
    el.textContent = '';
    el.classList.remove('changing');
  }, 120);
};

const clearAll = async (el) => {
  el.classList.add('changing');

  setTimeout(() => {
    el.textContent = '';
    el.classList.remove('error');
    el.classList.remove('changing');
  }, 120);
};

const change = async (el, msg) => {
  if (el.textContent === msg) return;
  el.classList.add('changing');

  setTimeout(() => {
    el.textContent = msg;

    requestAnimationFrame(() => {
      el.classList.remove('changing');
    });
  }, 120);
};

const hint = {
  showError,
  showHint,
  clearError,
  clearHint,
  clearAll,
  change,
};

export default hint;
