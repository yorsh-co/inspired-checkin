import {
  startLoading,
  stopLoading,
  showError,
  clearError,
  transitionToQR
} from './ui.js';

/**
 *
 * @param {string} qrReaderId
 * @param {HTMLButtonElement} startCameraBtn
 * @param {HTMLDivElement} errorDiv
 * @param {(qrText: string) => Promise<void>|void} onScan
 */
export const setupQR = (qrReaderId, startCameraBtn, errorDiv, onScan) => {
  startCameraBtn.addEventListener('click', async () => {
    try {
      clearError(errorDiv);
      startCameraBtn.disabled = true;

      startLoading(startCameraBtn);
      showError(errorDiv, 'Autorize o acesso à câmera no navegador…'); // TODO: hint instead of error

      const scanner = new Html5Qrcode(qrReaderId);

      const timeout = setTimeout(() => {
        showError(
          errorDiv,
          'Não conseguiu escanear? Procure ajuda no evento ✨'
        );
      }, 15000);

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        async decodedText => {
          clearTimeout(timeout);
          await onScan(decodedText);
        }
      );

      // TODO: transition qr content
      // transitionToQR(form, qrStep);

      stopLoading(startCameraBtn);
      startCameraBtn.style.display = 'none';
      clearError(errorDiv);
    } catch (err) {
      console.error(err);
      showError('Erro ao acessar câmera');
      startCameraBtn.disabled = false;
    }
  });
};
