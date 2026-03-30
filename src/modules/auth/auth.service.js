const jwt = require('jsonwebtoken');

const JWT_SECRET = 'super-secret';

const issueToken = payload => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '2h'
  });
};

module.exports = { issueToken };
