import * as test from '../test.js';
import * as ui from './ui.js';

/**
 *
 * @param {object} params
 * @param {string} params.qrReaderId
 * @param {HTMLButtonElement} params.startCameraBtn
 * @param {HTMLDivElement} params.hintDiv
 * @param {(qrText: string) => Promise<void>|void} params.onScan
 */
export const setupQr = ({
  qrReaderId,
  startCameraBtn,
  hintDiv,
  onScan,
} = {}) => {
  startCameraBtn.addEventListener('click', async () => {
    const qrReader = document.getElementById(qrReaderId);
    const qrWrapper = qrReader.closest('.qr-reader-wrapper');

    let helpTimeout;
    const defaultHint = hintDiv.textContent;

    try {
      // update ui
      const permissionTimeout = setTimeout(() => {
        ui.showHint(hintDiv, '👆 Libera acesso à câmera pra continuar');
      }, 3000);

      startCameraBtn.disabled = true;
      ui.startLoading(startCameraBtn);

      // open qr reader div
      const scanner = new Html5Qrcode(qrReaderId);

      ui.startLoading(qrWrapper);
      qrReader.classList.add('open');

      ui.stopLoading(startCameraBtn);
      ui.hide(startCameraBtn);

      // set help hint timeout
      const startHelpTimeout = (delay = 20000) => {
        clearTimeout(helpTimeout);

        helpTimeout = setTimeout(() => {
          console.error('qr scan timeout');
          ui.showError(hintDiv, 'Se não funcionar, chama um voluntário ✨');
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
        console.log('qr code scanned');

        try {
          clearTimeout(helpTimeout);

          // show loading
          ui.showHint(hintDiv, 'Lendo o QR code... 🔎');
          setTimeout(() => {
            if (isProcessing) {
              ui.showHint(hintDiv, 'Isso pode levar uns segundinhos... ⌛');
            }
          }, 2000);

          ui.startLoading(qrWrapper);
          qrReader.style.opacity = 0;

          // handle the scan
          await onScan(decodedText, hintDiv);
          scanner.stop();
          return;
          // FIXME: roll back if onScan error
        } catch (err) {
          console.error(err);
          ui.showError(
            hintDiv,
            'Ops! Não deu pra ler esse QR 😕 Tenta de novo ou usa outro',
          );

          startHelpTimeout(10000);
        } finally {
          // display the scanner again
          qrReader.style.opacity = 1;
          ui.stopLoading(qrWrapper);
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
      ui.showHint(hintDiv, defaultHint);

      await waitForVideoReady(qrReader);
      ui.stopLoading(qrWrapper);

      console.log('qr scanner started');

      // FIXME: test
      test.setupButton(() => handleScan('test'));
    } catch (err) {
      console.error(err);

      clearTimeout(helpTimeout);

      // FIXME: handle different error types
      ui.showError(
        hintDiv,
        'Não foi possível acessar a câmera 📷 Verifique as permissões e tente novamente',
      );

      // hide the scanner
      qrReader.classList.remove('open');
      ui.stopLoading(qrWrapper);

      // show the camera start button
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
