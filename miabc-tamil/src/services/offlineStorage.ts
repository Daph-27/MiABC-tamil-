import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys for AsyncStorage
const USERS_KEY = '@miabc_users';
const CURRENT_USER_KEY = '@miabc_current_user';
const USER_PROGRESS_KEY = '@miabc_user_progress_';

export interface User {
  id: string;
  username: string;
  password: string; // In production, this should be hashed
  learnerName: string;
  guardianName?: string;
  learnerAge?: number;
  guardianEmail?: string;
  guardianPhone?: string;
  createdAt: string;
}

export interface UserProgress {
  userId: string;
  moduleId: string;
  score: number;
  passed: boolean;
  completedAt: string;
  attempts: number;
}

class OfflineStorageService {
  /**
   * Initialize storage with default data if needed
   */
  async initialize() {
    const users = await this.getAllUsers();
    if (users.length === 0) {
      console.log('📦 Initializing offline storage...');
      // Create a default demo user
      await this.createUser({
        username: 'demo',
        password: 'demo123',
        learnerName: 'Demo User',
        guardianName: 'Demo Guardian',
      });
    }
  }

  /**
   * Get all registered users
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_KEY);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  /**
   * Create a new user (registration)
   */
  async createUser(userData: {
    username: string;
    password: string;
    learnerName: string;
    guardianName?: string;
    learnerAge?: number;
    guardianEmail?: string;
    guardianPhone?: string;
  }): Promise<User> {
    const users = await this.getAllUsers();
    
    // Check if username already exists
    if (users.find(u => u.username === userData.username)) {
      throw new Error('Username already exists');
    }

    const newUser: User = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    console.log('✅ User created:', newUser.username);
    return newUser;
  }

  /**
   * Login user
   */
  async login(username: string, password: string): Promise<User> {
    const users = await this.getAllUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
      throw new Error('Invalid username or password');
    }

    // Store current user
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    console.log('✅ User logged in:', user.username);
    
    return user;
  }

  /**
   * Get current logged-in user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    console.log('✅ User logged out');
  }

  /**
   * Save user progress for a module
   */
  async saveProgress(userId: string, moduleId: string, score: number, passed: boolean): Promise<void> {
    try {
      const progressKey = `${USER_PROGRESS_KEY}${userId}`;
      const progressJson = await AsyncStorage.getItem(progressKey);
      const allProgress: UserProgress[] = progressJson ? JSON.parse(progressJson) : [];

      // Find existing progress for this module
      const existingIndex = allProgress.findIndex(p => p.moduleId === moduleId);
      
      const newProgress: UserProgress = {
        userId,
        moduleId,
        score,
        passed,
        completedAt: new Date().toISOString(),
        attempts: existingIndex >= 0 ? allProgress[existingIndex].attempts + 1 : 1,
      };

      if (existingIndex >= 0) {
        // Update existing progress (keep best score)
        if (score > allProgress[existingIndex].score) {
          allProgress[existingIndex] = newProgress;
        } else {
          allProgress[existingIndex].attempts++;
        }
      } else {
        // Add new progress
        allProgress.push(newProgress);
      }

      await AsyncStorage.setItem(progressKey, JSON.stringify(allProgress));
      console.log('✅ Progress saved:', { userId, moduleId, score, passed });
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error;
    }
  }

  /**
   * Get all progress for a user
   */
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    try {
      const progressKey = `${USER_PROGRESS_KEY}${userId}`;
      const progressJson = await AsyncStorage.getItem(progressKey);
      return progressJson ? JSON.parse(progressJson) : [];
    } catch (error) {
      console.error('Error getting user progress:', error);
      return [];
    }
  }

  /**
   * Get progress for a specific module
   */
  async getModuleProgress(userId: string, moduleId: string): Promise<UserProgress | null> {
    const allProgress = await this.getUserProgress(userId);
    return allProgress.find(p => p.moduleId === moduleId) || null;
  }

  /**
   * Check if module is completed
   */
  async isModuleCompleted(userId: string, moduleId: string): Promise<boolean> {
    const progress = await this.getModuleProgress(userId, moduleId);
    return progress ? progress.passed : false;
  }

  /**
   * Get completion percentage for all modules
   */
  async getOverallProgress(userId: string, totalModules: number = 10): Promise<number> {
    const progress = await this.getUserProgress(userId);
    const completedModules = progress.filter(p => p.passed).length;
    return Math.round((completedModules / totalModules) * 100);
  }

  /**
   * Clear all storage (for testing)
   */
  async clearAll(): Promise<void> {
    await AsyncStorage.clear();
    console.log('🗑️ All storage cleared');
  }
}

export const offlineStorage = new OfflineStorageService();
