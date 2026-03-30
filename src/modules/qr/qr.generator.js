const { generateQrToken } = require('./services/qrService');

const token = generateQrToken({
  eventId: 'abc123'
});

const qrUrl = `https://yourdomain.com/scan?token=${token}`;
