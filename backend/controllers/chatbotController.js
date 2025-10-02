import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatHistory } from '../models/ChatHistory.js';
import { User } from '../models/User.js';

// Initialize Gemini AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the generative model (using gemini-pro for text generation)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Configuration for the AI model to act as a study buddy
const STUDY_BUDDY_PROMPT = `You are a helpful Study Buddy AI assistant for students in an educational platform. Your role is to:

1. Help students understand concepts and solve academic problems
2. Provide clear, educational explanations
3. Encourage learning and critical thinking
4. Be supportive and motivating
5. Ask follow-up questions to ensure understanding
6. Provide examples when helpful
7. Keep responses concise but comprehensive (max 300 words)
8. If asked about non-academic topics, politely redirect to educational content

Always be encouraging, patient, and educational in your responses. Remember you're helping students learn and grow.`;

/**
 * Send a message to the chatbot and get AI response
 * POST /api/chatbot/message
 */
export async function sendMessage(req, res) {
  try {
    const { message } = req.body;
    const { id: userId, role } = req.user || {};

    // Validate input
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Only students can use the chatbot
    if (role !== 'Student') {
      return res.status(403).json({ message: 'Only students can use the study buddy chatbot' });
    }

    // Validate message length
    if (message.length > 1000) {
      return res.status(400).json({ message: 'Message is too long. Please keep it under 1000 characters.' });
    }

    // Get or create chat history for the user
    let chatHistory = await ChatHistory.findOne({ userId, isActive: true });
    if (!chatHistory) {
      chatHistory = new ChatHistory({
        userId,
        messages: []
      });
    }

    // Add the student's message to history
    const studentMessage = {
      sender: 'student',
      text: message.trim(),
      timestamp: new Date()
    };
    chatHistory.messages.push(studentMessage);

    // Prepare context from recent conversation history (last 10 messages)
    const recentMessages = chatHistory.messages.slice(-10);
    const conversationContext = recentMessages
      .map(msg => `${msg.sender === 'student' ? 'Student' : 'Study Buddy'}: ${msg.text}`)
      .join('\n');

    // Create the full prompt with context
    const fullPrompt = `${STUDY_BUDDY_PROMPT}

Previous conversation:
${conversationContext}

Current student question: ${message}

Please provide a helpful, educational response:`;

    // Get AI response from Gemini
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const botResponseText = response.text();

    // Add bot response to history
    const botMessage = {
      sender: 'bot',
      text: botResponseText,
      timestamp: new Date()
    };
    chatHistory.messages.push(botMessage);

    // Save updated chat history
    await chatHistory.save();

    // Return the bot response
    return res.status(200).json({
      message: 'Response generated successfully',
      response: botResponseText,
      conversationId: chatHistory._id
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    
    // Handle specific Gemini API errors
    if (error.message?.includes('API key')) {
      return res.status(500).json({ 
        message: 'AI service configuration error. Please contact support.' 
      });
    }
    
    if (error.message?.includes('quota') || error.message?.includes('limit')) {
      return res.status(429).json({ 
        message: 'AI service is temporarily busy. Please try again in a moment.' 
      });
    }

    return res.status(500).json({ 
      message: 'Failed to generate response. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get chat history for the current user
 * GET /api/chatbot/history
 */
export async function getChatHistory(req, res) {
  try {
    const { id: userId, role } = req.user || {};

    // Only students can access chat history
    if (role !== 'Student') {
      return res.status(403).json({ message: 'Only students can access chat history' });
    }

    // Get chat history for the user
    const chatHistory = await ChatHistory.findOne({ userId, isActive: true })
      .populate('userId', 'name email')
      .lean();

    if (!chatHistory) {
      return res.status(200).json({
        messages: [],
        conversationId: null
      });
    }

    // Return recent messages (last 50 to avoid overwhelming the client)
    const recentMessages = chatHistory.messages.slice(-50);

    return res.status(200).json({
      messages: recentMessages,
      conversationId: chatHistory._id,
      totalMessages: chatHistory.messages.length
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    return res.status(500).json({ 
      message: 'Failed to retrieve chat history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Clear chat history for the current user
 * DELETE /api/chatbot/history
 */
export async function clearChatHistory(req, res) {
  try {
    const { id: userId, role } = req.user || {};

    // Only students can clear their chat history
    if (role !== 'Student') {
      return res.status(403).json({ message: 'Only students can clear chat history' });
    }

    // Find and deactivate the chat history (soft delete)
    await ChatHistory.findOneAndUpdate(
      { userId, isActive: true },
      { isActive: false },
      { new: true }
    );

    return res.status(200).json({
      message: 'Chat history cleared successfully'
    });

  } catch (error) {
    console.error('Clear chat history error:', error);
    return res.status(500).json({ 
      message: 'Failed to clear chat history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get chatbot statistics (for admin/mentor use)
 * GET /api/chatbot/stats
 */
export async function getChatbotStats(req, res) {
  try {
    const { role } = req.user || {};

    // Only mentors can access stats
    if (role !== 'Mentor') {
      return res.status(403).json({ message: 'Only mentors can access chatbot statistics' });
    }

    // Get basic statistics
    const totalConversations = await ChatHistory.countDocuments({ isActive: true });
    const totalMessages = await ChatHistory.aggregate([
      { $match: { isActive: true } },
      { $project: { messageCount: { $size: '$messages' } } },
      { $group: { _id: null, total: { $sum: '$messageCount' } } }
    ]);

    const activeUsersToday = await ChatHistory.countDocuments({
      isActive: true,
      lastInteraction: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    return res.status(200).json({
      totalConversations,
      totalMessages: totalMessages[0]?.total || 0,
      activeUsersToday,
      generatedAt: new Date()
    });

  } catch (error) {
    console.error('Get chatbot stats error:', error);
    return res.status(500).json({ 
      message: 'Failed to retrieve chatbot statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
