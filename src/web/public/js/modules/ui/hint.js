import animate from './animations.js';

const getNextVersion = (el) => {
  el._hintVersion = (el._hintVersion || 0) + 1;
  return el._hintVersion;
};

const showError = (el, msg) =>
  new Promise((resolve) => {
    const version = getNextVersion(el);

    el.classList.add('changing');

    setTimeout(() => {
      if (el._hintVersion !== version) return resolve();

      el.textContent = msg;
      el.classList.add('error');
      el.classList.remove('changing');

      animate.shake(el);

      resolve();
    }, 120);
  });

const clearError = (el) =>
  new Promise((resolve) => {
    const version = getNextVersion(el);

    el.classList.add('changing');

    setTimeout(() => {
      if (el._hintVersion !== version) return resolve();

      el.textContent = '';
      el.classList.remove('error');
      el.classList.remove('changing');

      resolve();
    }, 120);
  });

const showHint = (el, msg) =>
  new Promise((resolve) => {
    const version = getNextVersion(el);

    el.classList.add('changing');

    setTimeout(() => {
      if (el._hintVersion !== version) return resolve();

      el.classList.remove('error');
      el.textContent = msg;
      el.classList.remove('changing');

      resolve();
    }, 120);
  });

const clearHint = (el) =>
  new Promise((resolve) => {
    const version = getNextVersion(el);

    el.classList.add('changing');

    setTimeout(() => {
      if (el._hintVersion !== version) return resolve();

      el.textContent = '';
      el.classList.remove('changing');

      resolve();
    }, 120);
  });

const clearAll = (el) =>
  new Promise((resolve) => {
    const version = getNextVersion(el);

    el.classList.add('changing');

    setTimeout(() => {
      if (el._hintVersion !== version) return resolve();

      el.textContent = '';
      el.classList.remove('error');
      el.classList.remove('changing');

      resolve();
    }, 120);
  });

const change = (el, msg) => {
  if (el.textContent === msg) return;

  return new Promise((resolve) => {
    const version = getNextVersion(el);

    el.classList.add('changing');

    setTimeout(() => {
      if (el._hintVersion !== version) return resolve();

      el.textContent = msg;

      requestAnimationFrame(() => {
        el.classList.remove('changing');
      });

      resolve();
    }, 120);
  });
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
