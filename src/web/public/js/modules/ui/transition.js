/**
 *
 * @param {HTMLDivElement} nextStep
 * @param {HTMLDivElement} currentStep
 * @param {{ delay: number }} options
 */
export const step = (nextStep, currentStep = null) => {
  return new Promise((resolve) => {
    const isSameStep = nextStep === currentStep;

    if (isSameStep) {
      resolve();
      return;
    }

    if (currentStep) currentStep.classList.remove('show');

    const onEnd = (e) => {
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
const bootScreen = async (el) => {
  if (el.classList.contains('show')) {
    requestAnimationFrame(() => {
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
