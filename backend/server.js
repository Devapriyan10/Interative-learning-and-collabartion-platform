import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB, dbStatus } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import postsRoutes from './routes/posts.js';
import commentsRoutes from './routes/comments.js';
import chatbotRoutes from './routes/chatbot.js';
import courseRoutes from './routes/courses.js';
import studyGroupRoutes from './routes/studygroups.js';
import gamificationRoutes from './routes/gamification.js';
import notificationRoutes from './routes/notifications.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url} - ${req.ip}`);

  const originalSend = res.send;
  res.send = function(data) {
    console.log(`[${timestamp}] ${req.method} ${req.url} - ${res.statusCode} ${res.statusMessage}`);
    return originalSend.call(this, data);
  };

  next();
});

app.get('/health', (_req, res) => {
  const status = dbStatus();
  res.json({ status: 'ok', db: status });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/studygroups', studyGroupRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

app.use((_req, res) => res.status(404).json({ message: 'Not Found' }));

const PORT = process.env.PORT || 5000;
connectDB(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });


