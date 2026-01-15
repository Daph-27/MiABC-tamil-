import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert, ActivityIndicator } from 'react-native';
import { theme } from '../styles/theme';
import { useUser } from '../state/UserContext';
import { useNavigation } from '@react-navigation/native';
import apiService from '../services/apiService';

interface Option {
    id: string;
    text: string;
    isCorrect: boolean;
}

interface Question {
    id: string;
    text: string;
    options: Option[];
}

interface QuizData {
    moduleId: string;
    passingScore: number;
    questions: Question[];
}

interface QuizModalProps {
    visible: boolean;
    onClose: () => void;
    quizData: QuizData;
}

export const QuizModal: React.FC<QuizModalProps> = ({ visible, onClose, quizData }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [saving, setSaving] = useState(false);
    const { updateScore } = useUser();
    const navigation = useNavigation();

    const handleAnswer = (isCorrect: boolean) => {
        if (isCorrect) {
            setScore(prev => prev + 1);
        }

        if (currentQuestionIndex < quizData.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            finishQuiz(isCorrect ? score + 1 : score);
        }
    };

    const finishQuiz = async (finalScoreRaw: number) => {
        const totalQuestions = quizData.questions.length;
        const finalPercentage = (finalScoreRaw / totalQuestions) * 100;
        const passed = finalPercentage >= quizData.passingScore;

        console.log(`📊 Quiz completed! Score: ${finalScoreRaw}/${totalQuestions} = ${finalPercentage}%`);
        
        // Show result screen immediately
        setShowResult(true);
        setSaving(true);
        
        try {
            // Save to backend database
            console.log(`💾 Saving to database: moduleId=${quizData.moduleId}, score=${Math.round(finalPercentage)}, passed=${passed}`);
            const result = await apiService.updateProgress(quizData.moduleId, Math.round(finalPercentage), passed);
            console.log('✅ Quiz result saved to database successfully!', result);
            
            // Update local state
            updateScore(quizData.moduleId, finalPercentage);
            console.log('✅ Local state updated');
            
        } catch (error) {
            console.error('❌ Failed to save quiz result:', error);
            Alert.alert('Warning', 'Quiz completed but results could not be saved to server. Please check your connection.');
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        setShowResult(false);
        setCurrentQuestionIndex(0);
        setScore(0);
        onClose();
        // Navigate back to Home if passed, or stay to retry? 
        // For now, just close modal.
    };

    if (!visible) return null;

    if (showResult) {
        const passed = (score / quizData.questions.length) * 100 >= quizData.passingScore;
        const finalPercentage = Math.round((score / quizData.questions.length) * 100);
        
        return (
            <Modal animationType="slide" transparent={false} visible={visible}>
                <View style={styles.resultContainer}>
                    {saving ? (
                        <View style={styles.savingContainer}>
                            <ActivityIndicator size="large" color={theme.colors.primary} />
                            <Text style={styles.savingText}>Saving your results...</Text>
                        </View>
                    ) : (
                        <>
                            <Text style={styles.resultTitle}>
                                {passed ? '🎉 Congratulations!' : '📚 Keep Learning!'}
                            </Text>
                            <Text style={styles.scoreText}>
                                You scored {finalPercentage}%
                            </Text>
                            <Text style={styles.scoreBreakdown}>
                                {score} out of {quizData.questions.length} correct
                            </Text>
                            <Text style={styles.resultMessage}>
                                {passed
                                    ? 'Great job! You have passed this module.'
                                    : `You need ${quizData.passingScore}% to pass. Try again!`}
                            </Text>
                            <TouchableOpacity 
                                style={[styles.resultButton, passed ? styles.passButton : styles.retryButton]} 
                                onPress={handleClose}
                            >
                                <Text style={styles.resultButtonText}>
                                    {passed ? 'Continue' : 'Try Again'}
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </Modal>
        );
    }

    const question = quizData.questions[currentQuestionIndex];

    return (
        <Modal animationType="slide" transparent={false} visible={visible}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.progress}>
                        Question {currentQuestionIndex + 1} / {quizData.questions.length}
                    </Text>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={styles.closeText}>Exit</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.questionText}>{question.text}</Text>

                <View style={styles.optionsContainer}>
                    {question.options.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={styles.optionButton}
                            onPress={() => handleAnswer(option.isCorrect)}
                        >
                            <Text style={styles.optionText}>{option.text}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
    },
    resultContainer: {
        flex: 1,
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    savingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    savingText: {
        marginTop: 20,
        fontSize: 18,
        color: theme.colors.text,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.xl,
        marginTop: theme.spacing.xl,
    },
    progress: {
        ...theme.typography.body,
        color: theme.colors.text,
        fontSize: 16,
    },
    closeText: {
        ...theme.typography.body,
        color: theme.colors.error,
        fontWeight: 'bold',
        fontSize: 16,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.primary,
        textAlign: 'center',
        marginBottom: theme.spacing.md,
    },
    resultTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.primary,
        textAlign: 'center',
        marginBottom: 20,
    },
    questionText: {
        ...theme.typography.h2,
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
        fontSize: 20,
    },
    optionsContainer: {
        gap: theme.spacing.md,
    },
    optionButton: {
        backgroundColor: theme.colors.card,
        padding: theme.spacing.md,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        alignItems: 'center',
        minHeight: 60,
        justifyContent: 'center',
    },
    optionText: {
        ...theme.typography.body,
        color: theme.colors.text,
        fontSize: 20,
        fontWeight: '600',
    },
    scoreText: {
        fontSize: 48,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#4CAF50',
    },
    scoreBreakdown: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
        color: theme.colors.text,
    },
    resultMessage: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 40,
        color: theme.colors.text,
        paddingHorizontal: 20,
    },
    resultButton: {
        paddingVertical: 16,
        paddingHorizontal: 60,
        borderRadius: 30,
        minWidth: 200,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    passButton: {
        backgroundColor: '#4CAF50',
    },
    retryButton: {
        backgroundColor: '#FF9800',
    },
    resultButtonText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    subText: {
        ...theme.typography.body,
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
        color: theme.colors.text,
    },
    button: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.md,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        ...theme.typography.body,
        color: theme.colors.white,
        fontWeight: 'bold',
    }
});
