import { env } from '../../config/env.js';
import { sessionService } from '../session/session.service.js';
import { createCheckinSession } from './checkin.session.model.js';

const COOKIE_NAME = 'checkin_session_id';

export const getOrCreateCheckinSession = async (req, res) => {
  let sessionId = req.cookies[COOKIE_NAME];

  let session = await sessionService.get(sessionId, req);

  if (!session) {
    const created = await sessionService.create(createCheckinSession(req));

    sessionId = created.sessionId;
    session = created.session;

    res.cookie(COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: 'lax',
    });
  }

  return { sessionId, session };
};

export const persistCheckinSession = async (sessionId, session) => {
  await sessionService.save(sessionId, session);
};

export const rotateCheckinSession = async (req, res, sessionId) => {
  const rotated = await sessionService.rotate(sessionId, req);

  res.cookie(COOKIE_NAME, rotated.sessionId, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
  });

  return rotated;
};

const destroyCheckinSession = async (req, res) => {
  const sessionId = req.cookies[COOKIE_NAME];

  if (sessionId) {
    await sessionService.destroy(sessionId);
  }

  res.clearCookie(COOKIE_NAME);
};

const resetCheckinSession = async (req, res) => {
  const sessionId = req.cookies[COOKIE_NAME];

  if (sessionId) {
    await destroyCheckinSession(req, res);
  }

  res.clearCookie(COOKIE_NAME);

  // create a brand new session
  return await getOrCreateCheckinSession(req, res);
};

export const checkinSession = {
  getOrCreate: getOrCreateCheckinSession,
  persist: persistCheckinSession,
  rotate: rotateCheckinSession,
  destroy: destroyCheckinSession,
  reset: resetCheckinSession,
};
