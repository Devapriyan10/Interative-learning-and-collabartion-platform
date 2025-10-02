import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getLeaderboardData,
  getUserRank,
  getUserBadges,
  getUserStats
} from '../controllers/gamificationController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/leaderboard', getLeaderboardData);
router.get('/rank', getUserRank);
router.get('/rank/:userId', getUserRank);
router.get('/badges', getUserBadges);
router.get('/badges/:userId', getUserBadges);
router.get('/stats', getUserStats);
router.get('/stats/:userId', getUserStats);

export default router;
