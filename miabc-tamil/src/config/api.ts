// API Configuration
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:8000/api/v1'  // Development - 10.0.2.2 is Android emulator's host machine
  : 'https://your-production-api.com/api/v1';  // Production

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login-json',
      ME: '/auth/me',
      FORGOT_PASSWORD: '/auth/forgot-password',
    },
    CONTENT: {
      MODULE: (moduleId: string) => `/content/modules/${moduleId}`,
      QUIZ: (moduleId: string) => `/content/quizzes/${moduleId}`,
      PROGRESS: '/content/progress',
      UNLOCK: (moduleId: string) => `/content/unlock/${moduleId}`,
    },
  },
  TIMEOUT: 10000, // 10 seconds
};

export default API_CONFIG;
