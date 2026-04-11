const debugIsAllowedHost = () => {
  const host = location.hostname;
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.startsWith('192.168.') ||
    host.startsWith('100.') ||
    host.endsWith('.trycloudflare.com')
  );
};

const isDebug = (params = null) => {
  if (!debugIsAllowedHost()) return;

  const searchParams = params || new URLSearchParams(window.location.search);

  if (searchParams.get('debug') === 'true')
    localStorage.setItem('debug', 'true');

  if (searchParams.get('debug') === 'false') localStorage.removeItem('debug');

  return localStorage.getItem('debug') === 'true';
};

/**
 *
 * @param {*} handler
 * @param {string} buttonTxt
 * @param {boolean} removeOnClick
 */
export const setupDebugButton = async (handler, buttonTxt, removeOnClick) => {
  const testButton = document.getElementById('debug-button');

  if (testButton) {
    testButton.classList.add('available');
    testButton.textContent = `debug [${buttonTxt}]`;

    testButton.addEventListener('click', () => {
      handler();
      if (removeOnClick) {
        setTimeout(() => testButton.classList.remove('available'), 500);
      }
    });
  }
};

export const initErudaDebugMode = () => {
  if (!isDebug()) return;

  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/eruda';
  script.onload = () => eruda.init();

  document.body.appendChild(script);
};

initErudaDebugMode();
