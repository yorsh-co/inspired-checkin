/**
 *
 * @param {HTMLDivElement} nextStep
 * @param {HTMLDivElement} currentStep
 * @param {{ delay: number }} options
 */
export const step = (nextStep, currentStep = null, options = {}) => {
 const {delay = 300} =options;
  return new Promise(resolve => {
    const isSameStep = nextStep === currentStep;

    if (isSameStep) {
      resolve();
      return;
    }

    if (currentStep) {
      currentStep.classList.remove('show');
      await utils.sleep(delay);
    }

    const onEnd = e => {
      if (e.target !== nextStep) return;

      nextStep.removeEventListener('transitionend', onEnd);
      resolve();
    };

    nextStep.addEventListener('transitionend', onEnd);

    requestAnimationFrame(() => {
      nextStep.classList.add('show');
    });

    setTimeout(resolve, 400);
  });
};

/**
 *
 * @param {HTMLDivElement} el
 */
const bootScreen = async el => {
  if (el.classList.contains('show')) {
    requestAnimationFrame(() => {
      /*bootEl.classList.add('hiding');
      bootEl.classList.remove('show');

      setTimeout(() => {
        bootEl.classList.remove('hiding');
      }, 400);*/
      el.classList.remove('show');
    });
  } else {
    requestAnimationFrame(() => {
      el.classList.add('show');
    });
  }
};

const transition = { step, bootScreen };

export default transition;
