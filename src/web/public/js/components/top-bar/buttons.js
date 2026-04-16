/**
 *
 * @param {HTMLButtonElement} button
 * @param {*} handler
 */
export const setupTopBarBtn = async (button, handler) => {
  button.onclick = (e) => handler(e);
};
