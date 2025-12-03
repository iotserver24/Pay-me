const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'defaultsecret', {
    expiresIn: '1h' // Short expiration as requested
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');
  } catch (err) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken
};
