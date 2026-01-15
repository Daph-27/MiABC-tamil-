import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  where,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import {
  initializeAuth,
  getReactNativePersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
  Auth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration for miabc-tamil project
// Get these values from: Firebase Console → Project Settings → General → Your apps
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_FROM_FIREBASE_CONSOLE",
  authDomain: "miabc-tamil.firebaseapp.com",
  projectId: "miabc-tamil",
  storageBucket: "miabc-tamil.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Check if Firebase is configured
const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_FROM_FIREBASE_CONSOLE";

// Initialize Firebase (optional - app works without it)
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
      console.log('✅ Firebase initialized successfully');
    } else {
      app = getApps()[0];
      db = getFirestore(app);
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
    }
  } catch (error) {
    console.warn('⚠️ Firebase initialization failed:', error);
    console.log('📱 App will work in offline mode with backend API only');
  }
} else {
  console.log('ℹ️ Firebase not configured - using backend API only');
}

export { db, auth };

// ============================================================================
// TYPE DEFINITIONS (Based on CTO Schema)
// ============================================================================

export interface ModuleItem {
  type: string;
  content: string;
  audioUrl?: string;
}

export interface Module {
  id: string;
  title: string;
  tabs: string[];
  items: ModuleItem[];
  validated: boolean;
}

export interface QuizQuestion {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
}

export interface Quiz {
  moduleId: string;
  title: string;
  passingScore: number;
  validated: boolean;
  questions: QuizQuestion[];
}

export interface ModuleProgress {
  unlocked: boolean;
  score: number;
  passed: boolean;
  completedAt?: string; // ISO timestamp
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: string; // ISO timestamp
  progress: Record<string, ModuleProgress>;
}

// ============================================================================
// CONTENT SERVICE (Read-only)
// ============================================================================

class ContentService {
  /**
   * Fetch a module by ID
   * @param moduleId - e.g., "01_alphabet"
   */
  async getModule(moduleId: string): Promise<Module | null> {
    if (!db) {
      console.warn('Firebase not available');
      return null;
    }
    try {
      const docRef = doc(db, 'content', `module_${moduleId}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as Module;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching module ${moduleId}:`, error);
      return null;
    }
  }

  /**
   * Fetch all modules
   */
  async getAllModules(): Promise<Module[]> {
    if (!db) {
      console.warn('Firebase not available');
      return [];
    }
    try {
      const modulesRef = collection(db, 'content');
      const q = query(modulesRef, where('tabs', '!=', null)); // Filter modules (they have 'tabs')
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => doc.data() as Module);
    } catch (error) {
      console.error('Error fetching all modules:', error);
      return [];
    }
  }

  /**
   * Fetch a quiz by module ID
   * @param moduleId - e.g., "01_alphabet"
   */
  async getQuiz(moduleId: string): Promise<Quiz | null> {
    if (!db) {
      console.warn('Firebase not available');
      return null;
    }
    try {
      const docRef = doc(db, 'content', `quiz_${moduleId}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as Quiz;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching quiz for ${moduleId}:`, error);
      return null;
    }
  }
}

// ============================================================================
// USER SERVICE
// ============================================================================

class UserService {
  /**
   * Create a new user profile in Firestore after authentication
   */
  async createUserProfile(
    uid: string,
    email: string,
    displayName?: string
  ): Promise<void> {
    if (!db) {
      console.warn('Firebase not available - cannot create user profile');
      return;
    }
    try {
      const userRef = doc(db, 'users', uid);
      
      const initialProgress: Record<string, ModuleProgress> = {
        '01_alphabet': {
          unlocked: true,
          score: 0,
          passed: false,
        },
        '02_sounds': {
          unlocked: false,
          score: 0,
          passed: false,
        },
        '03_mathematics': {
          unlocked: false,
          score: 0,
          passed: false,
        },
        '04_family': {
          unlocked: false,
          score: 0,
          passed: false,
        },
        '05_write': {
          unlocked: false,
          score: 0,
          passed: false,
        },
        '06_i_know_how_to_read': {
          unlocked: false,
          score: 0,
          passed: false,
        },
        '07_complete': {
          unlocked: false,
          score: 0,
          passed: false,
        },
        '08_words': {
          unlocked: false,
          score: 0,
          passed: false,
        },
        '09_festivals': {
          unlocked: false,
          score: 0,
          passed: false,
        },
        '10_colors': {
          unlocked: false,
          score: 0,
          passed: false,
        },
      };

      const userProfile: UserProfile = {
        uid,
        email,
        displayName,
        createdAt: new Date().toISOString(),
        progress: initialProgress,
      };

      await setDoc(userRef, userProfile);
      console.log('User profile created successfully');
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  /**
   * Fetch user profile
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {    if (!db) {
      console.warn('Firebase not available - cannot get user profile');
      return null;
    }    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Update module progress
   */
  async updateModuleProgress(
    uid: string,
    moduleId: string,
    score: number,
    passed: boolean
  ): Promise<void> {
    if (!db) {
      console.warn('Firebase not available - cannot update module progress');
      return;
    }
    try {
      const userRef = doc(db, 'users', uid);
      const progressUpdate: Partial<ModuleProgress> = {
        score,
        passed,
      };

      if (passed) {
        progressUpdate.completedAt = new Date().toISOString();
      }

      await updateDoc(userRef, {
        [`progress.${moduleId}`]: progressUpdate,
      });

      console.log(`Updated progress for ${moduleId}`);
    } catch (error) {
      console.error('Error updating module progress:', error);
      throw error;
    }
  }

  /**
   * Unlock a module
   */
  async unlockModule(uid: string, moduleId: string): Promise<void> {
    if (!db) {
      console.warn('Firebase not available - cannot unlock module');
      return;
    }
    try {
      const userRef = doc(db, 'users', uid);
      
      await updateDoc(userRef, {
        [`progress.${moduleId}.unlocked`]: true,
      });

      console.log(`Unlocked module ${moduleId}`);
    } catch (error) {
      console.error('Error unlocking module:', error);
      throw error;
    }
  }

  /**
   * Check if a module is unlocked
   */
  async isModuleUnlocked(uid: string, moduleId: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile(uid);
      return profile?.progress[moduleId]?.unlocked ?? false;
    } catch (error) {
      console.error('Error checking module unlock status:', error);
      return false;
    }
  }
}

// ============================================================================
// AUTH SERVICE
// ============================================================================

class AuthService {
  /**
   * Register a new user
   */
  async register(
    email: string,
    password: string,
    displayName?: string
  ): Promise<User> {
    if (!auth) {
      throw new Error('Firebase auth not available - cannot register users');
    }
    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Create Firestore user profile
      await userService.createUserProfile(
        userCredential.user.uid,
        email,
        displayName
      );

      return userCredential.user;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<User> {
    if (!auth) {
      throw new Error('Firebase auth not available - cannot login users');
    }
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    if (!auth) {
      console.warn('Firebase auth not available - no logout needed');
      return;
    }
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Logout failed');
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  }
}

// Export service instances
export const contentService = new ContentService();
export const userService = new UserService();
export const authService = new AuthService();
