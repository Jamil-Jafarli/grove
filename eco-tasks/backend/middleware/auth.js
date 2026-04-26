const jwt = require('jsonwebtoken');
const db = require('../db');
const JWT_SECRET = process.env.JWT_SECRET || 'eco-tasks-secret-dev';

module.exports = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token tələb olunur' });
  }
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET);
    const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(payload.userId);
    if (!user) return res.status(401).json({ error: 'Sessiya bitib, yenidən daxil olun' });
    req.userId = user.id;
    req.username = user.username;
    next();
  } catch {
    res.status(401).json({ error: 'Etibarsız token' });
  }
};
