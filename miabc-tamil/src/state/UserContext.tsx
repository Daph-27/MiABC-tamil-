import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, userService, UserProfile, contentService } from '../services/firebaseService';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { hybridStorage } from '../services/hybridStorage';
import { subscribeToConnectivity } from '../utils/connectivity';

const USER_KEY = '@miabc_user_data';

// Define the progress shape (Aligned with Firestore schema)
interface ModuleProgress {
    unlocked: boolean;
    score: number; // 0-100
    passed: boolean;
    completedAt?: string; // ISO timestamp
}

// Define user data shape
export interface UserData {
    userId?: number;
    username: string;
    learnerName?: string;
    guardianName?: string;
    guardianEmail?: string;
    guardianPhone?: string;
    accessCode?: string;
    learnerAge?: number;
    learnerGrade?: string;
    parentalLock?: string;
    congratulationPhrase?: string;
    profilePicture?: string;
}

interface UserContextType {
    user: UserData | null;
    firebaseUser: FirebaseUser | null;
    userProfile: UserProfile | null;
    setUser: (userData: UserData | null) => void;
    updateUser: (userData: Partial<UserData>) => void;
    progress: Record<string, ModuleProgress>;
    unlockModule: (moduleId: string) => void;
    updateScore: (moduleId: string, score: number) => void;
    isUnlocked: (moduleId: string) => boolean;
    refreshProgress: () => Promise<void>;
}

// Default progress using correct module IDs from Firestore schema
const defaultProgress: Record<string, ModuleProgress> = {
    '01_alphabet': { unlocked: true, score: 0, passed: false }, // First one always open
    '02_sounds': { unlocked: false, score: 0, passed: false },
    '03_mathematics': { unlocked: false, score: 0, passed: false },
    '04_family': { unlocked: false, score: 0, passed: false },
    '05_write': { unlocked: false, score: 0, passed: false },
    '06_i_know_how_to_read': { unlocked: false, score: 0, passed: false },
    '07_complete': { unlocked: false, score: 0, passed: false },
    '08_words': { unlocked: false, score: 0, passed: false },
    '09_festivals': { unlocked: false, score: 0, passed: false },
    '10_colors': { unlocked: false, score: 0, passed: false },
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUserState] = useState<UserData | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [progress, setProgress] = useState<Record<string, ModuleProgress>>(defaultProgress);
    const [isOnline, setIsOnline] = useState(true);

    // Load user data from AsyncStorage on mount
    useEffect(() => {
        loadUserData();
    }, []);

    // Monitor connectivity status
    useEffect(() => {
        const unsubscribe = subscribeToConnectivity((connected) => {
            console.log('🌐 Connectivity changed:', connected ? 'ONLINE' : 'OFFLINE');
            setIsOnline(connected);
            
            // When coming back online, sync pending changes (only if Firebase is available)
            if (connected && firebaseUser && auth) {
                console.log('📤 Back online, syncing...');
                hybridStorage.syncPendingChanges(userService);
                refreshProgress();
            }
        });

        return () => unsubscribe();
    }, [firebaseUser]);

    // Listen to Firebase auth state changes
    useEffect(() => {
        // Only set up Firebase auth listener if Firebase is configured
        if (!auth) {
            console.log('ℹ️ Firebase auth not available - skipping auth listener');
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setFirebaseUser(firebaseUser);
            
            if (firebaseUser) {
                // Fetch user profile from Firestore
                await refreshProgress();
            } else {
                // User signed out
                setUserProfile(null);
                setProgress(defaultProgress);
            }
        });

        return () => unsubscribe();
    }, []);

    const loadUserData = async () => {
        try {
            const userData = await AsyncStorage.getItem(USER_KEY);
            if (userData) {
                setUserState(JSON.parse(userData));
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const refreshProgress = async () => {
        if (!firebaseUser) return;

        try {
            const profile = await userService.getUserProfile(firebaseUser.uid);
            if (profile) {
                setUserProfile(profile);
                setProgress(profile.progress || defaultProgress);
            }
        } catch (error) {
            console.error('Error refreshing progress:', error);
        }
    };

    const setUser = async (userData: UserData | null) => {
        setUserState(userData);
        try {
            if (userData) {
                await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
            } else {
                await AsyncStorage.removeItem(USER_KEY);
            }
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    };

    const updateUser = async (userData: Partial<UserData>) => {
        const updatedUser = { ...user, ...userData } as UserData;
        await setUser(updatedUser);
    };

    const unlockModule = async (moduleId: string) => {
        if (!firebaseUser) {
            // Offline mode - update local state only
            setProgress(prev => ({
                ...prev,
                [moduleId]: { ...prev[moduleId], unlocked: true }
            }));
            return;
        }

        try {
            await userService.unlockModule(firebaseUser.uid, moduleId);
            await refreshProgress();
        } catch (error) {
            console.error('Error unlocking module:', error);
            // Fallback to local update
            setProgress(prev => ({
                ...prev,
                [moduleId]: { ...prev[moduleId], unlocked: true }
            }));
        }
    };

    const updateScore = async (moduleId: string, score: number) => {
        const isPassed = score >= 80;

        // Use hybrid storage to save locally and sync to Firebase when online
        if (firebaseUser) {
            try {
                await hybridStorage.updateUserProgress(
                    firebaseUser.uid,
                    moduleId,
                    score,
                    isPassed,
                    userService
                );
                
                // If passed, unlock next module
                if (isPassed) {
                    const nextModule = getNextModule(moduleId);
                    if (nextModule) {
                        await userService.unlockModule(firebaseUser.uid, nextModule);
                    }
                }
                
                await refreshProgress();
            } catch (error) {
                console.error('Error updating score:', error);
                // Fallback to local update
                setProgress(prev => ({
                    ...prev,
                    [moduleId]: { ...prev[moduleId], score, passed: isPassed, completedAt: new Date().toISOString() }
                }));
            }
        } else {
            // No Firebase user - local only
            setProgress(prev => ({
                ...prev,
                [moduleId]: { ...prev[moduleId], score, passed: isPassed, completedAt: new Date().toISOString() }
            }));
        }
    };

    const isUnlocked = (moduleId: string) => {
        // If it's the first module, it's always unlocked
        if (moduleId === '01_alphabet') return true;

        // Check if it's explicitly unlocked
        if (progress[moduleId]?.unlocked) return true;

        // Check Previous Module Logic (Sequential Gating)
        const modules = [
            '01_alphabet',
            '02_sounds',
            '03_mathematics',
            '04_family',
            '05_write',
            '06_i_know_how_to_read',
            '07_complete',
            '08_words',
            '09_festivals',
            '10_colors'
        ];
        const index = modules.indexOf(moduleId);
        if (index > 0) {
            const prevModule = modules[index - 1];
            const prevData = progress[prevModule];
            // Unlock if previous is passed
            return prevData?.passed || false;
        }
        return false;
    };

    const getNextModule = (currentModuleId: string): string | null => {
        const modules = [
            '01_alphabet',
            '02_sounds',
            '03_mathematics',
            '04_family',
            '05_write',
            '06_i_know_how_to_read',
            '07_complete',
            '08_words',
            '09_festivals',
            '10_colors'
        ];
        const currentIndex = modules.indexOf(currentModuleId);
        if (currentIndex >= 0 && currentIndex < modules.length - 1) {
            return modules[currentIndex + 1];
        }
        return null;
    };

    return (
        <UserContext.Provider value={{
            user,
            firebaseUser,
            userProfile,
            setUser,
            updateUser,
            progress,
            unlockModule,
            updateScore,
            isUnlocked,
            refreshProgress
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within a UserProvider');
    return context;
};
