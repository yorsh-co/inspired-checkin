import redis from '../../shared/db/redis.js';
import { v4 as uuidv4 } from 'uuid';
import { hashUA } from '../../shared/utils/hash.js';
import { env } from '../../config/env.js';

const getKey = (id) => `session:checkin:${id}`;

const getTtlByType = (type) => {
  const envTtl = env.sessionTtl[type];

  if (!envTtl) throw new Error(`Unknown session type: ${type}`);

  const ttl = parseInt(envTtl, 10);

  if (!Number.isInteger(ttl) || ttl <= 0) {
    throw new Error(`Invalid TTL for ${type}: ${envTtl}`);
  }

  return ttl;
};

const createSession = async (data) => {
  const sessionId = uuidv4();

  const session = {
    ...data,
    createdAt: Date.now(),
    lastUpdatedAt: Date.now(),
  };

  const ttl = getTtlByType(session.type);

  await redis.set(getKey(sessionId), JSON.stringify(session), 'EX', ttl);

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
  if (!session) return;

  const updatedSession = {
    ...session,
    lastUpdatedAt: Date.now(),
  };

  const ttl = getTtlByType(session.type);

  await redis.set(getKey(sessionId), JSON.stringify(updatedSession), 'EX', ttl);

  return updatedSession;
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

  const ttl = getTtlByType(newSession.type);

  await redis.set(getKey(newSessionId), JSON.stringify(newSession), 'EX', ttl);

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
