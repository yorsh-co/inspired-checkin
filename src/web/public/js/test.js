export const fakeRequest = code =>
  new Promise((res, rej) => setTimeout(() => res(code || 200), 1800));

export const setupButton = async handler => {
  const testButton = document.getElementById('skip-button');
  if (testButton) {
    testButton.classList.add('available');
    testButton.addEventListener('click', () => {
      handler();
      setTimeout(() => testButton.classList.remove('available'), 500);
    });
  }
};

export const log = async (level, ...args) => {
  try {
    await fetch('/__log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level, args })
    });
  } catch (err) {
    console.error(err);
  }

  ['log', 'error', 'warn'].forEach(level => {
    const original = console[level];
    console[level] = (...args) => {
      original(...args);
      sendLog(level, args);
    };
  });
};
