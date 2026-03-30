/**
 *
 * @param {HTMLInputElement} input
 */
export const startTyping = (input) => {
  const phrases = [
    { text: 'Digite seu código de ingresso...', pause: 1200 },
    { text: 'Cola seu ID do ticket aqui...', pause: 1000 },
    { text: 'Pronto pra a Inspire?', pause: 1400 },
    { text: 'Vamos fazer seu check-in ✨', pause: 1500 },
  ];

  let i = 0,
    j = 0;
  let deleting = false;
  let cursor = true;

  setInterval(() => (cursor = !cursor), 500);

  const loop = () => {
    const text = phrases[i].text;

    j += deleting ? -1 : 1;

    input.placeholder = cursor
      ? text.substring(0, j) + '|'
      : text.substring(0, j);

    // pause at the end of the word, before deleting
    if (!deleting && j === text.length) {
      deleting = true;
      return setTimeout(loop, phrases[i].pause);
    }

    // move to the next phrase
    if (deleting && j === 0) {
      deleting = false;
      i = (i + 1) % phrases.length;
    }

    // type or backspaces
    setTimeout(loop, deleting ? 30 : 60);
  };

  loop();
};
