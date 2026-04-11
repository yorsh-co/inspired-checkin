import stepConfig from '../state/step-config.js';
import store from '../state/store.js';

import * as ui from '../../../../modules/ui.js';
import utils from '../../../../modules/utils/index.js';

export const goToStep = async (nextStepKey) => {
  const { currentStepKey } = store.getState();

  if (currentStepKey === nextStepKey) return;

  const nextStep = stepConfig[nextStepKey];
  const currentStep = currentStepKey ? stepConfig[currentStepKey] : null;

  if (!nextStep) {
    console.error(`[Step] Invalid step: ${nextStepKey}`);
    return;
  }

  if (currentStep && !currentStep.next?.includes(nextStepKey)) {
    console.warn(
      `[Step] Invalid transition: ${currentStepKey} → ${nextStepKey}`,
    );
    return;
  }

  try {
    if (currentStep?.onExit) {
      await currentStep.onExit();
    }

    await ui.showStep(nextStep.el, currentStep?.el);

    store.setState({ currentStepKey: nextStepKey });

    if (nextStep.onEnter) {
      await nextStep.onEnter(store.getState());
    }

    if (
      utils.isDesktop() &&
      nextStep.focusTarget &&
      !nextStep.focusTarget.disabled
    ) {
      ui.focusInput(nextStep.focusTarget);
    }
  } catch (err) {
    console.error('[Step Error]', err);

    store.setState({
      error: err.message || 'Unexpected error',
    });
  }
};
