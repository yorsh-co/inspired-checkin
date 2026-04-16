/**
 *
 * @param {HTMLElement} el
 */
export const setupCursorGlow = (el) => {
  let timeout;
  let lastX = 0;
  let lastY = 0;

  if (el.dataset['cursorGlow'] === 'true') return;

  const showGlow = () => {
    el.classList.add('active');

    clearTimeout(timeout);

    timeout = setTimeout(() => {
      el.classList.remove('active');
    }, 300);
  };

  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - lastX;
    const dy = y - lastY;

    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
      el.style.setProperty('--x', `${x}px`);
      el.style.setProperty('--y', `${y}px`);

      showGlow();

      lastX = x;
      lastY = y;
    }
  });

  el.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    const rect = el.getBoundingClientRect();

    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    el.style.setProperty('--x', `${x}px`);
    el.style.setProperty('--y', `${y}px`);

    showGlow();
  });

  el.dataset['cursorGlow'] = 'true';
};
