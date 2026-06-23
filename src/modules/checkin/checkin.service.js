import { applyStep, getNextStep, isComplete } from './checkin.flow.js';
import { checkinSession } from './checkin.session.adapter.js';

import { getUserByTicket, completeCheckin } from '../user/user.service.js';
import { maskName, maskPhone } from '../../shared/utils/mask.js';
import { hash } from '../../shared/utils/hash.js';
import { qrService } from '../qr/qr.service.js';
import { env } from '../../config/env.js';
import { userSession } from '../user/user.session.adapter.js';

/** @import { User } from '../../types/user.js' */
/** @import { CheckinSession, UserSession } from '../../types/session.js' */
/** @import { CheckinStep } from '../../types/checkin.js' */

export class CheckinService {
  constructor({ req, res }) {
    this.req = req;
    this.res = res;

    /** @type {CheckinSession} */
    this.session = null;

    /** @type {String} */
    this.sessionId = '';
  }

  // =========================
  // PUBLIC API
  // =========================

  /**
   * Initialize a checkin session.
   * Accepts initialization with a QR Code token
   * or a ticket code.
   *
   * @param {Object} options
   * @param {string} options.qrToken
   * @param {string} options.ticketToken
   *
   * @returns {Object}
   */
  async init({ qrToken, ticketCode }) {
    await this._initSession();

    let data = {};

    if (this.session.currentStep !== 'init') {
      data.session = {
        progress: this.session.progress,
        userPreview: this.session.userPreview,
      };
    }

    if (ticketCode && !this.session.progress.ticket) {
      this.session.source = 'ticket';

      const result = await this._processTicket(ticketCode);

      this.session = result.session;

      data = { ...data, ...result.data };
    }

    if (qrToken && !this.session.progress.qr) {
      this.session.source = 'qr';

      const result = await this._processQrToken(qrToken);

      this.session = result.session;

      data = { ...data, ...result.data };
    }

    return this._persistAndRespond(this.session, data);
  }

  /**
   * Submit ticket code.
   *
   * @param {string} ticketCode
   *
   * @returns {Object}
   */
  async submitTicket(ticketCode) {
    await this._initSession();

    const { session, data } = await this._processTicket(ticketCode);

    return await this._persistAndRespond(session, data);
  }

  /**
   * Submit verification code.
   *
   * @param {string} verificationCode
   *
   * @returns {Object}
   */
  async submitVerification(verificationCode) {
    await this._initSession();

    const rotated = await checkinSession.rotate(
      this.req,
      this.res,
      this.sessionId,
    );

    this.sessionId = rotated.sessionId;
    this.session = rotated.session;

    const { session, data } = await this._processVerification(verificationCode);

    return await this._persistAndRespond(session, data);
  }

  /**
   * Submit QR code.
   *
   * @param {string} qrCode
   *
   * @returns {Object}
   */
  async submitQrCode(qrCode) {
    await this._initSession();

    const token = qrService.extractToken(qrCode);

    const { session, data } = await this._processQrToken(token);

    return await this._persistAndRespond(session, data);
  }

  /**
   * Reset checkin progress by deleting current session
   * and generating a new session.
   *
   * @param {Object} values
   *
   * @returns {Object}
   */
  async resetCheckin() {
    const { sessionId, session } = await checkinSession.reset(
      this.req,
      this.res,
    );

    this.sessionId = sessionId;
    this.session = session;

    return this._persistAndRespond(session);
  }

  // =========================
  // ORCHESTRATION HELPERS
  // =========================

  /**
   * Initialize checkin session
   */
  async _initSession() {
    const { sessionId, session } = await checkinSession.getOrCreate(
      this.req,
      this.res,
    );

    this.sessionId = sessionId;
    this.session = session;
  }

  /**
   * Persist session data and return response data.
   *
   * If all checkin steps are complete, a new user
   * session is generated and the checkin session is destroyed.
   *
   * @param {CheckinSession} session
   * @param {Object} data
   * @returns {Object}
   */
  async _persistAndRespond(session, data = {}) {
    this.session = session;

    if (isComplete(session.progress)) {
      await this._processCheckinComplete();

      await this._issueUserSession();

      await checkinSession.destroy(this.req, this.res);
    } else {
      await checkinSession.persist(this.sessionId, session);
    }

    return {
      meta: this._buildMeta(session),
      ...(Object.keys(data).length && { data }),
    };
  }

  /**
   * Build response metadata.
   *
   * @param {CheckinSession} session
   * @returns {Object}
   */
  _buildMeta(session) {
    return {
      nextStep: getNextStep(session.progress),
    };
  }

