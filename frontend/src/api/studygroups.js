import client from './client.js';

const API_URL = '/api/studygroups';

export const studyGroupsAPI = {
  // Get all study groups
  getAllStudyGroups: async (params = {}) => {
    const { data } = await client.get(API_URL, { params });
    return data;
  },

  // Get my study groups
  getMyStudyGroups: async () => {
    const { data } = await client.get(`${API_URL}/my`);
    return data;
  },

  // Get study group by ID
  getStudyGroupById: async (id) => {
    const { data } = await client.get(`${API_URL}/${id}`);
    return data;
  },

  // Create study group
  createStudyGroup: async (groupData) => {
    const { data} = await client.post(API_URL, groupData);
    return data;
  },

  // Join study group
  joinStudyGroup: async (id) => {
    const { data } = await client.post(`${API_URL}/${id}/join`);
    return data;
  },

  // Leave study group
  leaveStudyGroup: async (id) => {
    const { data } = await client.post(`${API_URL}/${id}/leave`);
    return data;
  },

  // Update study group (Admin only)
  updateStudyGroup: async (id, groupData) => {
    const { data } = await client.put(`${API_URL}/${id}`, groupData);
    return data;
  },

  // Delete study group (Admin only)
  deleteStudyGroup: async (id) => {
    const { data } = await client.delete(`${API_URL}/${id}`);
    return data;
  }
};
