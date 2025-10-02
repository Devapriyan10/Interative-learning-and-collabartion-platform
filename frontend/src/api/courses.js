import client from './client.js';

const API_URL = '/api/courses';

export const coursesAPI = {
  // Get all courses
  getAllCourses: async (params = {}) => {
    const { data } = await client.get(API_URL, { params });
    return data;
  },

  // Get my courses
  getMyCourses: async () => {
    const { data } = await client.get(`${API_URL}/my`);
    return data;
  },

  // Get course by ID
  getCourseById: async (id) => {
    const { data } = await client.get(`${API_URL}/${id}`);
    return data;
  },

  // Create course (Mentor only)
  createCourse: async (courseData) => {
    const { data } = await client.post(API_URL, courseData);
    return data;
  },

  // Enroll in course (Student only)
  enrollInCourse: async (id) => {
    const { data } = await client.post(`${API_URL}/${id}/enroll`);
    return data;
  },

  // Complete course (Student only)
  completeCourse: async (id) => {
    const { data } = await client.post(`${API_URL}/${id}/complete`);
    return data;
  },

  // Add lesson to course (Mentor only)
  addLesson: async (id, lessonData) => {
    const { data } = await client.post(`${API_URL}/${id}/lessons`, lessonData);
    return data;
  },

  // Update course (Mentor only)
  updateCourse: async (id, courseData) => {
    const { data } = await client.put(`${API_URL}/${id}`, courseData);
    return data;
  },

  // Delete course (Mentor only)
  deleteCourse: async (id) => {
    const { data } = await client.delete(`${API_URL}/${id}`);
    return data;
  }
};
