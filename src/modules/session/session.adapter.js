import { env } from '../../config/env.js';
import { sessionService } from './session.service.js';

/** @import { Session } from '../../types/session.js' */

/**
 * Creates a sessions adapter exposing frequently used methods
 * to manipulate sessions using the session service.
 *
 * @param {string} cookieName
 * @param {() => object} createSessionData
 */
export const createSessionAdapter = (cookieName, createSessionData) => {
  const cookieOptions = {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
  };

  /**
   * Retrieve session using the request cookie
   * or create a new session and attach the
   * session ID cookie to the response.
   *
   * @param {Object} req
   * @param {Object} res
   * @returns {{ sessionId: string, session: Session }}
   */
  const ensure = async (req, res) => {
    let sessionId = req.cookies[cookieName];

    let session = await sessionService.get(sessionId, req);

    if (!session) {
      const created = await sessionService.create(createSessionData(req));

      sessionId = created.sessionId;
      session = created.session;

      res.cookie(cookieName, sessionId, cookieOptions);
    }

    return { sessionId, session };
  };

  /**
   * Retrieve the session using the request cookie.
   *
   * @param {Object} req
   * @returns {{ sessionId: string, session: Session }|null}
   */
  const get = async (req) => {
    let sessionId = req.cookies[cookieName];

    const session = await sessionService.get(sessionId, req);

    if (!session) return null;

    return { sessionId, session };
  };

  /**
   * Persist the session data.
   *
   * @param {string} sessionId
   * @param {Session} session
   */
  const persist = async (sessionId, session) => {
    await sessionService.save(sessionId, session);
  };

  /**
   * Rotate the session ID.
   *
   * @param {Object} req
   * @param {Object} res
   * @param {string} sessionId
   *
   * @returns {Session}
   */
  const rotate = async (req, res, sessionId) => {
    const rotated = await sessionService.rotate(sessionId, req);

    res.cookie(cookieName, rotated.sessionId, cookieOptions);

    return rotated;
  };

  /**
   * Destroy the session corresponding to the ID
   * in the request cookie and clear the cookie.
   *
   * @param {Object} req
   * @param {Object} res
   */
  const destroy = async (req, res) => {
    const sessionId = req.cookies[cookieName];

    if (sessionId) {
      await sessionService.destroy(sessionId);
    }

    res.clearCookie(cookieName);
  };

  /**
   * Reset the request session by destroying the current
   * session and creating a new one.
   *
   * @param {Object} req
   * @param {Object} res
   *
   * @returns {{ sessionId: string, session: Session }}
   */
  const reset = async (req, res) => {
    await destroy(req, res);

    return await ensure(req, res);
  };

  return {
    ensure,
    get,
    persist,
    rotate,
    destroy,
    reset,
  };
};
