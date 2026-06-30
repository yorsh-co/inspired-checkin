import { qs } from '../../../layouts/main/dom.js';

const dom = Object.freeze({
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
    captcha: qs('[data-checkin="ticket-captcha-div"]'),
  },

  verification: {
    hint: qs('[data-checkin="verification-hint-div"]'),
    tableWrapper: qs('[data-checkin="verification-table-wrapper"]'),
    tableToggle: qs('[data-checkin="verification-table-toggle"]'),
    tableToggleLabel: qs('[data-checkin="verification-table-toggle-label"]'),
    inputWrapper: qs('[data-checkin="verification-input-wrapper"]'),
    backBtn: qs('[data-checkin="verification-back-btn"]'),
  },

  qr: {
    hint: qs('[data-checkin="qr-hint-div"]'),
    tableWrapper: qs('[data-checkin="qr-table-wrapper"]'),
    tableToggle: qs('[data-checkin="qr-table-toggle"]'),
    tableToggleLabel: qs('[data-checkin="qr-table-toggle-label"]'),
    wrapper: qs('[data-checkin="qr-reader-wrapper"]'),
    reader: qs('[data-checkin="qr-reader-div"]'),
    startBtn: qs('[data-checkin="start-camera-btn"]'),
  },

  success: {
    hint: qs('[data-checkin="success-hint-div"]'),
    message: qs('[data-checkin="success-message"]'),
  },
});

export default dom;
