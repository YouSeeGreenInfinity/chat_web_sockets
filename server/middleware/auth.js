const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    try {
      const dbUser = await User.findByPk(user.id);
      if (!dbUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      req.user = dbUser;
      next();
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
};

module.exports = { authenticateToken };