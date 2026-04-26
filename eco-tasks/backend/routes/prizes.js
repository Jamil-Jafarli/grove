const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const rows = db.prepare(
    'SELECT prize_id FROM prize_redemptions WHERE user_id = ?'
  ).all(req.userId);
  res.json(rows.map((r) => r.prize_id));
});

router.post('/redeem', (req, res) => {
  const { prizeId } = req.body;
  if (!prizeId) return res.status(400).json({ error: 'prizeId tələb olunur' });
  try {
    db.prepare(
      'INSERT OR IGNORE INTO prize_redemptions (user_id, prize_id) VALUES (?, ?)'
    ).run(req.userId, prizeId);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server xətası' });
  }
});

module.exports = router;
