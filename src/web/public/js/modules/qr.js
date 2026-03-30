/**
 *
 * @param {string} qrReaderId
 * @param {HTMLButtonElement} startCameraBtn
 * @param {HTMLDivElement} error
 * @param {(qrText: string) => Promise<void>|void} onScan
 */
export const setupQR = (qrReaderId, startCameraBtn, error, onScan) => {
  startCameraBtn.addEventListener('click', async () => {
    try {
      error.textContent = '';
      startCameraBtn.disabled = true;

      // TODO: loading

      const scanner = new Html5Qrcode(qrReaderId);

      const timeout = setTimeout(() => {
        error.textContent =
          'Não conseguiu escanear? Procure ajuda no evento ✨';
      }, 15000);

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        async (decodedText) => {
          clearTimeout(timeout);
          await onScan(decodedText);
        },
      );

      startCameraBtn.style.display = 'none';
    } catch (err) {
      console.error(err);
      error.textContent = 'Erro ao acessar câmera';
      startCameraBtn.disabled = false;
    }
  });
};
