/**
 * @typedef {'init'|'ticket'|'verification'|'qr'|'success'} CheckinStep
 */

/**
 * @typedef {Object} CheckinProgress
 * @property {boolean} ticket
 * @property {boolean} verified
 * @property {boolean} qr
 */

/**
 * @typedef {Object} CheckinFailedAttempts
 * @property {number} ticket
 * @property {number} verification
 * @property {number} qr
 */

export {};
