/**
 *
 * @param {HTMLElement} el
 * @returns {boolean}
 */
const isCenteredInViewport = (el) => {
  const rect = el.getBoundingClientRect();
  const viewportCenter = window.innerHeight / 2;
  const elCenter = rect.top + rect.height / 2;

  return Math.abs(viewportCenter - elCenter) < 20; // tolerance
};

/**
 *
 * @param {HTMLElement} element
 */
export const attachScrollOnResize = (element) => {
  let timeout;
  const observer = new ResizeObserver(() => {
    clearTimeout(timeout);

    if (!isCenteredInViewport(element)) {
      timeout = setTimeout(() => {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });
      }, 300);
    }
  });

  observer.observe(element);

  return () => observer.disconnect();
};
