export const initInput = ({ onSubmit }) => {
  const input = document.getElementById('input');

  input.addEventListener('input', () => {
    // formatting, validation...
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      onSubmit(input.value);
    }
  });
};
