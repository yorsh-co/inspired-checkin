/**
 *
 * @param {string} qrCode
 */
export const handleQRScan = async (qrCode) => {
  try {
    //alert(qrCode);

    navigator.vibrate?.(50);

    //inputWrapper.classList.add('loading');

    await verifyQR(qrCode);

    //document.body.style.opacity = '0.7';

    setTimeout(() => {
      alert('OK');
      // TODO: goToApp();
    }, 250);
  } catch {
    //error.textContent = 'QR inválido — tente novamente ✨';
    inputWrapper.classList.remove('loading');
    startQRScanner(); // restart scanning
  }
};

/**
 * TODO:
 * @param {} qrCode
 * @returns
 */
const verifyQR = async (qrCode) => {
  const res = await fetch('/api/verify-presence', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ qrCode }),
  });

  if (!res.ok) throw new Error('invalid');

  return res.json();
};
