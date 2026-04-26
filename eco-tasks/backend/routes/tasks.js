const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/history', (req, res) => {
  const rows = db.prepare(`
    SELECT date, task_id, completed_at
    FROM task_completions
    WHERE user_id = ?
    ORDER BY date DESC, completed_at ASC
  `).all(req.userId);

  const dayMap = new Map();
  for (const row of rows) {
    if (!dayMap.has(row.date)) {
      dayMap.set(row.date, { date: row.date, completedTasks: [] });
    }
    dayMap.get(row.date).completedTasks.push({
      taskId: row.task_id,
      completedAt: row.completed_at,
    });
  }

  res.json(Array.from(dayMap.values()));
});

router.post('/complete', (req, res) => {
  const { date, taskId, completedAt } = req.body;
  if (!date || !taskId) {
    return res.status(400).json({ error: 'date və taskId tələb olunur' });
  }
  try {
    db.prepare(`
      INSERT OR IGNORE INTO task_completions (user_id, task_id, date, completed_at)
      VALUES (?, ?, ?, ?)
    `).run(req.userId, taskId, date, completedAt || new Date().toISOString());
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server xətası' });
  }
});

module.exports = router;
