import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the progress shape
interface ModuleProgress {
    unlocked: boolean;
    score: number; // 0-100
    passed: boolean;
}

interface UserContextType {
    progress: Record<string, ModuleProgress>;
    unlockModule: (moduleId: string) => void;
    updateScore: (moduleId: string, score: number) => void;
    isUnlocked: (moduleId: string) => boolean;
}

const defaultProgress: Record<string, ModuleProgress> = {
    'Alphabet': { unlocked: true, score: 0, passed: false }, // First one always open
    // Others locked by default
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [progress, setProgress] = useState<Record<string, ModuleProgress>>(defaultProgress);

    // In a real app, load from Firestore/AsyncStorage here
    useEffect(() => {
        // Simulated load
        console.log('Loading user progress...');
    }, []);

    const unlockModule = (moduleId: string) => {
        setProgress(prev => ({
            ...prev,
            [moduleId]: { ...prev[moduleId], unlocked: true }
        }));
    };

    const updateScore = (moduleId: string, score: number) => {
        setProgress(prev => {
            const isPassed = score >= 80;
            return {
                ...prev,
                [moduleId]: { ...prev[moduleId], score, passed: isPassed }
            };
        });
    };

    const isUnlocked = (moduleId: string) => {
        // If it's the first module, it's always unlocked
        if (moduleId === 'Alphabet') return true;

        // Check if it's explicitly unlocked
        if (progress[moduleId]?.unlocked) return true;

        // Check Previous Module Logic (Sequential Gating)
        // This is a simplified map. Real logic needs the ordered list.
        const modules = ['Alphabet', 'Sounds', 'Mathematics', 'Family', 'Write', 'Read', 'Complete', 'Words', 'Festivals', 'Colors'];
        const index = modules.indexOf(moduleId);
        if (index > 0) {
            const prevModule = modules[index - 1];
            const prevData = progress[prevModule];
            // Unlock if previous is passed
            return prevData?.passed || false;
        }
        return false;
    };

    return (
        <UserContext.Provider value={{ progress, unlockModule, updateScore, isUnlocked }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within a UserProvider');
    return context;
};
