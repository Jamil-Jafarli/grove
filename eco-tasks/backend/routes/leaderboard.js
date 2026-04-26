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

router.get('/', (req, res) => {
  const users = db.prepare('SELECT id, username FROM users').all();

  const entries = users.map(u => {
    const tasks = db.prepare('SELECT task_id FROM task_completions WHERE user_id = ?').all(u.id);
    const resolvedCnt = db.prepare(
      "SELECT COUNT(*) as cnt FROM eco_problems WHERE resolver_id = ? AND status = 'resolved'"
    ).get(u.id).cnt;
    const totalXal = tasks.reduce((s, t) => s + (TASK_XAL[t.task_id] || DEFAULT_XAL), 0)
      + resolvedCnt * PROBLEM_XAL;

    return {
      userId: u.id,
      username: u.username,
      totalXal,
      taskCount: tasks.length,
      resolvedProblems: resolvedCnt,
      isCurrentUser: u.id === req.userId,
    };
  });

  entries.sort((a, b) => b.totalXal - a.totalXal);

  const rank = entries.findIndex(e => e.isCurrentUser) + 1;
  const top25 = entries.slice(0, 25);
  const meInTop = top25.some(e => e.isCurrentUser);
  const leaderboard = meInTop ? top25 : [...top25, entries[rank - 1]].filter(Boolean);

  res.json({ leaderboard, currentUserRank: rank, totalUsers: entries.length });
});

module.exports = router;
