import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createStudyGroup,
  getAllStudyGroups,
  getStudyGroupById,
  joinStudyGroup,
  leaveStudyGroup,
  getMyStudyGroups,
  updateStudyGroup,
  deleteStudyGroup
} from '../controllers/studyGroupController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post('/', createStudyGroup);
router.get('/', getAllStudyGroups);
router.get('/my', getMyStudyGroups);
router.get('/:id', getStudyGroupById);
router.post('/:id/join', joinStudyGroup);
router.post('/:id/leave', leaveStudyGroup);
router.put('/:id', updateStudyGroup);
router.delete('/:id', deleteStudyGroup);

export default router;
