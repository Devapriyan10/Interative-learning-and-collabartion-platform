import client from './client.js';

const API_URL = '/api/users';

export const usersAPI = {
  // Get all users
  getAllUsers: async (params = {}) => {
    const { data } = await client.get(API_URL, { params });
    return data;
  },

  // Get user profile
  getUserProfile: async (userId = null) => {
    const url = userId ? `${API_URL}/profile/${userId}` : `${API_URL}/profile`;
    const { data } = await client.get(url);
    return data;
  },

  // Update user profile
  updateUserProfile: async (profileData) => {
    const { data } = await client.put(`${API_URL}/profile`, profileData);
    return data;
  }
};
