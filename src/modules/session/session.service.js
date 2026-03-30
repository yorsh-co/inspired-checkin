const redis = require('../db/redis');
const { v4: uuidv4 } = require('uuid');
const { hashUA } = require('../utils/hash');

const SESSION_TTL = 600;

const getKey = id => `session:${id}`;

const createSession = async req => {
  const sessionId = uuidv4();

  const session = {
    ticketId: null,
    eventId: null,
    ticketValidated: false,
    qrScanned: false,
    ua: hashUA(req.headers['user-agent'])
  };

  await redis.set(getKey(sessionId), JSON.stringify(session), 'EX', SESSION_TTL);

  return { sessionId, session };
};

const getSession = async (sessionId, req) => {
  if (!sessionId) return null;

  const raw = await redis.get(getKey(sessionId));
  if (!raw) return null;

  const session = JSON.parse(raw);

  if (session.ua !== hashUA(req.headers['user-agent'])) {
    return null;
  }

  return session;
};

const saveSession = async (sessionId, session) => {
  await redis.set(getKey(sessionId), JSON.stringify(session), 'EX', SESSION_TTL);
};

const destroySession = async sessionId => {
  await redis.del(getKey(sessionId));
};

module.exports = {
  createSession,
  getSession,
  saveSession,
  destroySession
};
