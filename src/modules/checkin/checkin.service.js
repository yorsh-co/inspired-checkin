import { applyStep, getNextStep } from './checkin.flow.js';
import { CheckinSteps } from './checkin.steps.js';
import { checkinSession } from './checkin.session.adapter.js';

import { getTicketByCode } from '../ticket/ticket.service.js';
import { maskName, maskPhone } from '../../shared/utils/mask.js';
import { hash } from '../../shared/utils/hash.js';
import { qrService } from '../qr/qr.service.js';
import { env } from '../../config/env.js';

export class CheckinService {
  constructor({ req, res }) {
    this.req = req;
    this.res = res;
  }

  // =========================
  // PUBLIC API
  // =========================

  async init({ qrCode, ticketCode }) {
    await this._initSession();

    let data = {};

    if (this.session.userPreview) {
      data.userPreview = this.session.userPreview;
    }

    if (ticketCode && !this.session.progress.ticket) {
      const result = await this._processTicket(ticketCode);
      this.session = result.session;

      data = { ...data, ...result.data };
    }

    if (qrCode && !this.session.progress.qr) {
      const result = await this._processQr(qrCode);

      this.session = result.session;
    }

    return this._persistAndRespond(this.session, data);
  }

  /**
   *
   * @param {string} ticketCode
   * @returns
   */
  async submitTicket(ticketCode) {
    await this._initSession();

    const { session, data } = await this._processTicket(ticketCode);

    return await this._persistAndRespond(session, data);
  }

  /**
   *
   * @param {string} verificationCode
   * @returns
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

    const { session } = await this._processVerification(verificationCode);

    return await this._persistAndRespond(session);
  }

  /**
   *
   * @param {string} qrCode
   * @returns
   */
  async submitQrToken(qrCode) {
    await this._initSession();

    const { session } = await this._processQrToken(qrCode);

    return await this._persistAndRespond(session);
  }

  /**
   *
   * @param {object} values
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

  async _initSession() {
    const { sessionId, session } = await checkinSession.getOrCreate(
      this.req,
      this.res,
    );

    this.sessionId = sessionId;
    this.session = session;
  }

  async _persistAndRespond(session, data = {}) {
    this.session = session;

    await checkinSession.persist(this.sessionId, session);

    return {
      meta: this._buildMeta(session),
      ...(Object.keys(data).length && { data }),
    };
  }

  _buildMeta(session) {
    return {
      nextStep: getNextStep(session.progress),
    };
  }

  // =========================
  // DOMAIN STEP HANDLERS
  // =========================

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
        userPreview: result.userPreview,
      },
    };
  }

  async _processVerification(verificationCode) {
    await verifyUser(this.session, verificationCode);

    const updated = applyStep(this.session, CheckinSteps.VERIFICATION);

    return {
      session: updated,
      data: {},
    };
  }

  async _processQrToken(qrToken) {
    const result = await validateQrToken(qrToken);

    const updated = applyStep(this.session, CheckinSteps.QR, {
      eventId: result.eventId,
    });

    return {
      session: updated,
      data: {},
    };
  }

  // =========================
  // DEBUG
  // =========================
  async debug() {
    await this._initSession();

    const getDebugLabel = (progress) => {
      if (!progress.ticket) return 'WAITING_FOR_TICKET';
      if (!progress.verified) return 'WAITING_FOR_VERIFICATION';
      if (!progress.qr) return 'WAITING_FOR_QR';
      return 'COMPLETE';
    };

    return {
      status: getDebugLabel(this.session.progress),

      sessionId: this.sessionId,

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
 *
 * @param {string} ticketCode
 * @returns {object}
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
 *
 * @param {object} session
 * @param {string} code
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
 *
 * @param {*} qrToken
 * @returns
 */
const validateQrToken = async (qrToken) => {
  if (!qrToken) throw new Error('Invalid QR');

  const payload = qrService.verify(qrToken, {
    audience: 'qr',
    issuer: env.JWT_ISSUER,
    clockTolerance: 60,
  });

  // ===== Required structure =====
  if (!payload || payload.type !== 'event_checkin') {
    throw new Error('Invalid QR payload');
  }

  if (!payload.eventId) {
    throw new Error('QR missing eventId');
  }

  // ===== Event validation =====
  if (payload.eventId !== env.eventId) {
    throw new Error('Invalid eventId');
  }

  // ===== Scope validation =====
  if (payload.scope !== 'public_qr') {
    throw new Error('Invalid QR scope');
  }

  // ===== Versioning (future-proofing) =====
  if (payload.version !== 1) {
    throw new Error('Unsupported QR version');
  }

  // ===== Optional: time sanity check =====
  // (nbf & exp are already enforced by jwt.verify, but this protects bad configs)
  if (payload.nbf && payload.nbf > Math.floor(Date.now() / 1000)) {
    throw new Error('QR not active yet');
  }

  return {
    eventId: payload.eventId,
    payload,
  };
};
