export const showError = (el, msg) => {
  el.textContent = msg;
  el.classList.add('error');
};

export const clearError = (el) => {
  el.textContent = '';
  el.classList.remove('error');
};

export const showHint = (el, msg) => {
  el.textContent = msg;
  el.classList.add('hint');
};

export const clearHint = (el) => {
  el.textContent = '';
  el.classList.remove('hint');
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
 * @param {HTMLDivElement} form
 * @param {HTMLDivElement} qrStep
 */
export const transitionToQR = (form, qrStep) => {
  form.style.display = 'none';
  qrStep.classList.add('open');
};