  /**
   * Issue user session.
   */
  async _issueUserSession() {
    const checkinSession = this.session;

    /** @type {{ sessionId: string, session: UserSession }} */
    const { sessionId, session } = await userSession.getOrCreate(
      this.req,
      this.res,
    );

    await userSession.persist(sessionId, {
      ...session,
      userId: checkinSession.userId,
      checkinNumber: checkinSession.checkinNumber,
      checkinAt: checkinSession.checkinAt,
    });
  }

  // =========================
  // DOMAIN STEP HANDLERS
  // =========================

  /**
   * Process ticket code.
   *
   * @param {string} ticketCode
   * @returns {Object}
   */
  async _processTicket(ticketCode) {
    const result = await validateTicket(ticketCode);

    const updated = applyStep(this.session, 'ticket', result);

    return {
      session: updated,
      data: {
        session: {
          progress: updated.progress,
          userPreview: result.userPreview,
        },
      },
    };
  }

  /**
   * Process user verification code.
   *
   * @param {string} verificationCode
   * @returns {Object}
   */
  async _processVerification(verificationCode) {
    await verifyUser(this.session, verificationCode);

    const updated = applyStep(this.session, 'verification');

    return {
      session: updated,
      data: {
        session: {
          progress: updated.progress,
          userPreview: updated.userPreview,
        },
      },
    };
  }

  /**
   * Process qr token.
   *
   * @param {string} qrToken
   * @returns {Object}
   */
  async _processQrToken(qrToken) {
    await validateQrToken(qrToken);

    const updated = applyStep(this.session, 'qr', {
      eventId: env.eventId, // TODO: derive the event ID from the qrToken
      qr: { qrToken },
    });

    return {
      session: updated,
      data: {
        session: {
          progress: updated.progress,
          userPreview: updated.userPreview,
        },
      },
    };
  }

  /**
   * Trigger checkin completion interaction with the database.
   * Stores the checkinNumber and checkinAt timestamp in the session.
   */
  async _processCheckinComplete() {
    const { ticketCode } = this.session.ticket;

    if (!ticketCode) throw new Error('Missing ticketCode in session');

    const { checkinNumber, checkinAt } = await completeCheckin(ticketCode);

    this.session.checkinNumber = checkinNumber;
    this.session.checkinAt = checkinAt;
  }

  // =========================
  // DEBUG
  // =========================

  /**
   * Debug checkin.
   *
   * @returns {Object}
   */
  async debug() {
    await this._initSession();

    return this.session;
  }
}

/**
 * Validate ticket code.
 *
 * @param {string} ticketCode
 *
 * @returns {CheckinSession}
 */
const validateTicket = async (ticketCode) => {
  const isValidFormat = /^[a-z0-9]{5}$/.test(ticketCode);
  if (!ticketCode || !isValidFormat) {
    throw new Error('Invalid ticket code');
  }

  const user = await getUserByTicket(ticketCode);
  if (!user) {
    throw new Error('Ticket not found');
  }

  const fullPhone = user.user_phone;
  const last4 = fullPhone.slice(-4);

  return {
    userId: user.user_id,
    ticket: { ticketCode },
    verification: {
      phoneHash: hash(fullPhone),
      phoneLast4Hash: hash(last4),
    },

    userPreview: {
      ticketCode: ticketCode,
      name: maskName(user.user_name),
      phoneStart: maskPhone(fullPhone),
    },

    checkinComplete: user.checkin_complete,
    checkinAt: user.checkin_at,
    checkinNumber: user.checkin_number,
  };
};

/**
 * Verify user by validating the verification code.
 *
 * @param {CheckinSession} session
 * @param {string} code
 */
const verifyUser = async (session, code) => {
  const isValidFormat = /^[0-9]{4}$/.test(code);
  if (!code || !isValidFormat) {
    throw new Error('Invalid verification code');
  }

  const hashed = hash(code);
  if (hashed !== session.verification.phoneLast4Hash) {
    throw new Error('Verification failed');
  }
};

/**
 * Validate the QR Code token.
 *
 * @param {string} qrToken
 *
 * @returns {boolean}
 */
const validateQrToken = async (qrToken) => {
  const isValidFormat = /^[a-zA-Z0-9]{10,32}$/.test(qrToken);

  if (!isValidFormat) throw new Error('Invalid QR token');

  if (!qrToken) throw new Error('Invalid QR token');

  if (qrToken !== env.checkinQrToken) throw new Error('Invalid QR token');

  return true;
};
