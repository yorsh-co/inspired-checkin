import stepConfig from '../state/step-config.js';
import store from '../state/store.js';

import utils from '../../../../modules/utils/index.js';
import ui from '../../../../modules/ui/index.js';

export const goToStep = async (nextStepKey, options = {}) => {
  const { skeleton = false } = options;
  console.log('[Step] loading', nextStepKey, 'skeleton', skeleton);

  const { currentStepKey, isSkeleton } = store.getState();

  const isSameStep = currentStepKey === nextStepKey;

  if (
      isSameStep && 
      skeleton
    ) { 
    console.warn('[Step] is already open'); 
    return;
  }

  const nextStep = stepConfig[nextStepKey];
  const currentStep = currentStepKey ? stepConfig[currentStepKey] : null;

  if (!nextStep) {
    console.warn(`[Step] Invalid step: ${nextStepKey}`);
    return;
  }

  if (
    currentStep && 
    !isSameStep &&
    !currentStep.next?.includes(nextStepKey)
    ) {
    console.warn(
      `[Step] Invalid transition: ${currentStepKey} → ${nextStepKey}`,
    );
    return;
  }

  try {
    if (currentStep?.onExit) {
      await currentStep.onExit();
    }
console.warn('start')
    await ui.transition.step(nextStep.el, isSameStep ? null : currentStep?.el, {
      delay: skeleton ? 0 : 300,
    });
console.warn('end')
    store.setState({ currentStepKey: nextStepKey, isSkeleton: skeleton });

    if (nextStep.onEnter) {
      await nextStep.onEnter(store.getState(), { skeleton });
    }

    if (
      !skeleton &&
      utils.isDesktop() &&
      nextStep.focusTarget &&
      !nextStep.focusTarget.disabled
    ) {
      nextStep.focusTarget.focus();
    }
  } catch (err) {
    console.error('[Step Error]', err);

    store.setState({
      error: err.message || 'Unexpected error',
    });
  }
};
