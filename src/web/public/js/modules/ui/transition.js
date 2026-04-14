import utils from '../utils/index.js';

const waitForHeightTransition = (el) => {
  return new Promise((resolve) => {
    const onEnd = (e) => {
      if (e.propertyName !== 'height') return;

      el.removeEventListener('transitionend', onEnd);
      resolve();
    };

    el.addEventListener('transitionend', onEnd);

    // fallback
    setTimeout(resolve, 300);
  });
};

/**
 *
 * @param {HTMLDivElement} nextStep
 * @param {HTMLDivElement} currentStep
 * @param {{ delay: number, container: HTMLDivElement }} options
 */
export const step = async (
  nextStep,
  currentStep = null,
  options = {}
) => {
  const { delay = 300, container } = options;

  const isSameStep = nextStep === currentStep;

  // -----------------------------
  // HEIGHT LOCK
  // -----------------------------
  let startHeight;

  if (container) {
    startHeight = container.offsetHeight;
    container.style.height = startHeight + 'px';
    container.style.overflow = 'hidden';
  }

  // -----------------------------
  // SAME STEP (skeleton → real)
  // -----------------------------
  if (isSameStep) {
    if (container) {
      const endHeight = container.scrollHeight;

      container.style.height = endHeight + 'px';

      await waitForHeightTransition(container);
    }

    return;
  }

  // -----------------------------
  // EXIT CURRENT STEP
  // -----------------------------
  if (currentStep) {
    currentStep.classList.remove('show');
    await utils.sleep(delay);
  }

  // -----------------------------
  // ENTER NEXT STEP
  // -----------------------------
  await new Promise((resolve) => {
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

  // -----------------------------
  // HEIGHT ADJUST
  // -----------------------------
  if (container) {
    const endHeight = container.scrollHeight;

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
