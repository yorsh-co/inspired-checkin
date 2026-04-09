import * as animate from './animations.js';

export const showError = async (el, msg) => {
  el.classList.remove('hint');
  el.textContent = msg;
  animate.shake(el);
  el.classList.add('error');
};

export const clearError = async el => {
  el.textContent = '';
  el.classList.remove('error');
};

export const showHint = async (el, msg) => {
  if (el.textContent === msg && el.classList.contains('hint')) return;
  el.classList.add('changing');

  setTimeout(() => {
    el.classList.remove('error');
    el.textContent = msg;
    el.classList.add('hint');
    el.classList.remove('changing');
  }, 120);
};

export const clearHint = async el => {
  el.classList.add('changing');

  setTimeout(() => {
    el.textContent = '';
    el.classList.remove('hint');
    el.classList.remove('changing');
  }, 120);
};

export const clear = async el => {
  el.classList.add('changing');

  setTimeout(() => {
    el.textContent = '';
    el.classList.remove('hint', 'error');
    el.classList.remove('changing');
  }, 120);
};

export const change = async (el, msg) => {
  if (el.textContent === msg) return;
  el.classList.add('changing');

  setTimeout(() => {
    el.textContent = msg;

    requestAnimationFrame(() => {
      el.classList.remove('changing');
    });
  }, 120);
};

export const startLoading = async wrapper => {
  wrapper.classList.add('loading');
  wrapper.disabled = true;
};

export const stopLoading = async wrapper => {
  wrapper.classList.remove('loading');
  wrapper.disabled = false;
};

export const hide = el => {
  el.classList.add('display-none');
};

export const show = el => {
  el.classList.remove('display-none');
};

/**
 *
 * @param {HTMLDivElement} nextStep
 * @param {HTMLDivElement} currentStep
 */
export const showStep = async (nextStep, currentStep = null) => {
  if (currentStep) currentStep.classList.remove('show');

  setTimeout(() => {
    nextStep.classList.add('show');
  }, 200);
};

/**
 *
 * @param {HTMLDivElement} oldEl
 * @param {HTMLDivElement} qrStep
 */
/*export const transitionToQR = (oldEl, qrStep) => {
  oldEl.style.display = 'none';
  qrStep.classList.add('open');
};

/**
 *
 * @param {HTMLElement} oldEl
 * @param {HTMLElement} success
 */
/*export const transitionToSuccess = (oldEl, success) => {
  oldEl.classList.add('fade-out');
  success.classList.add('show');
};*/

export const focusInput = ({ input = null, q = '' }) => {
  if (input) input.focus();
  else if (q) document.querySelector(q).focus();
  else console.error('`focusInput` failed: missing arguments');
};
