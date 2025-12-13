const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default {
  AUTH: `${API_BASE_URL}/api/auth`,
  USER: `${API_BASE_URL}/api/user`,
  DASHBOARD: `${API_BASE_URL}/api/dashboard`,
  SKILLS: `${API_BASE_URL}/api/skills`,
  RECOMMENDATIONS: `${API_BASE_URL}/api/recommendations`,
  PROFILE: `${API_BASE_URL}/api/profile`,
  ANALYZE: `${API_BASE_URL}/api/analyze`,
  SKILLSERVICE:
    import.meta.env.VITE_SERVICE_URL ||
    "https://workskillai-service.onrender.com/",
};
