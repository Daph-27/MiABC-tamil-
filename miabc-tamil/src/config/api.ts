// API Configuration
// Note: Android emulator uses 10.0.2.2 to access host machine's localhost
// iOS simulator uses localhost
import { Platform } from 'react-native';

const getApiBaseUrl = () => {
  if (!__DEV__) {
    return 'https://your-production-api.com/api/v1';  // Production
  }
  
  // Development mode
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api/v1';  // Android emulator special IP
  }
  
  return 'http://localhost:8000/api/v1';  // iOS simulator & web
};

const API_BASE_URL = getApiBaseUrl();

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
