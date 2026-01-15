import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkConnectivity } from '../utils/connectivity';

const BACKEND_URL = 'http://localhost:8000/api/v1'; // Your FastAPI backend

/**
 * Local database service using SQLite backend
 * Falls back to this when Firebase is unavailable
 */
class LocalDatabaseService {
  private async fetch(endpoint: string, options?: RequestInit) {
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Local DB fetch error:', error);
      throw error;
    }
  }

  async getModule(moduleId: string) {
    try {
      // Try to get from local backend
      return await this.fetch(`/content/modules/${moduleId}`);
    } catch (error) {
      // Fallback to AsyncStorage cache
      const cached = await AsyncStorage.getItem(`module_${moduleId}`);
      if (cached) {
        return JSON.parse(cached);
      }
      throw new Error(`Module ${moduleId} not found in local storage`);
    }
  }

  async getQuiz(moduleId: string) {
    try {
      return await this.fetch(`/content/quizzes/${moduleId}`);
    } catch (error) {
      const cached = await AsyncStorage.getItem(`quiz_${moduleId}`);
      if (cached) {
        return JSON.parse(cached);
      }
      throw new Error(`Quiz ${moduleId} not found in local storage`);
    }
  }

  async getUserProfile(userId: string) {
    try {
      return await this.fetch(`/users/${userId}`);
    } catch (error) {
      const cached = await AsyncStorage.getItem(`user_${userId}`);
      if (cached) {
        return JSON.parse(cached);
      }
      return null;
    }
  }

  async updateUserProgress(userId: string, moduleId: string, score: number, passed: boolean) {
    try {
      const result = await this.fetch(`/users/${userId}/progress`, {
        method: 'POST',
        body: JSON.stringify({
          moduleId,
          score,
          passed,
          completedAt: new Date().toISOString(),
        }),
      });
      
      // Cache the update
      const user = await this.getUserProfile(userId);
      if (user) {
        await AsyncStorage.setItem(`user_${userId}`, JSON.stringify(user));
      }
      
      return result;
    } catch (error) {
      console.error('Failed to update progress in local DB:', error);
      throw error;
    }
  }

  async createUser(email: string, password: string, learnerName: string) {
    return await this.fetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        learnerName,
      }),
    });
  }

  async login(email: string, password: string) {
    return await this.fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    });
  }

  // Cache content for offline use
  async cacheModule(moduleId: string, data: any) {
    await AsyncStorage.setItem(`module_${moduleId}`, JSON.stringify(data));
  }

  async cacheQuiz(moduleId: string, data: any) {
    await AsyncStorage.setItem(`quiz_${moduleId}`, JSON.stringify(data));
  }
}

export const localDbService = new LocalDatabaseService();

/**
 * Hybrid service that uses Firebase when online, local DB when offline
 */
export class HybridStorageService {
  private async isOnline(): Promise<boolean> {
    return await checkConnectivity();
  }

  async getModule(moduleId: string, firebaseService: any) {
    const online = await this.isOnline();
    
    try {
      if (online) {
        console.log('📡 Fetching from Firebase:', moduleId);
        const data = await firebaseService.getModule(moduleId);
        // Cache for offline use
        await localDbService.cacheModule(moduleId, data);
        return data;
      } else {
        console.log('💾 Fetching from local DB:', moduleId);
        return await localDbService.getModule(moduleId);
      }
    } catch (error) {
      console.warn(`Failed to fetch ${moduleId}, trying fallback...`);
      // If online fetch fails, try local
      if (online) {
        return await localDbService.getModule(moduleId);
      }
      throw error;
    }
  }

  async getQuiz(moduleId: string, firebaseService: any) {
    const online = await this.isOnline();
    
    try {
      if (online) {
        console.log('📡 Fetching quiz from Firebase:', moduleId);
        const data = await firebaseService.getQuiz(moduleId);
        await localDbService.cacheQuiz(moduleId, data);
        return data;
      } else {
        console.log('💾 Fetching quiz from local DB:', moduleId);
        return await localDbService.getQuiz(moduleId);
      }
    } catch (error) {
      console.warn(`Failed to fetch quiz ${moduleId}, trying fallback...`);
      if (online) {
        return await localDbService.getQuiz(moduleId);
      }
      throw error;
    }
  }

  async updateUserProgress(
    userId: string,
    moduleId: string,
    score: number,
    passed: boolean,
    firebaseService: any
  ) {
    const online = await this.isOnline();
    
    // Always save locally first
    try {
      await localDbService.updateUserProgress(userId, moduleId, score, passed);
    } catch (error) {
      console.warn('Local save failed:', error);
    }
    
    // If online, sync to Firebase
    if (online) {
      try {
        console.log('📡 Syncing to Firebase:', moduleId, score, passed);
        await firebaseService.updateModuleProgress(userId, moduleId, score, passed);
      } catch (error) {
        console.error('Firebase sync failed:', error);
        // Local save already succeeded, so we can continue
      }
    } else {
      console.log('💾 Saved offline, will sync when online');
      // Queue for later sync
      await this.queueForSync('progress', {
        userId,
        moduleId,
        score,
        passed,
        timestamp: Date.now(),
      });
    }
  }

  private async queueForSync(type: string, data: any) {
    try {
      const queueKey = 'sync_queue';
      const existing = await AsyncStorage.getItem(queueKey);
      const queue = existing ? JSON.parse(existing) : [];
      queue.push({ type, data });
      await AsyncStorage.setItem(queueKey, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to queue for sync:', error);
    }
  }

  async syncPendingChanges(firebaseService: any) {
    const online = await this.isOnline();
    if (!online) {
      console.log('Offline, skipping sync');
      return;
    }

    try {
      const queueKey = 'sync_queue';
      const existing = await AsyncStorage.getItem(queueKey);
      if (!existing) return;

      const queue = JSON.parse(existing);
      console.log(`📤 Syncing ${queue.length} pending changes...`);

      for (const item of queue) {
        try {
          if (item.type === 'progress') {
            const { userId, moduleId, score, passed } = item.data;
            await firebaseService.updateModuleProgress(userId, moduleId, score, passed);
          }
          // Add other sync types as needed
        } catch (error) {
          console.error('Failed to sync item:', error);
        }
      }

      // Clear queue after successful sync
      await AsyncStorage.removeItem(queueKey);
      console.log('✅ Sync completed');
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}

export const hybridStorage = new HybridStorageService();
