import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createCourse,
  getAllCourses,
  getCourseById,
  enrollInCourse,
  completeCourse,
  getMyCourses,
  addLesson,
  updateCourse,
  deleteCourse
} from '../controllers/courseController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Public routes
router.get('/', getAllCourses);
router.get('/my', getMyCourses);
router.get('/:id', getCourseById);

// Mentor routes
router.post('/', createCourse);
router.post('/:id/lessons', addLesson);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

// Student routes
router.post('/:id/enroll', enrollInCourse);
router.post('/:id/complete', completeCourse);

export default router;
