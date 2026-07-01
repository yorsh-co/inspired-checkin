import { userSession } from '../modules/user/user.session.adapter.js';
import { adminSession } from '../modules/admin/admin.session.adapter.js';
import { checkinSession } from '../modules/checkin/checkin.session.adapter.js';
import { UnauthorizedError } from '../shared/errors/app-error.js';

/** @import { Session, SessionType } from '../../types/session.js' */

/**
 * Resolve any valid sessions and attach them to `req.sessions`.
 * Invalid requests are to be blocked by using `requireRole`
 * to enforce access per route.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @returns {Promise<void>}
 */
export const resolveSessions = async (req, res, next) => {
  req.sessions = {};

  try {
    /** @type {{ sessionId: string, session: Session }|null} */
    const checkin = await checkinSession.get(req);
    if (checkin) req.sessions.checkin = checkin.session;

    /** @type {{ sessionId: string, session: Session }|null} */
    const user = await userSession.get(req);
    if (user) req.sessions.user = user.session;

    /** @type {{ sessionId: string, session: Session }|null} */
    const admin = await adminSession.get(req);
    if (admin) req.sessions.admin = admin.session;
  } catch (err) {
    console.error(err);

    // leave req.sessions in its current state
  }

  next();
};

/**
 * Requires a session of the given type to access an API route.
 * Must be used after `resolveSessions`. Attaches the matching
 * session to `req.session`. Returns 401 if required session is
 * missing.
 *
 * @param {SessionType} type
 */
export const requireRole = (type) => (req, res, next) => {
  const session = req.sessions?.[type];

  if (!session) return next(new UnauthorizedError());

  req.session = { type, ...session };

  next();
};

/**
 * Requires a session of the given type to access an web route.
 * Must be used after `resolveSessions`. Attaches the matching
 * session to `req.session`. Redirects to given route if required
 * session is missing.
 *
 * @param {SessionType} type
 * @param {string} redirectTo
 * @returns {Function}
 */
export const requireWebAuth = (type, redirectTo) => (req, res, next) => {
  const session = req.sessions?.[type];

  if (!session) return res.redirect(redirectTo);

  req.session = { type, ...session };

  next();
};

/**
 * Requires that no user session exists. Must be used after
 * `resolveSessions`. Redirects to given route if a user
 * session is found.
 *
 * @param {SessionType} type
 * @param {string} redirectTo
 * @returns {Function}
 */
export const requireNoSession = (type, redirectTo) => (req, res, next) => {
  const session = req.sessions?.[type];

  if (session) return res.redirect(redirectTo);

  next();
};
