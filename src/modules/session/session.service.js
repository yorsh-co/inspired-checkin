import redis from '../../shared/db/redis.js';
import { v4 as uuidv4 } from 'uuid';
import { hashUA } from '../../shared/utils/hash.js';
import { env } from '../../config/env.js';

const getKey = (id) => `session:checkin:${id}`;

const createSession = async (req) => {
  const sessionId = uuidv4();

  const session = {
    version: 1,
    progress: { qr: false, ticket: false, verified: false },

    currentStep: 'init', // 'qr', 'ticket', 'verification'
    source: 'direct', // 'qr' | 'ticket' | 'direct',

    ticketId: null,
    eventId: null,

    phoneHash: null,
    phoneLast4Hash: null,

    ua: hashUA(req.headers['user-agent']),

    createdAt: Date.now(),
    lastUpdatedAt: Date.now(),
  };

  await redis.set(
    getKey(sessionId),
    JSON.stringify(session),
    'EX',
    env.sessionTtl,
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
    env.sessionTtl,
  );
};

const destroySession = async (sessionId) => {
  await redis.del(getKey(sessionId));
};

const rotateSession = async (oldSessionId, req) => {
  const oldSessionRaw = await redis.get(getKey(oldSessionId));
  if (!oldSessionRaw) return null;

  const oldSession = JSON.parse(oldSessionRaw);

  await destroySession(oldSessionId);

  const newSessionId = uuidv4();

  const newSession = {
    ...oldSession,
    ua: hashUA(req.headers['user-agent']),
    lastUpdatedAt: Date.now(),
  };

  await redis.set(
    getKey(newSessionId),
    JSON.stringify(newSession),
    'EX',
    env.sessionTtl,
  );

  return { sessionId: newSessionId, session: newSession };
};

export {
  createSession,
  getSession,
  saveSession,
  destroySession,
  rotateSession,
};

export const sessionService = {
  create: createSession,
  get: getSession,
  save: saveSession,
  destroy: destroySession,
  rotate: rotateSession,
};
