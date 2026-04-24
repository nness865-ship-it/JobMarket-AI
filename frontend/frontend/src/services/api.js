import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000',
});

export const saveUserSkills = (email, skills) => 
  api.post('/save-user-skills', { email, skills });

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

export default api;
