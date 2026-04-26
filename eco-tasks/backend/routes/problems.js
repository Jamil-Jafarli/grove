const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const { notify } = require('./users');

const router = express.Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM eco_problems ORDER BY created_at DESC
  `).all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { title, description, location, photo_data, lat, lng } = req.body;
  if (!title || !description || !location) {
    return res.status(400).json({ error: 'Başlıq, təsvir və məkan tələb olunur' });
  }
  try {
    const result = db.prepare(`
      INSERT INTO eco_problems (title, description, location, photo_data, reporter_id, reporter_username, status, lat, lng)
      VALUES (?, ?, ?, ?, ?, ?, 'reported', ?, ?)
    `).run(title, description, location, photo_data || null, req.userId, req.username, lat ?? null, lng ?? null);
    const row = db.prepare('SELECT * FROM eco_problems WHERE id = ?').get(result.lastInsertRowid);
    res.json(row);
  } catch {
    res.status(500).json({ error: 'Server xətası' });
  }
});

router.put('/:id/claim', (req, res) => {
  const problem = db.prepare('SELECT * FROM eco_problems WHERE id = ?').get(req.params.id);
  if (!problem) return res.status(404).json({ error: 'Problem tapılmadı' });
  if (problem.status !== 'reported') return res.status(400).json({ error: 'Bu problem artıq götürülüb' });
  if (problem.reporter_id === req.userId) return res.status(400).json({ error: 'Öz problemini götürə bilməzsən' });

  db.prepare(`
    UPDATE eco_problems
    SET status = 'claimed', claimer_id = ?, claimer_username = ?, claimed_at = datetime('now')
    WHERE id = ?
  `).run(req.userId, req.username, req.params.id);

  const updated = db.prepare('SELECT * FROM eco_problems WHERE id = ?').get(req.params.id);
  // Notify reporter
  if (problem.reporter_id !== req.userId) {
    notify(problem.reporter_id, 'problem_claimed', req.userId, req.username, problem.id, { title: problem.title });
  }
  res.json(updated);
});

router.put('/:id/resolve', (req, res) => {
  const problem = db.prepare('SELECT * FROM eco_problems WHERE id = ?').get(req.params.id);
  if (!problem) return res.status(404).json({ error: 'Problem tapılmadı' });
  if (problem.status !== 'claimed') return res.status(400).json({ error: 'Problem hələ öhdəliyə götürülməyib' });
  if (problem.claimer_id !== req.userId) return res.status(403).json({ error: 'Yalnız öhdəlik götürən həll edə bilər' });

  const { resolution_photo } = req.body;
  if (!resolution_photo) return res.status(400).json({ error: 'Həll şəkli mütləq yüklənməlidir' });

  db.prepare(`
    UPDATE eco_problems
    SET status = 'resolved', resolver_id = ?, resolver_username = ?,
        resolved_at = datetime('now'), resolution_photo = ?
    WHERE id = ?
  `).run(req.userId, req.username, resolution_photo, req.params.id);

  const updated = db.prepare('SELECT * FROM eco_problems WHERE id = ?').get(req.params.id);
  // Notify reporter
  if (problem.reporter_id !== req.userId) {
    notify(problem.reporter_id, 'problem_resolved', req.userId, req.username, problem.id, { title: problem.title });
  }
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const problem = db.prepare('SELECT * FROM eco_problems WHERE id = ?').get(req.params.id);
  if (!problem) return res.status(404).json({ error: 'Problem tapılmadı' });
  if (problem.reporter_id !== req.userId) return res.status(403).json({ error: 'Yalnız müəllif silə bilər' });
  if (problem.status !== 'reported') return res.status(400).json({ error: 'Öhdəliyə götürülmüş problemi silmək olmaz' });

  db.prepare('DELETE FROM eco_problems WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
