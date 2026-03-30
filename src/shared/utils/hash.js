const crypto = require('crypto');

const hashUA = ua => {
  return crypto.createHash('sha256').update(ua || '').digest('hex');
};

module.exports = { hashUA };
