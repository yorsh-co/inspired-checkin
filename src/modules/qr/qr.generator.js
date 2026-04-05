import { generateQrToken } from './qr.service.js';

export const token = generateQrToken({
  eventId: 'abc123'
});

export const qrUrl = `https://yourdomain.com/scan?token=${token}`;
