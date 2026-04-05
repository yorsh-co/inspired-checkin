import sessionService from '../services/sessionService.js';
import ticketService from '../services/ticketService.js';
import { issueToken } from '../services/authService.js';
import { verifyQrToken } from '../services/qrService.js';

const attachSessionCookie = (res, sessionId) => {
  res.cookie('session_id', sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false
  });
};

const finalize = async (req, res, sessionId, session) => {
  await ticketService.checkInTicket(session.ticketId, session.eventId);

  await sessionService.destroySession(sessionId);

  const token = issueToken({
    ticketId: session.ticketId,
    eventId: session.eventId
  });

  res.cookie('auth_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false
  });

  return res.json({ success: true });
};

// --- /start ---
const start = async (req, res) => {
  const { ticketId } = req.query;

  if (!ticketId) {
    return res.status(400).json({ error: 'Missing ticketId' });
  }

  let sessionId = req.cookies.session_id;
  let session = await sessionService.getSession(sessionId, req);

  if (!session) {
    const created = await sessionService.createSession(req);
    sessionId = created.sessionId;
    session = created.session;
    attachSessionCookie(res, sessionId);
  }

  try {
    await ticketService.validateTicket(ticketId);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  session.ticketId = ticketId;
  session.ticketValidated = true;

  await sessionService.saveSession(sessionId, session);

  if (session.ticketValidated && session.qrScanned) {
    return finalize(req, res, sessionId, session);
  }

  res.json({ message: 'Ticket valid. Scan QR.' });
};

// --- /scan ---
const sessionService = require('../services/sessionService');
const { verifyQrToken } = require('../services/qrService');

// ...

const scan = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'Missing QR token' });
  }

  let qrData;

  try {
    qrData = verifyQrToken(token);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const { eventId } = qrData;

  let sessionId = req.cookies.session_id;
  let session = await sessionService.getSession(sessionId, req);

  if (!session) {
    const created = await sessionService.createSession(req);
    sessionId = created.sessionId;
    session = created.session;

    res.cookie('session_id', sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false
    });
  }

  // --- Update session ---
  session.eventId = eventId;
  session.qrScanned = true;

  await sessionService.saveSession(sessionId, session);

  // --- Finalize if ready ---
  if (session.ticketValidated && session.qrScanned) {
    return finalize(req, res, sessionId, session);
  }

  res.json({ message: 'QR scanned. Enter ticket.' });
};

// --- POST /validate-ticket ---
const validateTicket = async (req, res) => {
  const { ticketId } = req.body;

  let sessionId = req.cookies.session_id;
  let session = await sessionService.getSession(sessionId, req);

  if (!session) {
    const created = await sessionService.createSession(req);
    sessionId = created.sessionId;
    session = created.session;
    attachSessionCookie(res, sessionId);
  }

  try {
    await ticketService.validateTicket(ticketId);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  session.ticketId = ticketId;
  session.ticketValidated = true;

  await sessionService.saveSession(sessionId, session);

  if (session.ticketValidated && session.qrScanned) {
    return finalize(req, res, sessionId, session);
  }

  res.json({ message: 'Ticket valid. Scan QR.' });
};

export { start, scan, validateTicket };
