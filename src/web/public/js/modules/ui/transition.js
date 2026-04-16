import utils from '../utils/index.js';
import ui from './index.js';

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
 * @param {{ container: HTMLDivElement }} options
 */
export const step = async (nextStep, currentStep = null, options = {}) => {
  const { container } = options;

  const isSameStep = nextStep === currentStep;

  // return for same step
  if (isSameStep) {
    if (!container) return;

    await new Promise((resolve) => {
      requestAnimationFrame(async () => {
        await new Promise((r) =>
          requestAnimationFrame(() => requestAnimationFrame(r)),
        );

        const currentHeight = container.getBoundingClientRect().height;

        const wrapperHeight = currentStep
          ? currentHeight - currentStep.getBoundingClientRect().height
          : 0;

        const endHeight =
          nextStep.getBoundingClientRect().height + wrapperHeight;

        if (Math.abs(endHeight - currentHeight) < 1) {
          resolve();
          return;
        }

        container.style.height = currentHeight + 'px';
        container.style.overflow = 'hidden';

        void container.offsetHeight;

        container.style.height = endHeight + 'px';

        await waitForHeightTransition(container);

        container.style.height = 'auto';
        container.style.overflow = '';

        resolve();
      });
    });

    return;
  }

  // lock container height
  let startHeight;
  let wrapperHeight;

  if (container) {
    startHeight = container.getBoundingClientRect().height;
    if (currentStep)
      wrapperHeight = startHeight - currentStep.getBoundingClientRect().height;

    container.style.height = startHeight + 'px';
    container.style.overflow = 'hidden';
  }

  if (currentStep) ui.element.setShow(currentStep, false);

  ui.element.setShow(nextStep, true);

  if (container) {
    void container.offsetHeight;

    // wait a full frame
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r)),
    );

    const endHeight =
      nextStep.getBoundingClientRect().height + (wrapperHeight || 0);

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
