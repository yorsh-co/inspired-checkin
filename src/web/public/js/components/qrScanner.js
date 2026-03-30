export const initQR = ({ onScan }) => {
  let scanner;

  const start = async () => {
    scanner = new Html5Qrcode('qrReader');

    await scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      decoded => onScan(decoded)
    );
  };

  return { start };
};
