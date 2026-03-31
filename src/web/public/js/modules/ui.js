export const showError = (el, msg) => {
  el.textContent = msg;
  el.classList.add('error');
};

export const clearError = (el) => {
  el.textContent = '';
  el.classList.remove('error');
};

export const showHint = (el, msg) => {
  if (el.textContent === msg && el.classList.contains('hint')) return;
  el.classList.add('changing');

  setTimeout(() => {
    el.textContent = msg;
    el.classList.add('hint');
    el.classList.remove('changing');
  }, 120);
};

export const clearHint = (el) => {
  el.classList.add('changing');

  setTimeout(() => {
    el.textContent = '';
    el.classList.remove('hint');
    el.classList.remove('changing');
  }, 120);
};

export const clear = (el) => {
  el.classList.add('changing');

  setTimeout(() => {
    el.textContent = '';
    el.classList.remove('hint', 'error');
    el.classList.remove('changing');
  }, 120);
};

export const startLoading = (wrapper) => {
  wrapper.classList.add('loading');
  wrapper.disabled = true;
};

export const stopLoading = (wrapper) => {
  wrapper.classList.remove('loading');
  wrapper.disabled = false;
};

export const hide = (el) => {
  el.classList.add('display-none');
};

export const show = (el) => {
  el.classList.remove('display-none');
};

/**
 *
 * @param {HTMLDivElement} oldEl
 * @param {HTMLDivElement} qrStep
 */
export const transitionToQR = (oldEl, qrStep) => {
  oldEl.style.display = 'none';
  qrStep.classList.add('open');
};
