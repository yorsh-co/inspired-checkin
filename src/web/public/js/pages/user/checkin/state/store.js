let state = {
  currentUiStepKey: null,
  captchaRequired: null,
  isSkeleton: null,
  session: null, // { progress, userPreview, currentStep }
};

const listeners = new Set();

const store = {
  getState: () => state,

  setState: (partial) => {
    state = { ...state, ...partial };

    listeners.forEach((fn) => fn(state));
  },

  subscribe: (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

export default store;
