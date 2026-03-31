import * as ui from './ui.js';

/**
 *
 * @param {string} qrReaderId
 * @param {HTMLButtonElement} startCameraBtn
 * @param {HTMLDivElement} hintDiv
 * @param {(qrText: string) => Promise<void>|void} onScan
 */
export const setupQR = (qrReaderId, startCameraBtn, hintDiv, onScan) => {
  ui.showHint(hintDiv, '🤳 Aponte a câmera para o QR code da Inspire');
  const qrReader = document.getElementById(qrReaderId);
  const qrWrapper = qrReader.closest('.qr-reader-wrapper');

  startCameraBtn.addEventListener('click', async () => {
    try {
      ui.clearError(hintDiv);
      ui.showHint(hintDiv, 'Autorize o acesso à câmera no navegador…');

      startCameraBtn.disabled = true;

      ui.startLoading(startCameraBtn);

      const scanner = new Html5Qrcode(qrReaderId);

      ui.startLoading(qrWrapper);
      qrReader.classList.add('open');

      ui.stopLoading(startCameraBtn);
      ui.hide(startCameraBtn);

      const timeout = setTimeout(() => {
        console.error('qr scan timeout');
        ui.showError(
          hintDiv,
          'Não conseguiu escanear? Procure ajuda no evento ✨',
        );
      }, 20000);

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        async (decodedText) => {
          clearTimeout(timeout);
          await onScan(decodedText);
        },
      );

      ui.clearError(hintDiv);
      ui.showHint(hintDiv, '🤳 Aponte a câmera para o QR code da Inspire');

      await waitForVideoReady(qrReader);
      ui.stopLoading(qrWrapper);

      console.log('qr scanner started');

      // For testing
      /*await new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('test'));
        }, 1000);
      });*/
    } catch (err) {
      console.error(err);
      ui.showError(hintDiv, 'Erro ao acessar câmera');

      qrReader.classList.remove('open');
      ui.stopLoading(qrWrapper);

      ui.stopLoading(startCameraBtn);
      ui.show(startCameraBtn);
      startCameraBtn.disabled = false;
    }
  });
};

/**
 *
 * @param {*} qrEl
 * @param {*} timeoutMs
 * @returns
 */
const waitForVideoReady = (qrEl, timeoutMs = 5000) =>
  new Promise((resolve, reject) => {
    let videoDetectedAt = null;

    const check = () => {
      const video = qrEl.querySelector('video');

      if (video) {
        if (!videoDetectedAt) {
          videoDetectedAt = Date.now(); // start timeout HERE
        }

        if (video.readyState >= 2) {
          return resolve(video);
        }

        if (Date.now() - videoDetectedAt > timeoutMs) {
          return reject(new Error('Video element present but not loading'));
        }
      }

      requestAnimationFrame(check);
    };

    check();
  });
