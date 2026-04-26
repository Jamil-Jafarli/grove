const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

const TASK_XAL = {
  t1: 30, t2: 50, t3: 40, t4: 40, t5: 20,
  t6: 20, t7: 40, t8: 15, t9: 35, t10: 15,
  t11: 70, t12: 45, t13: 50, t14: 10, t15: 100,
};
const DEFAULT_XAL = 30;
const PROBLEM_XAL = 1000;
const PROBLEM_COIN = 200;

function calcUserStats(userId) {
  const tasks = db.prepare('SELECT task_id FROM task_completions WHERE user_id = ?').all(userId);
  const problems = db.prepare(
    "SELECT COUNT(*) as cnt FROM eco_problems WHERE resolver_id = ? AND status = 'resolved'"
  ).get(userId);
  const totalXal = tasks.reduce((s, t) => s + (TASK_XAL[t.task_id] || DEFAULT_XAL), 0)
    + problems.cnt * PROBLEM_XAL;
  return { totalXal, taskCount: tasks.length, resolvedProblems: problems.cnt };
}

function notify(userId, type, actorId, actorUsername, refId = null, data = null) {
  try {
    db.prepare(
      'INSERT INTO notifications (user_id, type, actor_id, actor_username, ref_id, data) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(userId, type, actorId, actorUsername, refId, data ? JSON.stringify(data) : null);
  } catch { /* ignore */ }
}

/* ── Search users ── */
router.get('/search', (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json([]);

  const users = db.prepare(
    'SELECT id, username, is_private FROM users WHERE username LIKE ? LIMIT 10'
  ).all(`%${q}%`);

  const results = users.map(u => {
    const stats = calcUserStats(u.id);
    const followRow = db.prepare(
      'SELECT status FROM followers WHERE follower_id = ? AND following_id = ?'
    ).get(req.userId, u.id);
    return {
      id: u.id,
      username: u.username,
      isPrivate: !!u.is_private,
      totalXal: stats.totalXal,
      taskCount: stats.taskCount,
      resolvedProblems: stats.resolvedProblems,
      isCurrentUser: u.id === req.userId,
      isFollowing: followRow?.status === 'active',
      isPendingFollow: followRow?.status === 'pending',
    };
  });
  res.json(results);
});

/* ── User profile stats ── */
router.get('/:id/stats', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = db.prepare('SELECT id, username, is_private, phone_number FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(404).json({ error: 'İstifadəçi tapılmadı' });

  const isOwner = userId === req.userId;
  const isPrivate = !!user.is_private;

  const followRow = db.prepare('SELECT status FROM followers WHERE follower_id = ? AND following_id = ?').get(req.userId, userId);
  const isFollowing = followRow?.status === 'active';
  const isPendingFollow = followRow?.status === 'pending';

  const followerCount = db.prepare("SELECT COUNT(*) as c FROM followers WHERE following_id = ? AND status='active'").get(userId).c;
  const followingCount = db.prepare("SELECT COUNT(*) as c FROM followers WHERE follower_id = ? AND status='active'").get(userId).c;

  const stats = calcUserStats(userId);

  const posts = (isPrivate && !isOwner && !isFollowing) ? [] : db.prepare(`
    SELECT p.*,
      (SELECT COUNT(*) FROM post_leaves WHERE post_id = p.id) as leaf_count,
      0 as user_leafed
    FROM posts p WHERE p.user_id = ? ORDER BY p.created_at DESC LIMIT 20
  `).all(userId).map(p => ({
    ...p,
    user_leafed: false,
    comments: db.prepare('SELECT * FROM post_comments WHERE post_id = ? ORDER BY created_at ASC').all(p.id),
  }));

  res.json({
    id: user.id,
    username: user.username,
    isPrivate,
    phoneNumber: (!isPrivate || isOwner) ? user.phone_number : null,
    totalXal: stats.totalXal,
    taskCount: stats.taskCount,
    resolvedProblems: stats.resolvedProblems,
    followerCount,
    followingCount,
    isFollowing,
    isPendingFollow,
    isCurrentUser: isOwner,
    posts,
  });
});

/* ── Update own profile ── */
router.put('/me', (req, res) => {
  const { phone_number, is_private } = req.body;
  const updates = [];
  const params = [];

  if (phone_number !== undefined) { updates.push('phone_number = ?'); params.push(phone_number || null); }
  if (is_private !== undefined) { updates.push('is_private = ?'); params.push(is_private ? 1 : 0); }

  if (updates.length === 0) return res.status(400).json({ error: 'Yenilənəcək sahə yoxdur' });
  params.push(req.userId);

  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  const user = db.prepare('SELECT id, username, email, is_private, phone_number FROM users WHERE id = ?').get(req.userId);
  res.json({ id: user.id, username: user.username, email: user.email, is_private: user.is_private, phone_number: user.phone_number });
});

/* ── Follow / unfollow / request ── */
router.post('/:id/follow', (req, res) => {
  const targetId = parseInt(req.params.id);
  if (targetId === req.userId) return res.status(400).json({ error: 'Özünüzü izləyə bilməzsiniz' });

  const target = db.prepare('SELECT id, username, is_private FROM users WHERE id = ?').get(targetId);
  if (!target) return res.status(404).json({ error: 'İstifadəçi tapılmadı' });

  const existing = db.prepare('SELECT id, status FROM followers WHERE follower_id = ? AND following_id = ?').get(req.userId, targetId);

  if (existing) {
    // unfollow or cancel request
    db.prepare('DELETE FROM followers WHERE follower_id = ? AND following_id = ?').run(req.userId, targetId);
    const followerCount = db.prepare("SELECT COUNT(*) as c FROM followers WHERE following_id = ? AND status='active'").get(targetId).c;
    return res.json({ isFollowing: false, isPendingFollow: false, followerCount });
  }

  if (target.is_private) {
    // Send follow request
    db.prepare('INSERT OR IGNORE INTO followers (follower_id, following_id, status) VALUES (?, ?, ?)').run(req.userId, targetId, 'pending');
    notify(targetId, 'follow_request', req.userId, req.username, req.userId);
    const followerCount = db.prepare("SELECT COUNT(*) as c FROM followers WHERE following_id = ? AND status='active'").get(targetId).c;
    return res.json({ isFollowing: false, isPendingFollow: true, followerCount });
  }

  // Direct follow
  db.prepare('INSERT OR IGNORE INTO followers (follower_id, following_id, status) VALUES (?, ?, ?)').run(req.userId, targetId, 'active');
  notify(targetId, 'new_follower', req.userId, req.username, req.userId);
  const followerCount = db.prepare("SELECT COUNT(*) as c FROM followers WHERE following_id = ? AND status='active'").get(targetId).c;
  res.json({ isFollowing: true, isPendingFollow: false, followerCount });
});

/* ── Approve follow request ── */
router.post('/:id/follow/approve', (req, res) => {
  const requesterId = parseInt(req.params.id);
  const row = db.prepare('SELECT id FROM followers WHERE follower_id = ? AND following_id = ? AND status = ?').get(requesterId, req.userId, 'pending');
  if (!row) return res.status(404).json({ error: 'İzləmə istəyi tapılmadı' });

  db.prepare("UPDATE followers SET status = 'active' WHERE follower_id = ? AND following_id = ?").run(requesterId, req.userId);
  notify(requesterId, 'follow_accepted', req.userId, req.username, req.userId);

  // Mark the follow_request notification as read
  db.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND actor_id = ? AND type = 'follow_request'").run(req.userId, requesterId);

  res.json({ success: true });
});

/* ── Decline follow request ── */
router.post('/:id/follow/decline', (req, res) => {
  const requesterId = parseInt(req.params.id);
  db.prepare('DELETE FROM followers WHERE follower_id = ? AND following_id = ? AND status = ?').run(requesterId, req.userId, 'pending');
  db.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND actor_id = ? AND type = 'follow_request'").run(req.userId, requesterId);
  res.json({ success: true });
});

module.exports = { router, notify };
