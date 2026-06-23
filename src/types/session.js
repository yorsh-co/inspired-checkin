/** @import { CheckinStep, CheckinProgress } from './checkin.js' */

/**
 * @typedef {Object} CheckinSession
 * @property {'checkin'} type
 * @property {number} version
 *
 * @property {CheckinProgress} progress
 * @property {CheckinStep} currentStep
 * @property {'direct'|'ticket'|'qr'} source
 *
 * @property {string|null} userId
 * @property {string|null} eventId
 *
 * @property {Date|null} checkinAt
 * @property {string|null} checkinNumber
 * @property {boolean|null} checkinComplete
 *
 * @property {Object} ticket
 * @property {string} ticket.ticketCode
 * @property {Date} ticket.timestamp
 *
 * @property {Object} verification
 * @property {string} verification.phoneHash
 * @property {string} verification.phoneLast4Hash
 * @property {Date} verification.timestamp
 *
 * @property {Object} qr
 * @property {string} qr.qrToken
 * @property {Date} qr.timestamp
 *
 * @property {Object} userPreview
 * @property {Object} userPreview.ticketCode
 * @property {Object} userPreview.name
 * @property {Object} userPreview.phoneStart
 *
 * @property {string} ua
 *
 * @property {Date} updatedAt
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} UserSession
 * @property {'user'} type
 * @property {number} version
 *
 * @property {string} userId
 * @property {number} checkinNumber
 * @property {number} checkinAt
 *
 */

/**
 * @typedef {Object} AdminSession
 * @property {'admin'} type
 * @property {number} version
 */

/**
 * @typedef {CheckinSession|UserSession|AdminSession} Session
 */

/**
 * @typedef {'checkin'|'user'|'admin'} SessionType
 */

export {};
