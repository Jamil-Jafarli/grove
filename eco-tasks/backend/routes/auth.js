const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'eco-tasks-secret-dev';

router.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Bütün sahələr tələb olunur' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Şifrə ən azı 6 simvol olmalıdır' });
  }
  try {
    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
    ).run(username.trim(), email.trim().toLowerCase(), hash);

    const token = jwt.sign(
      { userId: result.lastInsertRowid, username: username.trim() },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    res.json({ token, user: { id: result.lastInsertRowid, username: username.trim(), email: email.trim().toLowerCase(), is_private: 0, phone_number: null } });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      res.status(409).json({ error: 'Bu istifadəçi adı və ya email artıq mövcuddur' });
    } else {
      res.status(500).json({ error: 'Server xətası' });
    }
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email və şifrə tələb olunur' });
  }
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Email və ya şifrə yanlışdır' });
  }
  const token = jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
  res.json({ token, user: { id: user.id, username: user.username, email: user.email, is_private: user.is_private ?? 0, phone_number: user.phone_number ?? null } });
});

module.exports = router;
