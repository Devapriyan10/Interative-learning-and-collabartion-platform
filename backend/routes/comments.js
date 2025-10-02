import { Router } from 'express';
import { 
  addComment, 
  getPostComments, 
  addReply, 
  getMyPostsComments, 
  deleteComment,
  deleteReply
} from '../controllers/commentsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// All routes require authentication
router.use(protect);

// POST /api/posts/:id/comments - Add a comment to a post (Student only)
router.post('/posts/:id/comments', addComment);

// GET /api/posts/:id/comments - Get all comments for a post
router.get('/posts/:id/comments', getPostComments);

// POST /api/comments/:id/reply - Add a reply to a comment (Mentor only)
router.post('/:id/reply', addReply);

// DELETE /api/comments/:id/reply/:replyId - Delete a reply from a comment (Mentor only)
router.delete('/:id/reply/:replyId', deleteReply);

// GET /api/comments/my-posts - Get comments on mentor's posts (Mentor only)
router.get('/my-posts', getMyPostsComments);

// DELETE /api/comments/:id - Delete a comment
router.delete('/:id', deleteComment);

export default router;
