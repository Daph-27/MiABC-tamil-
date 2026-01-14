import API_CONFIG from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    await this.clearToken();
  }

  async getCurrentUser(): Promise<any> {
    return await this.request(API_CONFIG.ENDPOINTS.AUTH.ME);
  }

  // Content
  async getModuleContent(moduleId: string): Promise<any> {
    return await this.request(API_CONFIG.ENDPOINTS.CONTENT.MODULE(moduleId));
  }

  async getQuizContent(moduleId: string): Promise<any> {
    return await this.request(API_CONFIG.ENDPOINTS.CONTENT.QUIZ(moduleId));
  }

  async getUserProgress(): Promise<any> {
    return await this.request(API_CONFIG.ENDPOINTS.CONTENT.PROGRESS);
  }

  async updateProgress(moduleId: string, score: number, passed: boolean): Promise<any> {
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
