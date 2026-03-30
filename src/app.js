const express = require('express');
const Redis = require('ioredis');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const authRoutes = require('./modules/auth/auth.routes');
const checkinRoutes = require('./modules/checkin/checkin.routes');
const webRoutes = require('./web/routes/web.routes');

const app = express();

app.use('/api/auth', authRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/', webRoutes);

app.use(express.json());
app.use(cookieParser());

app.use('/', authRoutes);

// --- HELPERS ---
const getSessionKey = (sessionId) => `session:${sessionId}`;

const hashUA = (ua) =>
  crypto
    .createHash('sha256')
    .update(ua || '')
    .digest('hex');

// Create empty session if not exists
const ensureSession = async (req, res) => {
  let sessionId = req.cookies.session_id;

  if (!sessionId) {
    sessionId = uuidv4();

    const session = {
      ticketId: null,
      eventId: null,
      ticketValidated: false,
      qrScanned: false,
      ua: hashUA(req.headers['user-agent']),
    };

    await redis.set(
      getSessionKey(sessionId),
      JSON.stringify(session),
      'EX',
      SESSION_TTL,
    );

    res.cookie('session_id', sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    });

    return session;
  }

  const raw = await redis.get(getSessionKey(sessionId));

  if (!raw) return null;

  const session = JSON.parse(raw);

  // basic binding check
  if (session.ua !== hashUA(req.headers['user-agent'])) {
    return null;
  }

  return session;
};

const saveSession = async (sessionId, session) => {
  await redis.set(
    getSessionKey(sessionId),
    JSON.stringify(session),
    'EX',
    SESSION_TTL,
  );
};

// Endpoints
app.get('/app', requireAuth, (req, res) => {
  res.json({
    message: 'Welcome',
    user: req.user,
  });
});

// Ticket entry
app.get('/start', async (req, res) => {
  const { ticketId } = req.query;

  if (!ticketId) {
    return res.status(400).json({ error: 'Missing ticketId' });
  }

  const session = await ensureSession(req, res);
  if (!session) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  const sessionId = req.cookies.session_id;

  // --- Validate ticket exists ---
  const result = await pg.query(
    'SELECT id, scanned_at FROM tickets WHERE id = $1',
    [ticketId],
  );

  if (result.rows.length === 0) {
    return res.status(400).json({ error: 'Invalid ticket' });
  }

  if (result.rows[0].scanned_at) {
    return res.status(400).json({ error: 'Ticket already used' });
  }

  // --- Update session ---
  session.ticketId = ticketId;
  session.ticketValidated = true;

  await saveSession(sessionId, session);

  res.json({
    message: 'Ticket validated. Please scan QR code.',
  });
});

// QR
app.get('/scan', async (req, res) => {
  const { eventId } = req.query;

  if (!eventId) {
    return res.status(400).json({ error: 'Missing eventId' });
  }

  const session = await ensureSession(req, res);
  if (!session) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  const sessionId = req.cookies.session_id;

  // --- Update session ---
  session.eventId = eventId;
  session.qrScanned = true;

  await saveSession(sessionId, session);

  // --- If both conditions met → finalize ---
  if (session.ticketValidated && session.qrScanned) {
    return finalizeAuth(req, res, session, sessionId);
  }

  res.json({
    message: 'QR scanned. Please enter ticket.',
  });
});

//
app.post('/validate-ticket', async (req, res) => {
  const { ticketId } = req.body;
  const sessionId = req.cookies.qr_session;

  if (!ticketId || !sessionId) {
    return res.status(400).json({ error: 'Missing data' });
  }

  // --- 1. Check Redis session ---
  const raw = await redis.get(`qr_session:${sessionId}`);

  if (!raw) {
    return res.status(401).json({ error: 'QR session expired or invalid' });
  }

  const session = JSON.parse(raw);

  if (!session.qrScanned) {
    return res.status(403).json({ error: 'QR not scanned' });
  }

  // --- 2. Validate ticket in Postgres ---
  const client = await pg.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `SELECT id, scanned_at
       FROM tickets
       WHERE id = $1
       FOR UPDATE`,
      [ticketId],
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid ticket');
    }

    const ticket = result.rows[0];

    if (ticket.scanned_at) {
      throw new Error('Ticket already used');
    }

    // --- 3. Mark as scanned ---
    await client.query(
      `UPDATE tickets
       SET scanned_at = NOW(),
           event_id = $1
       WHERE id = $2`,
      [session.eventId, ticketId],
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }

  // --- 4. Destroy temp session ---
  await redis.del(`qr_session:${sessionId}`);

  // --- 5. Issue JWT ---
  const token = jwt.sign({ ticketId }, JWT_SECRET, { expiresIn: '2h' });

  res.cookie('auth_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
  });

  res.json({ success: true });
});

app.post('/validate-ticket', async (req, res) => {
  const { ticketId } = req.body;

  const session = await ensureSession(req, res);
  if (!session) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  const sessionId = req.cookies.session_id;

  // validate ticket
  const result = await pg.query(
    'SELECT id, scanned_at FROM tickets WHERE id = $1',
    [ticketId],
  );

  if (result.rows.length === 0) {
    return res.status(400).json({ error: 'Invalid ticket' });
  }

  if (result.rows[0].scanned_at) {
    return res.status(400).json({ error: 'Already used' });
  }

  session.ticketId = ticketId;
  session.ticketValidated = true;

  await saveSession(sessionId, session);

  if (session.ticketValidated && session.qrScanned) {
    return finalizeAuth(req, res, session, sessionId);
  }

  res.json({
    message: 'Ticket valid. Please scan QR.',
  });
});

// Finalize auth
const finalizeAuth = async (req, res, session, sessionId) => {
  const client = await pg.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `SELECT id, scanned_at
       FROM tickets
       WHERE id = $1
       FOR UPDATE`,
      [session.ticketId],
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid ticket');
    }

    if (result.rows[0].scanned_at) {
      throw new Error('Already checked in');
    }

    // --- Persist check-in ---
    await client.query(
      `UPDATE tickets
       SET scanned_at = NOW(),
           event_id = $1
       WHERE id = $2`,
      [session.eventId, session.ticketId],
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }

  // --- Destroy temp session ---
  await redis.del(getSessionKey(sessionId));

  // --- Issue JWT ---
  const token = jwt.sign(
    {
      ticketId: session.ticketId,
      eventId: session.eventId,
    },
    JWT_SECRET,
    { expiresIn: '2h' },
  );

  res.cookie('auth_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
  });

  return res.json({
    success: true,
  });
};

module.exports = app;
