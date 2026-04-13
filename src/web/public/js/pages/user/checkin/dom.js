import { qs } from '../../../layouts/main/dom.js';

const pageDom = Object.freeze({
  main: {
    container: qs('[data-checkin="main-container"]'),
  },

  steps: {
    qr: qs('[data-checkin="qr-step"]'),
    ticket: qs('[data-checkin="ticket-step"]'),
    verification: qs('[data-checkin="verification-step"]'),
    success: qs('[data-checkin="success-step"]'),
  },

  inputs: {
    ticketCode: qs('[data-checkin="ticket-code-input"]'),
    verificationCode: qs('[data-checkin="verification-code-input"]'),
  },

  ticket: {
    hint: qs('[data-checkin="ticket-hint-div"]'),
    inputWrapper: qs('[data-checkin="ticket-input-wrapper"]'),
  },

  verification: {
    hint: qs('[data-checkin="verification-hint-div"]'),
    inputWrapper: qs('[data-checkin="verification-input-wrapper"]'),
    backBtn: qs('[data-checkin="verification-back-btn"]'),
  },

  qr: {
    reader: qs('[data-checkin="qr-reader-div"]'),
    startBtn: qs('[data-checkin="start-camera-btn"]'),
    hint: qs('[data-checkin="qr-hint-div"]'),
  },

  success: {
    message: qs('[data-checkin="success-message"]'),
  },
});

export default pageDom;
