import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getUserProfile,
  updateUserProfile,
  getAllUsers
} from '../controllers/userController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', getAllUsers);
router.get('/profile', getUserProfile);
router.get('/profile/:userId', getUserProfile);
router.put('/profile', updateUserProfile);

export default router;
