const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  const posts = db.prepare(`
    SELECT p.*,
      (SELECT COUNT(*) FROM post_leaves WHERE post_id = p.id) as leaf_count,
      (SELECT COUNT(*) FROM post_leaves WHERE post_id = p.id AND user_id = ?) as user_leafed
    FROM posts p ORDER BY p.created_at DESC
  `).all(req.userId);

  const postsWithComments = posts.map(post => ({
    ...post,
    user_leafed: post.user_leafed > 0,
    comments: db.prepare(`SELECT * FROM post_comments WHERE post_id = ? ORDER BY created_at ASC`).all(post.id),
  }));

  res.json(postsWithComments);
});

router.post('/', (req, res) => {
  const { title, body, photo_data } = req.body;
  if (!title?.trim() || !body?.trim()) return res.status(400).json({ error: 'Başlıq və mətn tələb olunur' });
  try {
    const result = db.prepare(`
      INSERT INTO posts (user_id, username, title, body, photo_data) VALUES (?, ?, ?, ?, ?)
    `).run(req.userId, req.username, title.trim(), body.trim(), photo_data || null);
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(result.lastInsertRowid);
    res.json({ ...post, leaf_count: 0, user_leafed: false, comments: [] });
  } catch (err) {
    res.status(500).json({ error: 'Paylaşım yaradılmadı' });
  }
});

router.post('/:id/leaf', (req, res) => {
  const postId = parseInt(req.params.id);
  const existing = db.prepare('SELECT id FROM post_leaves WHERE post_id = ? AND user_id = ?').get(postId, req.userId);
  if (existing) {
    db.prepare('DELETE FROM post_leaves WHERE post_id = ? AND user_id = ?').run(postId, req.userId);
  } else {
    db.prepare('INSERT OR IGNORE INTO post_leaves (post_id, user_id) VALUES (?, ?)').run(postId, req.userId);
  }
  const count = db.prepare('SELECT COUNT(*) as c FROM post_leaves WHERE post_id = ?').get(postId).c;
  res.json({ leaf_count: count, user_leafed: !existing });
});

router.post('/:id/comments', (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'Şərh mətni tələb olunur' });
  const result = db.prepare(`
    INSERT INTO post_comments (post_id, user_id, username, text) VALUES (?, ?, ?, ?)
  `).run(parseInt(req.params.id), req.userId, req.username, text.trim());
  const comment = db.prepare('SELECT * FROM post_comments WHERE id = ?').get(result.lastInsertRowid);
  res.json(comment);
});

router.delete('/:id', (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(parseInt(req.params.id));
  if (!post) return res.status(404).json({ error: 'Tapılmadı' });
  if (post.user_id !== req.userId) return res.status(403).json({ error: 'İcazə yoxdur' });
  db.prepare('DELETE FROM post_comments WHERE post_id = ?').run(post.id);
  db.prepare('DELETE FROM post_leaves WHERE post_id = ?').run(post.id);
  db.prepare('DELETE FROM posts WHERE id = ?').run(post.id);
  res.json({ success: true });
});

module.exports = router;
