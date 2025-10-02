import { Router } from 'express';
import { 
  sendMessage, 
  getChatHistory, 
  clearChatHistory, 
  getChatbotStats 
} from '../controllers/chatbotController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// All routes require authentication
router.use(protect);

// POST /api/chatbot/message - Send a message to the chatbot (Students only)
router.post('/message', sendMessage);

// GET /api/chatbot/history - Get chat history for current user (Students only)
router.get('/history', getChatHistory);

// DELETE /api/chatbot/history - Clear chat history for current user (Students only)
router.delete('/history', clearChatHistory);

// GET /api/chatbot/stats - Get chatbot usage statistics (Mentors only)
router.get('/stats', getChatbotStats);

export default router;
