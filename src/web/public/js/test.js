export const fakeRequest = code =>
  new Promise((res, rej) => setTimeout(() => code || 200, 1800));
