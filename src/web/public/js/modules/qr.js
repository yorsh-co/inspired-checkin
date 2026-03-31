import * as ui from './ui.js';

/**
 *
 * @param {string} qrReaderId
 * @param {HTMLButtonElement} startCameraBtn
 * @param {HTMLDivElement} hintDiv
 * @param {(qrText: string) => Promise<void>|void} onScan
 */
export const setupQR = (qrReaderId, startCameraBtn, hintDiv, onScan) => {
  startCameraBtn.addEventListener('click', async () => {
    ui.showHint(
      hintDiv,
      'Use o QR code da Inspire para confirmar o check-in 🆗',
    );
    const qrReader = document.getElementById(qrReaderId);
    const qrWrapper = qrReader.closest('.qr-reader-wrapper');

    try {
      // update ui
      const permissionTimeout = setTimeout(() => {
        ui.showHint(hintDiv, '👉 Permita o acesso à câmera para continuar');
      }, 2000);

      startCameraBtn.disabled = true;

      ui.startLoading(startCameraBtn);

      // open qr reader div
      const scanner = new Html5Qrcode(qrReaderId);

      ui.startLoading(qrWrapper);
      qrReader.classList.add('open');

      ui.stopLoading(startCameraBtn);
      ui.hide(startCameraBtn);

      // set help timeout
      let helpTimeout;
      const startHelpTimeout = (delay = 30000) => {
        clearTimeout(helpTimeout);

        helpTimeout = setTimeout(() => {
          console.error('qr scan timeout');
          ui.showError(
            hintDiv,
            'Se o QR code não for reconhecido, procure ajuda no evento ✨',
          );
        }, delay);
      };
      startHelpTimeout();

      // start scanner
      let isProcessing = false;
      let lastScanTime = 0;

      const handleScan = async (decodedText) => {
        // check against repeated scans
        const now = Date.now();
        if (now - lastScanTime < 1500) return;
        if (isProcessing) return;

        lastScanTime = now;
        isProcessing = true;
        console.log('qr code scanned');

        try {
          clearTimeout(helpTimeout);

          // show loading
          ui.showHint(hintDiv, 'Processando o QR code… 🔎');
          setTimeout(() => {
            if (isProcessing) {
              ui.showHint(hintDiv, 'Isso pode levar alguns segundos… ⌛');
            }
          }, 2000);

          ui.startLoading(qrWrapper);
          qrReader.style.opacity = 0;

          await onScan(decodedText);
          // FIXME: handle errors or invalid QR code
        } catch (err) {
          console.error(err);
          ui.showError(
            hintDiv,
            /*err.code === 'INVALID_QR'
              ? 'Este QR code não é válido para este evento'
              :*/ 'Não foi possível ler este QR code ⚠️ Tente novamente ou use outro código',
          );

          startHelpTimeout(5000);
        } finally {
          // display the scanner again
          qrReader.style.opacity = 1;
          ui.stopLoading(qrWrapper);
          isProcessing = false;
        }
      };

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        handleScan,
      );

      // display the scanner
      clearTimeout(permissionTimeout);
      ui.showHint(
        hintDiv,
        'Aponte a câmera para o QR code disponível na recepção do evento 🤳',
      );

      await waitForVideoReady(qrReader);
      ui.stopLoading(qrWrapper);

      console.log('qr scanner started');
    } catch (err) {
      console.error(err);
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
