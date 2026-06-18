import { applyStep, getNextStep, isComplete } from './checkin.flow.js';
import { CheckinSteps } from './checkin.steps.js';
import { checkinSession } from './checkin.session.adapter.js';

import { getTicketByCode } from '../ticket/ticket.service.js';
import { maskName, maskPhone } from '../../shared/utils/mask.js';
import { hash } from '../../shared/utils/hash.js';
import { qrService } from '../qr/qr.service.js';
import { env } from '../../config/env.js';
import { userSession } from '../user/user.session.adapter.js';

export class CheckinService {
  constructor({ req, res }) {
    this.req = req;
    this.res = res;
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
  async init({ qrToken, ticketToken }) {
    await this._initSession();

    let data = {};

    if (this.session.currentStep !== 'init') {
      data.session = {
        progress: this.session.progress,
        userPreview: this.session.userPreview,
      };
    }

    if (ticketToken && !this.session.progress.ticket) {
      this.session.source = 'ticket';

      // FIXME: verify the ticket token to get the code

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
   * If all checkin steps are complete, a new auth
   * session is generated and the checkin session is destroyed.
   *
   * @param {Object} session
   * @param {Object} data
   * @returns {Object}
   */
  async _persistAndRespond(session, data = {}) {
    this.session = session;

    if (isComplete(session.progress)) {
      await this._issueUserSession(session);

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
   * @param {Object} session
   * @returns {Object}
   */
  _buildMeta(session) {
    return {
      nextStep: getNextStep(session.progress),
    };
  }

  /**
   * Issue user session.
   *
   * @param {Object} checkinSessionData
   */
  async _issueUserSession(checkinSessionData) {
    const { sessionId, session } = await userSession.getOrCreate(
      this.req,
      this.res,
    );

    await userSession.persist(sessionId, {
      ...session,
      progress: checkinSessionData.progress,
      ticketId: checkinSessionData.ticketId,
      eventId: checkinSessionData.eventId,
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

    const updated = applyStep(this.session, CheckinSteps.TICKET, {
      ticketId: result.ticketId,
    });

    return {
      session: {
        ...updated,
        phoneHash: result.security.phoneHash,
        phoneLast4Hash: result.security.phoneLast4Hash,
        userPreview: result.userPreview,
      },
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

    const updated = applyStep(this.session, CheckinSteps.VERIFICATION);

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

    const updated = applyStep(this.session, CheckinSteps.QR, {
      eventId: env.eventId,
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

    const getDebugLabel = (progress) => {
      if (!progress.ticket) return 'WAITING_FOR_TICKET';
      if (!progress.verified) return 'WAITING_FOR_VERIFICATION';
      if (!progress.qr) return 'WAITING_FOR_QR';
      return 'COMPLETE';
    };

    return {
      type: this.session.type,
      version: this.session.version,

      status: getDebugLabel(this.session.progress),

      progress: this.session.progress,
      nextStep: getNextStep(this.session.progress),

      currentStep: this.session.currentStep,

      ticketId: this.session.ticketId,
      eventId: this.session.eventId,

      source: this.session.source,

      createdAt: this.session.createdAt,
      lastUpdatedAt: this.session.lastUpdatedAt,
    };
  }
}

/**
 * Validate ticket code.
 *
 * @param {string} ticketCode
 *
 * @returns {Object}
 */
const validateTicket = async (ticketCode) => {
  if (!ticketCode) throw new Error('Invalid ticket');

  const record = await getTicketByCode(ticketCode);
  if (!record) throw new Error('Ticket not found');

  const fullPhone = record.user_phone;
  const last4 = fullPhone.slice(-4);

  return {
    ticketId: record.ticket_id,
    security: {
      phoneHash: hash(fullPhone),
      phoneLast4Hash: hash(last4),
    },

    userPreview: {
      ticketCode: ticketCode,
      name: maskName(record.user_name),
      phoneStart: maskPhone(fullPhone),
    },
  };
};

/**
 * Verify user by validating the verification code.
 *
 * @param {Object} session
 * @param {string} code
 *
 * @return {boolean}
 */
const verifyUser = async (session, code) => {
  if (!code || code.length !== 4) {
    throw new Error('Invalid verification code');
  }

  const hashed = hash(code);

  if (hashed !== session.phoneLast4Hash) {
    throw new Error('Verification failed');
  }

  return true;
};

/**
 * Validate the QR Code token.
 *
 * @param {string} qrToken
 *
 * @returns {boolean}
 */
const validateQrToken = async (qrToken) => {
  const isToken = (t) => /^[a-zA-Z0-9]{10,32}$/.test(t);
  if (!isToken(qrToken)) throw new Error('Invalid QR token');

  if (!qrToken) throw new Error('Invalid QR token');

  if (qrToken !== env.checkinQrToken) throw new Error('Invalid QR token');

  return true;
};
