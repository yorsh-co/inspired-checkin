let uiState = {
  currentStepKey: null,
  isSkeleton: false
};

const listeners = new Set();

const store = {
  getState: () => uiState,

  setState: (partial) => {
    uiState = { ...uiState, ...partial };

    listeners.forEach((fn) => fn(uiState));
  },

  subscribe: (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

export default store;
