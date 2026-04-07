import redis from '../../shared/db/redis.js';
import { v4 as uuidv4 } from 'uuid';
import { hashUA } from '../../shared/utils/hash.js';
import { env } from '../../config/env.js';

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

  await redis.set(
    getKey(sessionId),
    JSON.stringify(session),
    'EX',
    SESSION_TTL
  );

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
  await redis.set(
    getKey(sessionId),
    JSON.stringify(session),
    'EX',
    SESSION_TTL
  );
};

const destroySession = async sessionId => {
  await redis.del(getKey(sessionId));
};

export { createSession, getSession, saveSession, destroySession };
