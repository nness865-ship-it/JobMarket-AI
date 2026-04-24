import axios from 'axios';
import { getAuthToken } from '../auth/token';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000',
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const saveUserSkills = (email, skills) =>
  api.post('/save-user-skills', { email, skills });

export const getUser = (email) =>
  api.get(`/get-user?email=${encodeURIComponent(email)}`);

export const recommendJobs = (email) =>
  api.post('/recommend-jobs', { email });

export const generateRoadmap = (email, targetRole) =>
  api.post('/generate-roadmap', { email, target_role: targetRole });

export const getJobTrends = () =>
  api.get('/job-trends');

export const uploadResume = (formData) =>
  api.post('/upload-resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });

export const authGoogle = (credential) =>
  api.post('/auth/google', { credential });

export const me = () =>
  api.get('/me');

export default api;
