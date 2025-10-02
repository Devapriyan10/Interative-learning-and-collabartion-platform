import client from './client.js';

const API_URL = '/api/gamification';

export const gamificationAPI = {
  // Get leaderboard
  getLeaderboard: async (params = {}) => {
    const { data } = await client.get(`${API_URL}/leaderboard`, { params });
    return data;
  },

  // Get user rank
  getUserRank: async (userId = null) => {
    const url = userId ? `${API_URL}/rank/${userId}` : `${API_URL}/rank`;
    const { data } = await client.get(url);
    return data;
  },

  // Get user badges
  getUserBadges: async (userId = null) => {
    const url = userId ? `${API_URL}/badges/${userId}` : `${API_URL}/badges`;
    const { data } = await client.get(url);
    return data;
  },

  // Get user stats
  getUserStats: async (userId = null) => {
    const url = userId ? `${API_URL}/stats/${userId}` : `${API_URL}/stats`;
    const { data } = await client.get(url);
    return data;
  }
};
