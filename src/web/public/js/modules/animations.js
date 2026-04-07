export const shake = (el) => {
  el.animate(
    [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-5px)' },
      { transform: 'translateX(5px)' },
      { transform: 'translateX(-5px)' },
      { transform: 'translateX(0)' },
    ],
    {
      duration: 300,
      easing: 'ease',
    },
  );
};
