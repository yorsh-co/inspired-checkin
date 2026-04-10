import { applyStep, getNextStep } from './checkin.flow.js';
import { CheckinSteps } from './checkin.steps.js';
import { checkinSession } from './checkin.session.adapter.js';

import { getTicketByCode } from '../ticket/ticket.service.js';
import { maskName, maskPhone } from '../../shared/utils/mask.js';
import { hash } from '../../shared/utils/hash.js';

const validateQr = async (qr) => {
  if (!qr) throw new Error('Invalid QR');
  // FIXME:
};

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
      data.user = this.session.userPreview;
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

  async submitTicket(ticketCode) {
    await this._initSession();

    const { session, data } = await this._processTicket(ticketCode);

    return await this._persistAndRespond(session, data);
  }

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

  async submitQr(qrCode) {
    await this._initSession();

    const { session } = await this._processQr(qrCode);

    return await this._persistAndRespond(session);
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

  async _processQr(qrCode) {
    await validateQr(qrCode);

    const updated = applyStep(this.session, CheckinSteps.QR, {
      eventId: qrCode, // TODO:
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
