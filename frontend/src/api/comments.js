import api from './client.js';

// Comments API functions
export const commentsAPI = {
  // Add a comment to a post (Student only)
  addComment: async (postId, commentData) => {
    const response = await api.post(`/api/comments/posts/${postId}/comments`, commentData);
    return response.data;
  },

  // Get all comments for a post
  getPostComments: async (postId, params = {}) => {
    const response = await api.get(`/api/comments/posts/${postId}/comments`, { params });
    return response.data;
  },

  // Add a reply to a comment (Mentor only)
  addReply: async (commentId, replyData) => {
    const response = await api.post(`/api/comments/${commentId}/reply`, replyData);
    return response.data;
  },

  // Get comments on mentor's posts (Mentor only)
  getMyPostsComments: async (params = {}) => {
    const response = await api.get('/api/comments/my-posts', { params });
    return response.data;
  },

  // Delete a comment
  deleteComment: async (commentId) => {
    const response = await api.delete(`/api/comments/${commentId}`);
    return response.data;
  },

  // Delete a reply from a comment
  deleteReply: async (commentId, replyId) => {
    const response = await api.delete(`/api/comments/${commentId}/reply/${replyId}`);
    return response.data;
  }
};
