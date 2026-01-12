import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { theme } from '../styles/theme';
import { useUser } from '../state/UserContext';
import { useNavigation } from '@react-navigation/native';

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

    const finishQuiz = (finalScoreRaw: number) => {
        const totalQuestions = quizData.questions.length;
        const finalPercentage = (finalScoreRaw / totalQuestions) * 100;

        // Update Global State
        updateScore(quizData.moduleId, finalPercentage);

        setShowResult(true);
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
        return (
            <Modal animationType="slide" transparent={false} visible={visible}>
                <View style={styles.container}>
                    <Text style={styles.title}>{passed ? '🎉 Congratulations!' : 'Try Again'}</Text>
                    <Text style={styles.scoreText}>
                        You scored {Math.round((score / quizData.questions.length) * 100)}%
                    </Text>
                    <Text style={styles.subText}>
                        {passed
                            ? 'You have unlocked the next module!'
                            : `You need ${quizData.passingScore}% to pass.`}
                    </Text>
                    <TouchableOpacity style={styles.button} onPress={handleClose}>
                        <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.xl,
        marginTop: theme.spacing.xl, // Safe area approx
    },
    progress: {
        ...theme.typography.body,
        color: theme.colors.text,
    },
    closeText: {
        ...theme.typography.body,
        color: theme.colors.error,
        fontWeight: 'bold',
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.primary,
        textAlign: 'center',
        marginBottom: theme.spacing.md,
    },
    questionText: {
        ...theme.typography.h2,
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
    },
    optionsContainer: {
        gap: theme.spacing.md,
    },
    optionButton: {
        backgroundColor: theme.colors.card,
        padding: theme.spacing.md,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        alignItems: 'center',
    },
    optionText: {
        ...theme.typography.body,
        color: theme.colors.text,
        fontSize: 18,
    },
    scoreText: {
        ...theme.typography.h2,
        textAlign: 'center',
        marginBottom: theme.spacing.sm,
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
