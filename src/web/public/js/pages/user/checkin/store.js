let uiState = {
  currentStep: null,
};

const listeners = new Set();

export const store = {
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
