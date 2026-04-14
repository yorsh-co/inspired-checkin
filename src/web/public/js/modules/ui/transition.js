import utils from '../utils/index.js';

const waitForHeightTransition = (el) => {
  return new Promise((resolve) => {
    const onEnd = (e) => {
      if (e.propertyName !== 'height') return;

      el.removeEventListener('transitionend', onEnd);
      resolve();
    };

    el.addEventListener('transitionend', onEnd);

    setTimeout(resolve, 300);
  });
};

/**
 *
 * @param {HTMLDivElement} nextStep
 * @param {HTMLDivElement} currentStep
 * @param {{ delay: number, container: HTMLDivElement }} options
 */
export const step = async (nextStep, currentStep = null, options = {}) => {
  const { delay = 300, container } = options;

  const isSameStep = nextStep === currentStep;

  // lock container height
  let startHeight;

  if (container) {
    startHeight = container.offsetHeight;
    container.style.height = startHeight + 'px';
    container.style.overflow = 'hidden';
  }

  // return for same step
  if (isSameStep) {
    if (container) {
      await new Promise((r) => requestAnimationFrame(r));
      const endHeight = nextStep.getBoundingClientRect().height;

      container.style.height = endHeight + 'px';

      await waitForHeightTransition(container);
    }
    return;
  }

  // hide current step
  if (currentStep) {
    currentStep.classList.remove('show');
    await utils.sleep(delay);
  }

  // show new step
  await new Promise((resolve) => {
    const onEnd = (e) => {
      if (e.target !== nextStep) return;

      container.removeEventListener('transitionend', onEnd);
      resolve();
    };

    nextStep.addEventListener('transitionend', onEnd);

    requestAnimationFrame(() => {
      nextStep.classList.add('show');
    });

    setTimeout(resolve, 400);
  });

  // adjust container height
  if (container) {
    await new Promise((r) => requestAnimationFrame(r));
    const endHeight = container.getBoundingClientRect().height;

    container.style.height = endHeight + 'px';

    await waitForHeightTransition(container);

    container.style.height = 'auto';
    container.style.overflow = '';
  }
};

/**
 *
 * @param {HTMLDivElement} el
 */
const bootScreen = (el) => {
  const show = () => {
    requestAnimationFrame(() => {
      el.classList.add('show');
    });
  };
  const hide = () => {
    requestAnimationFrame(() => {
      el.classList.remove('show');
    });
  };
  const transition = () => {
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

  return {
    show,
    hide,
    transition,
  };
};

const transition = { step, bootScreen };

export default transition;
