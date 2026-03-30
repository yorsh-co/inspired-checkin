/**
 * 
 * @param {HTMLElement} element 
 * @returns 
 */
export const attachScrollOnResize = (element) => {
  const observer = new ResizeObserver(() => {
    setTimeout(() => {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }, 100);
  });

  observer.observe(element);

  return () => observer.disconnect();
};
