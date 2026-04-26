const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const prizeRoutes = require('./routes/prizes');
const leaderboardRoutes = require('./routes/leaderboard');
const problemRoutes = require('./routes/problems');
const postRoutes = require('./routes/posts');
const { router: userRoutes } = require('./routes/users');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/prizes', prizeRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

app.listen(PORT, () => {
  console.log(`Grove backend port ${PORT}-də işləyir`);
});
