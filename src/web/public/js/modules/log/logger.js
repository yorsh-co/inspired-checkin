const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

const MIN_LEVEL = 'debug';

/**
 * @param {'debug'|'info'|'warn'|'error'} level
 * @param {string} scope - e.g. 'checkin.ticket'
 * @param {string} message
 * @param {Object} [context] - safe-to-log metadata only
 */
const log = (level, scope, message, context = {}) => {
  if (LEVELS[level] < LEVELS[MIN_LEVEL]) return;

  (console[level] || console.log)(`[${scope}]`, message, context);
};

export const logger = {
  debug: (scope, message, context) => log('debug', scope, message, context),
  info: (scope, message, context) => log('info', scope, message, context),
  warn: (scope, message, context) => log('warn', scope, message, context),
  error: (scope, message, context) => log('error', scope, message, context),
};
