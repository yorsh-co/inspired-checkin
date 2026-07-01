import { RateLimiterRedis } from 'rate-limiter-flexible';
import redis from '../shared/db/redis.js';
import { RateLimitError } from '../shared/errors/app-error.js';

/**
 * Build an Express middleware backed by a RateLimiterRedis instance
 *
 * @param {RateLimiterRedis} limiter
 * @param {(req: Object) => string|null} getKey - returns the key to rate
 * limit on, or null to skip limiting for this request
 */
const createLimiterMiddleware = (limiter, getKey) => async (req, res, next) => {
  const key = getKey(req);

  if (!key) return next();

  try {
    await limiter.consume(key);
    next();
  } catch (err) {
    // check for internal failures not containing a
    // RateLimiterRes-like object from rate-limiter-flexible
    if (typeof err?.msBeforeNext !== 'number') {
      console.error('[RateLimiter] error:', err);
      return next();
    }

    const retryAfterSeconds = Math.ceil(err.msBeforeNext / 1000);
    return next(new RateLimitError('Too many requests', retryAfterSeconds));
  }
};

/**
 * Global per-IP limiter.
 * Protects all /api/v1 routes (checkin, user, admin) from a single
 * client hammering the API, regardless of session state
 */
export const ipLimiter = createLimiterMiddleware(
  new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'rl:ip',
    points: 60,
    duration: 60,
  }),
  (req) => req.ip,
);

/**
 * Light, global per-IP limiter for web (EJS-rendered) routes.
 * Mainly a baseline guard against a single source hammering / or
 * /admin/login, since each render still costs a Redis session lookup.
 */
export const webLimiter = createLimiterMiddleware(
  new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'rl:ip:web',
    points: 100,
    duration: 60,
  }),
  (req) => req.ip,
);

/**
 * Build a per-session-id rate limiter middleware, keyed by the value
 * of the given cookie. Covers the case where a session id alone
 * (independent of IP) is used to spam an endpoint - e.g. a leaked or
 * guessed admin/user session id - and complements the IP limiter for
 * shared-IP scenarios (event WiFi/NAT).
 * @param {string} cookieName
 * @param {Object} [options]
 * @param {number} [options.points=20]
 * @param {number} [options.duration=60]
 */
const createSessionLimiter = (cookieName, options = {}) => {
  const { points = 20, duration = 60 } = options;

  const limiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: `rl:session:${cookieName}`,
    points,
    duration,
  });

  return createLimiterMiddleware(
    limiter,
    (req) => req.cookies?.[cookieName] || null,
  );
};

/**
 * Per-checkin-session limiter.
 * Protects against a single session id spamming requests,
 * independent of IP (covers shared NAT/WiFi at in-person
 * event where many users share an IP)
 */
export const checkinSessionLimiter = createSessionLimiter(
  'checkin_session_id',
  {
    points: 20,
    duration: 60,
  },
);

/**
 * Per-user-session limiter.
 * Same rationale as checkinSessionLimiter - guards against a
 * leaked/guessed user_session_id being used to hammer user routes.
 */
export const userSessionLimiter = createSessionLimiter('user_session_id', {
  points: 30,
  duration: 60,
});

/**
 * Per-admin-session limiter.
 * Tighter than the user limiter since admin routes are higher value
 * and admin traffic volume is naturally much lower.
 */
export const adminSessionLimiter = createSessionLimiter('admin_session_id', {
  points: 20,
  duration: 60,
});

/**
 * Per-IP limiter for GET /checkin specifically.
 * This route accepts an attacker-controlled ticket code (?t=) or qr
 * token (?k=) and hits Postgres/Redis on every request, making it a
 * ticket-guessing surface independent of the POST /api/v1/checkin/*
 * endpoints. A legitimate user only loads this once per checkin
 * attempt, so the budget is much lower than the general API limiter.
 */
export const checkinEntryIpLimiter = createLimiterMiddleware(
  new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'rl:ip:checkin-entry',
    points: 10,
    duration: 60,
  }),
  (req) => req.ip,
);

/**
 * Global (non-IP-keyed) failure limiter for GET /checkin.
 * This is consumed only when a ticket/QR lookup
 * fails - it tracks brute-force guessing specifically,
 * not legitimate traffic. This lets the threshold be set much lower
 * without risking false positives on real attendees, since real
 * traffic is overwhelmingly successful lookups.
 *
 * Must be consumed manually from the service layer (see
 * consumeCheckinEntryFailure below) once a lookup is known to have
 * failed - it is not wired as route middleware.
 */
const checkinEntryFailureRateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:global:checkin-entry-failures',
  points: 30,
  duration: 60,
});

/**
 * Consume one point against the global checkin-entry failure budget.
 * Call this after a GET /checkin ticket/QR lookup fails.
 *
 * @returns {Promise<{ blocked: boolean, retryAfterSeconds?: number }>}
 */
export const consumeCheckinEntryFailure = async () => {
  try {
    await checkinEntryFailureRateLimiter.consume('global');
    return { blocked: false };
  } catch (err) {
    if (typeof err?.msBeforeNext !== 'number') {
      console.error('[RateLimiter] error:', err);
      return { blocked: false };
    }

    return {
      blocked: true,
      retryAfterSeconds: Math.ceil(err.msBeforeNext / 1000),
    };
  }
};
