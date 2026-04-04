import jwt from 'jsonwebtoken';

export const requireApiAuth = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireWebAuth = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.redirect('/checkin');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    res.locals.user = decoded;

    next();
  } catch {
    return res.redirect('/checkin');
  }
};
