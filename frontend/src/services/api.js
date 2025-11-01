import axios from 'axios';

// Get API URL from environment or use default
let API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Ensure API_URL always ends with /api for consistency
// This fixes the issue where REACT_APP_API_URL might not include /api
if (!API_URL.endsWith('/api')) {
  // If it ends with /, remove it and add /api
  if (API_URL.endsWith('/')) {
    API_URL = API_URL.slice(0, -1) + '/api';
  } else {
    // If it doesn't end with /api, add it
    API_URL = API_URL + '/api';
  }
}

// Log API URL in development for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('🔗 API Base URL:', API_URL);
}

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  adminLogin: (data) => api.post('/auth/admin-login', data),
  getMe: () => api.get('/auth/me'),
  updateDetails: (data) => api.put('/auth/updatedetails', data),
  updatePassword: (data) => api.put('/auth/updatepassword', data),
};

// Users API
export const usersAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  updateLastActive: (id) => api.put(`/users/${id}/last-active`),
};

// Issues API
export const issuesAPI = {
  getIssues: (params) => api.get('/issues', { params }),
  getIssue: (id) => api.get(`/issues/${id}`),
  createIssue: (data) => api.post('/issues', data),
  updateIssue: (id, data) => api.put(`/issues/${id}`, data),
  deleteIssue: (id) => api.delete(`/issues/${id}`),
  resolveIssue: (id, data) => api.post(`/issues/${id}/resolve`, data),
  closeIssue: (id) => api.post(`/issues/${id}/close`),
  getComments: (id) => api.get(`/issues/${id}/comments`),
  createComment: (id, data) => api.post(`/issues/${id}/comments`, data),
};

// Projects API
export const projectsAPI = {
  getProjects: () => api.get('/projects'),
  getProject: (id) => api.get(`/projects/${id}`),
  createProject: (data) => api.post('/projects', data),
  importFromGitHub: (data) => api.post('/projects/import-github', data),
  analyzeProject: (id) => api.post(`/projects/${id}/analyze`),
  analyzeSourceCode: (id, data) => api.post(`/projects/${id}/analyze-code`, data),
  updateProject: (id, data) => api.put(`/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  getAnalytics: (id) => api.get(`/projects/${id}/analytics`),
};

// Sprints API
export const sprintsAPI = {
  getSprints: (params) => api.get('/sprints', { params }),
  getSprint: (id) => api.get(`/sprints/${id}`),
  createSprint: (data) => api.post('/sprints', data),
  updateSprint: (id, data) => api.put(`/sprints/${id}`, data),
  deleteSprint: (id) => api.delete(`/sprints/${id}`),
  getAnalytics: (id) => api.get(`/sprints/${id}/analytics`),
};

// Triage API
export const triageAPI = {
  aiTriage: (data) => api.post('/triage/ai', data),
  checkDuplicates: (data) => api.post('/triage/duplicates', data),
  smartAutoAssign: (data) => api.post('/triage/auto-assign', data),
};

// Activities API
export const activitiesAPI = {
  getActivities: (params) => api.get('/activities', { params }),
  createActivity: (data) => api.post('/activities', data),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

// Analytics API
export const analyticsAPI = {
  getVelocity: (params) => api.get('/analytics/velocity', { params }),
  getCapacity: (params) => api.get('/analytics/capacity', { params }),
  getBurndown: (params) => api.get('/analytics/burndown', { params }),
  getAnalytics: (params) => api.get('/analytics', { params }),
  getProjectAnalytics: (projectId, params) => api.get(`/analytics/projects/${projectId}`, { params }),
};

// Tasks API
export const tasksAPI = {
  getTasks: (params) => api.get('/tasks', { params }),
  getTask: (id) => api.get(`/tasks/${id}`),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  completeTask: (id, data) => api.post(`/tasks/${id}/complete`, data),
};

export default api;
