import { RateLimiterRedis } from 'rate-limiter-flexible';
import redis from '../shared/db/redis.js';

// TODO: add protection for user and admin sessions

/**
 * Global per-IP limiter.
 * Protects all /api/v1 routes (checkin, user, admin) from a single
 * client hammering the API, regardless of session state
 */
const ipRateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:ip',
  points: 60,
  duration: 60,
});

/**
 * Per-checkin-session limiter.
 * Protects against a single session id spamming requests,
 * independent of IP (covers shared NAT/WiFi at in-person
 * event where many users share an IP)
 */
const checkinSessionRateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl:checkin-session',
  points: 20,
  duration: 60,
});

/**
 * Build an Express middleware backed by a RateLimiterRedis instance
 *
 * @param {RateLimiterRedis} limiter
 * @param {(req: Object) => string|null} getKey - returns the key to rate
 *   limit on, or null to skip limiting for this request
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

    res.set('Retry-After', String(Math.ceil(err.msBeforeNext / 1000)));
    return res.status(429).json({ error: 'Too many requests' });
  }
};

export const ipLimiter = createLimiterMiddleware(
  ipRateLimiter,
  (req) => req.ip,
);

export const checkinSessionLimiter = createLimiterMiddleware(
  checkinSessionRateLimiter,
  (req) => req.cookies?.checkin_session_id || null,
);
