import { ApiError } from './api.error.js';

/**
 * Shared fetch wrapper for API calls. Parses the JSON body and, on a
 * non-ok response, throws an ApiError carrying the server's `code`
 * and `details` so callers can branch on error type.
 *
 * @param {string} path
 * @param {RequestInit} [options]
 * @returns {Promise<Object>}
 */
export const request = async (path, options = {}) => {
  const res = await fetch(path, { credentials: 'include', ...options });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new ApiError('Invalid server response', { status: res.status });
  }

  if (!res.ok) {
    const err = new ApiError(data.error || 'Request failed', {
      status: res.status,
      code: data.code,
      details: data.details,
    });

    logApiFailure(path, err);
    throw err;
  }

  return data;
};

const ROUTINE_ERROR_CODES = new Set(['VALIDATION_ERROR', 'CAPTCHA_REQUIRED']);

/**
 * Logs an API-related error at an appropriate level: ApiErrors
 * (expected 4xx failures) at 'warn' with their code/status, anything
 * else (unexpected bugs) at 'error' with the stack trace.
 *
 * @param {'checkin.ticket'|'checkin.verification'|'checkin.qr'} scope
 * @param {Error} err
 */
const logApiFailure = (path, err) => {
  if (err instanceof ApiError) {
    const level = ROUTINE_ERROR_CODES.has(err.code) ? 'debug' : 'warn';
    logger[level]('api', err.message, {
      path,
      code: err.code,
      status: err.status,
    });
  } else {
    logger.error('api', err.message, { path, stack: err.stack });
  }
};
