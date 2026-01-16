import API_CONFIG, { OFFLINE_MODE } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { offlineStorage } from './offlineStorage';
import { contentLoader } from './contentLoader';

const TOKEN_KEY = '@miabc_auth_token';
const USER_KEY = '@miabc_user_data';

export interface AuthResponse {
  access_token: string;
  token_type: string;
  userId: number;
  username: string;
  accessCode: string;
  learnerName?: string;
}

export interface RegisterData {
  username: string;
  password: string;
  learnerName: string;
  guardianName: string;
  learnerAge?: number;
  guardianEmail?: string;
  guardianPhone?: string;
  guardianRelation?: string;
  learnerGrade?: string;
  parentalLock?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

class ApiService {
  private token: string | null = null;

  async init() {
    // Initialize offline storage
    if (OFFLINE_MODE) {
      await offlineStorage.initialize();
      console.log('📱 Running in OFFLINE MODE');
    }
    // Load stored token
    this.token = await AsyncStorage.getItem(TOKEN_KEY);
  }

  async setToken(token: string) {
    this.token = token;
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }

  async clearToken() {
    this.token = null;
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  }

  async getToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await AsyncStorage.getItem(TOKEN_KEY);
    }
    return this.token;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const token = await this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
        } catch (e) {
          // If JSON parsing fails, use default message
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error: any) {
      console.error('API Request failed:', error);
      // If error is already an Error object with a message, throw it
      if (error instanceof Error) {
        throw error;
      }
      // Otherwise wrap it
      throw new Error(error?.message || 'Network request failed');
    }
  }

  // Authentication
  async register(data: RegisterData): Promise<AuthResponse> {
    // Offline mode: Use local storage
    if (OFFLINE_MODE) {
      console.log('📱 Offline registration');
      const user = await offlineStorage.createUser({
        username: data.username,
        password: data.password,
        learnerName: data.learnerName,
        guardianName: data.guardianName,
        learnerAge: data.learnerAge,
        guardianEmail: data.guardianEmail,
        guardianPhone: data.guardianPhone,
      });

      const response: AuthResponse = {
        access_token: `offline_${user.id}`,
        token_type: 'bearer',
        userId: parseInt(user.id),
        username: user.username,
        accessCode: user.id,
        learnerName: user.learnerName,
      };

      await this.setToken(response.access_token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(response));
      return response;
    }

    // Online mode: Use backend API
    const response = await this.request<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    await this.setToken(response.access_token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(response));
    return response;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    // Offline mode: Use local storage
    if (OFFLINE_MODE) {
      console.log('📱 Offline login');
      const user = await offlineStorage.login(data.username, data.password);

      const response: AuthResponse = {
        access_token: `offline_${user.id}`,
        token_type: 'bearer',
        userId: parseInt(user.id),
        username: user.username,
        accessCode: user.id,
        learnerName: user.learnerName,
      };

      await this.setToken(response.access_token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(response));
      return response;
    }

    // Online mode: Use backend API
    const response = await this.request<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    await this.setToken(response.access_token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(response));
    return response;
  }

  async logout() {
    if (OFFLINE_MODE) {
      await offlineStorage.logout();
    }
    await this.clearToken();
  }

  async getCurrentUser(): Promise<any> {
    return await this.request(API_CONFIG.ENDPOINTS.AUTH.ME);
  }

  async updateUserProfile(data: Partial<RegisterData>): Promise<any> {
    return await this.request('/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Content
  async getModuleContent(moduleId: string): Promise<any> {
    // Offline mode: Load from bundled JSON
    if (OFFLINE_MODE) {
      console.log('📱 Offline module load:', moduleId);
      return await contentLoader.getModule(moduleId);
    }
    // Online mode: Use backend API
    return await this.request(API_CONFIG.ENDPOINTS.CONTENT.MODULE(moduleId));
  }

  async getQuizContent(moduleId: string): Promise<any> {
    // Offline mode: Load from bundled JSON
    if (OFFLINE_MODE) {
      console.log('📱 Offline quiz load:', moduleId);
      return await contentLoader.getQuiz(moduleId);
    }
    // Online mode: Use backend API
    return await this.request(API_CONFIG.ENDPOINTS.CONTENT.QUIZ(moduleId));
  }

  async getUserProgress(): Promise<any> {
    // Offline mode: Get from local storage
    if (OFFLINE_MODE) {
      const userData = await AsyncStorage.getItem(USER_KEY);
      if (userData) {
        const user = JSON.parse(userData);
        return await offlineStorage.getUserProgress(user.userId.toString());
      }
      return [];
    }
    // Online mode: Use backend API
    return await this.request(API_CONFIG.ENDPOINTS.CONTENT.PROGRESS);
  }

  async updateProgress(moduleId: string, score: number, passed: boolean): Promise<any> {
    // Offline mode: Save to local storage
    if (OFFLINE_MODE) {
      console.log('📱 Offline progress update');
      const userData = await AsyncStorage.getItem(USER_KEY);
      if (userData) {
        const user = JSON.parse(userData);
        await offlineStorage.saveProgress(user.userId.toString(), moduleId, score, passed);
        return { success: true };
      }
      throw new Error('User not logged in');
    }

    // Online mode: Use backend API
    return await this.request(API_CONFIG.ENDPOINTS.CONTENT.PROGRESS, {
      method: 'POST',
      body: JSON.stringify({ module_id: moduleId, score, passed }),
    });
  }

  async unlockModule(moduleId: string): Promise<any> {
    return await this.request(API_CONFIG.ENDPOINTS.CONTENT.UNLOCK(moduleId), {
      method: 'POST',
    });
  }
}

const apiService = new ApiService();
export default apiService;
