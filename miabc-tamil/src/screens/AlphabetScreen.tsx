import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../styles/theme';
import { QuizModal } from '../components/QuizModal';

const DUMMY_QUIZ_DATA = {
  moduleId: 'Alphabet',
  passingScore: 80,
  questions: [
    {
      id: 'q1',
      text: 'Which of these is the first letter of the Tamil alphabet?',
      options: [
        { id: 'o1', text: 'அ (A)', isCorrect: true },
        { id: 'o2', text: 'க (Ka)', isCorrect: false },
        { id: 'o3', text: 'ச (Sa)', isCorrect: false },
      ]
    },
    {
      id: 'q2',
      text: 'How many vowels are in Tamil?',
      options: [
        { id: 'o1', text: '5', isCorrect: false },
        { id: 'o2', text: '12', isCorrect: true },
        { id: 'o3', text: '21', isCorrect: false },
      ]
    }
  ]
};

export const AlphabetScreen = () => {
  const [quizVisible, setQuizVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alphabet</Text>
      <Text style={styles.subtitle}>Content coming from Firestore...</Text>

      <View style={styles.contentArea}>
        <Text style={styles.bodyText}>
          Here we will display the Vowels (உயிரெழுத்துக்கள்) and Consonants (மெய்யெழுத்துக்கள்).
        </Text>
      </View>

      <TouchableOpacity
        style={styles.quizButton}
        onPress={() => setQuizVisible(true)}
      >
        <Text style={styles.quizButtonText}>Take Module Quiz</Text>
      </TouchableOpacity>

      <QuizModal
        visible={quizVisible}
        onClose={() => setQuizVisible(false)}
        quizData={DUMMY_QUIZ_DATA}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontStyle: 'italic',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  contentArea: {
    flex: 1,
    justifyContent: 'center',
  },
  bodyText: {
    ...theme.typography.body,
    textAlign: 'center',
    color: theme.colors.text,
  },
  quizButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: 25,
    marginBottom: theme.spacing.xl,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  quizButtonText: {
    ...theme.typography.h2,
    fontSize: 20,
    color: theme.colors.white,
  }
});