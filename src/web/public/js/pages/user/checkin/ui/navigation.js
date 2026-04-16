import stepConfig from '../state/step-config.js';
import store from '../state/store.js';

import utils from '../../../../modules/utils/index.js';
import ui from '../../../../modules/ui/index.js';

import dom from '../dom.js';

export const goToStep = async (nextStepKey, options = {}) => {
  const { skeleton = false } = options;

  const { currentUiStepKey } = store.getState();
  console.debug(
    '[Step] loading',
    skeleton ? 'skeleton' : 'hydrated',
    nextStepKey,
    'from',
    currentUiStepKey,
  );

  const isSameStep = currentUiStepKey === nextStepKey;

  if (isSameStep && skeleton) {
    console.warn('[Step] is already open');
    return;
  }

  const nextStep = stepConfig[nextStepKey];
  const currentStep = currentUiStepKey ? stepConfig[currentUiStepKey] : null;

  if (!nextStep) {
    console.warn(`[Step] Invalid step: ${nextStepKey}`);
    return;
  }

  if (currentStep && !isSameStep && !currentStep.next?.includes(nextStepKey)) {
    console.warn(
      `[Step] Invalid transition: ${currentUiStepKey} --> ${nextStepKey}`,
    );
    return;
  }

  try {
    if (currentStep?.onExit) {
      await currentStep.onExit();
    }

    await ui.transition.step(nextStep.el, currentStep?.el, {
      delay: skeleton ? 0 : 300,
      container: dom.main.container,
    });
    
    store.setState({ currentUiStepKey: nextStepKey, isSkeleton: skeleton });
    
    // filter top-bar buttons
    document.body.dataset.step = nextStepKey;

    if (nextStep.onEnter) {
      await nextStep.onEnter(store.getState(), { skeleton });
    }
  } catch (err) {
    console.error('[Step Error]', err);

    store.setState({
      error: err.message || 'Unexpected error',
    });
  }
};
