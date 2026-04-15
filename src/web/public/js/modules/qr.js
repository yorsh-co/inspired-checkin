import ui from './ui/index.js';
import utils from './utils/index.js';

/**
 *
 * @param {object} params
 * @param {HTMLDivElement} params.qrReaderDiv
 * @param {HTMLButtonElement} params.startCameraBtn
 * @param {HTMLDivElement} params.hintDiv
 * @param {(qrText: string) => Promise<void>|void} params.onScan
 */
export const setupQr = ({
  qrReaderDiv,
  startCameraBtn,
  hintDiv,
  onScan,
} = {}) => {
  startCameraBtn.addEventListener('click', async () => {
    const qrWrapper = qrReaderDiv.closest('.qr-reader-wrapper');
    const defaultHint = hintDiv.textContent;

    let helpTimeout;

    try {
      const permissionTimeout = setTimeout(() => {
        ui.hint.showHint(hintDiv, '👆 Libera acesso à câmera pra continuar');
      }, 3000);

      // update ui
      startCameraBtn.disabled = true;
      ui.element.setShow(startCameraBtn, false);

      ui.skeleton.render(qrWrapper);
      ui.element.setShow(qrWrapper, true);

      // open qr reader div
      const scanner = new Html5Qrcode(qrReaderDiv.id);

      // set help hint timeout
      const startHelpTimeout = (delay = 20000) => {
        clearTimeout(helpTimeout);

        helpTimeout = setTimeout(() => {
          console.error('qr scan timeout');
          ui.hint.showError(
            hintDiv,
            'Se não funcionar, chama um voluntário ✨',
          );
        }, delay);
      };
      startHelpTimeout();

      // scan handler
      let isProcessing = false;
      let lastScanTime = 0;

      const handleScan = async (decodedText) => {
        // guard against repeated scans
        const now = Date.now();
        if (now - lastScanTime < 1500) return;
        if (isProcessing) return;

        lastScanTime = now;
        isProcessing = true;
        console.debug('qr code scanned', decodedText);

        try {
          scanner.pause(true);

          clearTimeout(helpTimeout);

          ui.element.setProcessing(qrWrapper, true);
          ui.hint.showHint(hintDiv, 'Lendo o QR code... 🔎');

          await onScan(decodedText);

          scanner.stop();
        } catch (err) {
          console.error(err);
          ui.hint.showError(
            hintDiv,
            'Ops! Não deu pra ler esse QR 😕 Tenta de novo ou usa outro',
          );
          utils.sleep(1200);

          ui.element.setProcessing(qrWrapper, false);

          scanner.resume();

          startHelpTimeout(10000);
        } finally {
          isProcessing = false;
        }
      };

      // start the scanner
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        handleScan,
      );

      // display the scanner
      clearTimeout(permissionTimeout);
      ui.hint.showHint(hintDiv, defaultHint);

      await waitForVideoReady(qrReaderDiv);

      ui.skeleton.clear(qrWrapper);

      console.log('qr scanner started');

    } catch (err) {
      console.error(err);

      clearTimeout(helpTimeout);

      // FIXME: handle different error types
      ui.hint.showError(
        hintDiv,
        'Não foi possível acessar a câmera 📷 Verifique as permissões e tente novamente',
      );

      ui.element.setShow(qrWrapper, false);

      ui.element.setShow(startCameraBtn, true);
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
          videoDetectedAt = Date.now();
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
