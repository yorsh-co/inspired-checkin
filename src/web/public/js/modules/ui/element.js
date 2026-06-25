const setShow = (el, show) => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.classList.toggle('show', show);
    });
  });
};

const setProcessing = (el, isProcessing) => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.classList.toggle('processing', isProcessing);
    });
  });
};

const element = { setShow, setProcessing };
export default element;
