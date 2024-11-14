const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.decode(token);
    req.user = verified;
    next();
  } catch (error) {

    res.status(400).json({ message: 'Invalid token' });
  }
};

module.exports = auth;
