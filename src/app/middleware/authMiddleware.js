const AuthMiddleware = (() => {
  const requireAuth = (req, res, next) => {    
    /*const token = req.params.token;

    if (!token) {
      return res.error(HttpError.forbidden('Missing token'));
    }

    if (token !== 'valid-token') {
      return res.error(HttpError.forbidden('Invalid token'));
    }

    req.user = { id: '123' };*/

  
    return next();
  };

  return { requireAuth };
})();
