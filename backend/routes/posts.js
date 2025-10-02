import { Router } from 'express';
import {
  createPost,
  getAllPosts,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost
} from '../controllers/postsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// All routes require authentication
router.use(protect);

// POST /api/posts - Create a new post (Mentor only)
router.post('/', createPost);

// GET /api/posts - Get all posts with optional mentor filter
router.get('/', getAllPosts);

// GET /api/posts/my - Get current mentor's posts (Mentor only)
router.get('/my', getMyPosts);

// GET /api/posts/:id - Get a single post by ID
router.get('/:id', getPostById);

// PUT /api/posts/:id - Update a post (Mentor only, own posts)
router.put('/:id', updatePost);

// DELETE /api/posts/:id - Delete a post (Mentor only, own posts)
router.delete('/:id', deletePost);

// POST /api/posts/:id/like - Like a post
router.post('/:id/like', likePost);

// DELETE /api/posts/:id/like - Unlike a post
router.delete('/:id/like', unlikePost);

export default router;
