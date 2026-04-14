const show = (el) => {
  el.classList.add('show');
};

const hide = (el) => {
  el.classList.remove('show');
};

const element = { show, hide };
export default element;
