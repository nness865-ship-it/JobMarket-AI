import axios from 'axios';
import { getAuthToken } from '../auth/token';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000',
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// User management
export const me = () => api.get('/me');

export const saveUserSkills = (email, skills) => 
  api.post('/save-user-skills', { email, skills });

export const updateUserProfile = (profileData) => 
  api.post('/update-user-profile', profileData);

// Job recommendations and roadmaps
export const recommendJobs = (email, skills) => 
  api.post('/recommend-jobs', { email, skills });

export const getPromotionPathway = (email, skills, currentRole, profileData = {}) => 
  api.post('/career-pathways/promotion', { 
    email, 
    skills, 
    current_role: currentRole,
    ...profileData 
  });

export const getHighPayingJobs = (email, skills, currentRole, profileData = {}) => 
  api.post('/career-pathways/high-paying-jobs', { 
    email, 
    skills, 
    current_role: currentRole,
    ...profileData 
  });

export const generateRoadmap = (email, targetRole, skills) => 
  api.post('/generate-roadmap', { email, target_role: targetRole, skills });

export const getJobTrends = () => 
  api.get('/job-trends');

export const saveSkillProgress = (data) =>
  api.post('/save-skill-progress', data);

export const getSkillTracker = (email) =>
  api.get(`/get-skill-tracker?email=${email}`);

// Resume upload
export const uploadResume = (formData) => 
  api.post('/upload-resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });

// Authentication
export const sendOtp = (email) => 
  api.post('/auth/send-otp', { email });

export const verifyOtp = (email, code) => 
  api.post('/auth/verify-otp', { email, code });

export const authGoogle = (credential) => 
  api.post('/auth/google', { credential });

export const authDemo = () => 
  api.post('/auth/demo');

export default api;
