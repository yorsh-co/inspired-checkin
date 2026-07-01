import { AppError } from '../shared/errors/app-error.js';

/**
 * Central JSON error handler for the API router. Must be registered
 * last, after all `/api/v1` routes.
 *
 * AppError instances are operational: logged at warn, and their
 * message/code/details are safe to send to the client as-is.
 * Anything else is unexpected: logged at error with the full stack,
 * and reported to the client as a generic 500 with no internal detail.
 *
 * @param {Error|AppError} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;

  /** @type {import('../types/appErrorCode.js').AppErrorCode} */
  const code = isAppError ? err.code : 'INTERNAL_ERROR';

  const logPayload = {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    code,
    message: err.message,
    sessionType: req.session?.type,
  };

  if (isAppError && statusCode < 500) {
    console.warn('[Request Error]', logPayload);
  } else {
    console.error('[Unexpected Error]', { ...logPayload, stack: err.stack });
  }

  if (code === 'RATE_LIMITED' && err.details?.retryAfterSeconds) {
    res.set('Retry-After', String(err.details.retryAfterSeconds));
  }

  res.status(statusCode).json({
    success: false,
    error: isAppError ? err.message : 'Internal server error',
    code,
    ...(isAppError && err.details ? { details: err.details } : {}),
  });
};
