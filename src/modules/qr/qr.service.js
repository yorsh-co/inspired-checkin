const jwt = require('jsonwebtoken');

const QR_SECRET = 'qr-secret';

// Generate QR token (used when creating QR codes)
const generate = ({ eventId }) => {
  return jwt.sign(
    { eventId },
    QR_SECRET,
    { expiresIn: '2h' } // adjust as needed
  );
};

// Verify QR token (used in /scan)
const verify = token => {
  try {
    return jwt.verify(token, QR_SECRET);
  } catch (err) {
    throw new Error('Invalid or expired QR code');
  }
};

module.exports = {
  generateQrToken,
  verifyQrToken
};
