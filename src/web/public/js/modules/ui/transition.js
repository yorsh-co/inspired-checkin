/**
 *
 * @param {HTMLDivElement} nextStep
 * @param {HTMLDivElement} currentStep
 * @param {{ delay: number }} options
 */
const step = async (nextStep, currentStep = null, options = {}) => {
  //const { delay = 300 } = options;

  return new Promise((resolve) => {
    if (currentStep) currentStep.classList.remove('show');

    /*setTimeout(() => {
      nextStep.classList.add('show');
      resolve();
    }, delay);*/
    const onEnd = () => {
      nextStep.removeEventListener('transitionend', onEnd);
      resolve();
    };

    nextStep.addEventListener('transitionend', onEnd);

    requestAnimationFrame(() => {
      nextStep.classList.add('show');
    });
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
