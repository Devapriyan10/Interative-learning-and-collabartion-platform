import api from './client.js';

// Posts API functions
export const postsAPI = {
  // Create a new post (Mentor only)
  createPost: async (postData) => {
    const response = await api.post('/api/posts', postData);
    return response.data;
  },

  // Get all posts
  getAllPosts: async (params = {}) => {
    const response = await api.get('/api/posts', { params });
    return response.data;
  },

  // Get current mentor's posts
  getMyPosts: async (params = {}) => {
    const response = await api.get('/api/posts/my', { params });
    return response.data;
  },

  // Get a single post by ID
  getPostById: async (postId) => {
    const response = await api.get(`/api/posts/${postId}`);
    return response.data;
  },

  // Update a post (Mentor only)
  updatePost: async (postId, postData) => {
    const response = await api.put(`/api/posts/${postId}`, postData);
    return response.data;
  },

  // Delete a post (Mentor only)
  deletePost: async (postId) => {
    const response = await api.delete(`/api/posts/${postId}`);
    return response.data;
  }
};
