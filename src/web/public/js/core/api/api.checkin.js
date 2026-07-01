import { request } from './api.request.js';

export const submitTicket = async (ticket, captchaToken) =>
  request('/api/v1/checkin/ticket', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticket, captchaToken }),
  });

export const submitVerification = async (verificationCode) =>
  request('/api/v1/checkin/verification', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ verificationCode }),
  });

export const submitQrCode = async (qrCode) =>
  request('/api/v1/checkin/qr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qrCode }),
  });

export const reset = async () =>
  request('/api/v1/checkin/reset', {
    method: 'POST',
  });

export const debugSession = async () =>
  request('/api/v1/debug/session', {
    method: 'GET',
  });
