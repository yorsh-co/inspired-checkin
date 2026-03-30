const LoggerMiddleware = (() => {
  const logRequest = (req, _res, next) => {
    console.log(`[${req.method}] ${req.route}`);
    return next();
  };

  return { logRequest };
})();