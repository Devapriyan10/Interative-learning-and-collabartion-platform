import api from './client.js';

// Chatbot API functions
export const chatbotAPI = {
  // Send a message to the chatbot
  sendMessage: async (message) => {
    const response = await api.post('/api/chatbot/message', { message });
    return response.data;
  },

  // Get chat history for the current user
  getChatHistory: async () => {
    const response = await api.get('/api/chatbot/history');
    return response.data;
  },

  // Clear chat history for the current user
  clearChatHistory: async () => {
    const response = await api.delete('/api/chatbot/history');
    return response.data;
  },

  // Get chatbot statistics (Mentors only)
  getChatbotStats: async () => {
    const response = await api.get('/api/chatbot/stats');
    return response.data;
  }
};
