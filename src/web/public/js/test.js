export const fakeRequest = code =>
  new Promise((res, rej) => setTimeout(() => res(code || 200), 1800));

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
