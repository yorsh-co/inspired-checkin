export const showError = (el, msg) => {
  el.textContent = msg;
  el.classList.add('error');
};

export const clearError = (el) => {
  el.textContent = '';
  el.classList.remove('error');
};

export const startLoading = (wrapper) => {
  wrapper.classList.add('loading');
};

export const stopLoading = (wrapper) => {
  wrapper.classList.remove('loading');
};

/**
 *
 * @param {HTMLDivElement} form
 * @param {HTMLDivElement} qrStep
 */
export const transitionToQR = (form, qrStep) => {
  form.style.display = 'none';

  qrStep.style.display = 'flex';
  qrStep.style.opacity = '0';

  setTimeout(() => {
    qrStep.style.opacity = '1';
  }, 150);
};
