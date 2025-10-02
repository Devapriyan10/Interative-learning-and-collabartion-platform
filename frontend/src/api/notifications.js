import client from './client.js';

const API_URL = '/api/notifications';

export const notificationsAPI = {
  // Get user notifications
  getUserNotifications: async (params = {}) => {
    const { data } = await client.get(API_URL, { params });
    return data;
  },

  // Mark notification as read
  markAsRead: async (id) => {
    const { data } = await client.put(`${API_URL}/${id}/read`);
    return data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const { data } = await client.put(`${API_URL}/read-all`);
    return data;
  },

  // Delete notification
  deleteNotification: async (id) => {
    const { data } = await client.delete(`${API_URL}/${id}`);
    return data;
  }
};
