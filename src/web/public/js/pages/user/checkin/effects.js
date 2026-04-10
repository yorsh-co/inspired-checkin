import { store } from './store.js';
import { runSuccessFlow } from './success.step.js';
import { populateVerificationValues } from './verification.step.js';

export const onStepChange = (step, handler) => {
  let prevStep = null;

  store.subscribe(async (state) => {
    const currentStep = state.currentStep;

    if (currentStep === step && prevStep !== step) {
      await handler();
    }

    prevStep = currentStep;
  });
};

export const initCheckinEffects = () => {
  onStepChange('success', async () => {
    await runSuccessFlow();
  });

  onStepChange('verification', async () => {
    const { userData } = store.getState();

    if (!userData) throw new Error('User data is missing');

    populateVerificationValues(userData);
  });
};
