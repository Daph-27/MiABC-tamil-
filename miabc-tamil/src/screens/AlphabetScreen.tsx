import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, FlatList, Dimensions, Alert } from 'react-native';
import { theme } from '../styles/theme';
import { QuizModal } from '../components/QuizModal';
import { useUser } from '../state/UserContext';
import apiService from '../services/apiService';

const MODULE_ID = '01';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

// Helper function to generate quiz questions from module data
const generateQuizQuestions = (vowels: any[], consonants: any[]) => {
  const questions: any[] = [];
  
  // Question 1: Identify first vowel
  if (vowels.length > 0) {
    const correctVowel = vowels[0];
    const wrongOptions = vowels.slice(1, 3).concat(consonants.slice(0, 1));
    questions.push({
      id: 'q1',
      text: 'Which is the first vowel in Tamil?',
      options: [
        { id: 'o1', text: `${correctVowel.character} (${correctVowel.romanization})`, isCorrect: true },
        { id: 'o2', text: `${wrongOptions[0]?.character} (${wrongOptions[0]?.romanization})`, isCorrect: false },
        { id: 'o3', text: `${wrongOptions[1]?.character} (${wrongOptions[1]?.romanization})`, isCorrect: false },
      ]
    });
  }
  
  // Question 2: Count vowels
  questions.push({
    id: 'q2',
    text: 'How many vowels are in the Tamil alphabet?',
    options: [
      { id: 'o1', text: '10', isCorrect: false },
      { id: 'o2', text: '12', isCorrect: true },
      { id: 'o3', text: '18', isCorrect: false },
    ]
  });
  
  // Question 3: Identify a consonant
  if (consonants.length > 2) {
    const correctConsonant = consonants[0];
    const wrongOptions = vowels.slice(0, 2);
    questions.push({
      id: 'q3',
      text: `Which of these is the consonant ${correctConsonant.character}?`,
      options: [
        { id: 'o1', text: `${correctConsonant.character} (${correctConsonant.romanization})`, isCorrect: true },
        { id: 'o2', text: `${wrongOptions[0]?.character} (${wrongOptions[0]?.romanization})`, isCorrect: false },
        { id: 'o3', text: `${wrongOptions[1]?.character} (${wrongOptions[1]?.romanization})`, isCorrect: false },
      ]
    });
  }
  
  // Question 4: Count consonants
  questions.push({
    id: 'q4',
    text: 'How many consonants are in the Tamil alphabet?',
    options: [
      { id: 'o1', text: '12', isCorrect: false },
      { id: 'o2', text: '18', isCorrect: true },
      { id: 'o3', text: '24', isCorrect: false },
    ]
  });
  
  // Question 5: Identify vowel by romanization
  if (vowels.length > 3) {
    const correctVowel = vowels[2];
    const wrongOptions = [vowels[1], vowels[3], consonants[0]];
    questions.push({
      id: 'q5',
      text: `Which Tamil letter is pronounced "${correctVowel.romanization}"?`,
      options: [
        { id: 'o1', text: correctVowel.character, isCorrect: true },
        { id: 'o2', text: wrongOptions[0]?.character, isCorrect: false },
        { id: 'o3', text: wrongOptions[1]?.character, isCorrect: false },
      ]
    });
  }
  
  return questions;
};

export const AlphabetScreen = () => {
  const { updateModuleProgress } = useUser();
  const [quizVisible, setQuizVisible] = useState(false);
  const [vowels, setVowels] = useState<any[]>([]);
  const [consonants, setConsonants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'Vowels' | 'Consonants'>('Vowels');

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📱 Loading alphabet module:', MODULE_ID);
      
      // Fetch module content using apiService (supports offline mode)
      const data = await apiService.getModuleContent(MODULE_ID);
      
      console.log('Module data loaded:', data);
      
      if (data && data.items) {
        const vowelItems = data.items.filter((item: any) => item.type === 'vowel');
        const consonantItems = data.items.filter((item: any) => item.type === 'consonant');
        
        setVowels(vowelItems);
        setConsonants(consonantItems);
        
        console.log('✅ Loaded vowels:', vowelItems.length);
        console.log('✅ Loaded consonants:', consonantItems.length);
      } else {
        setError('No content available');
      }
    } catch (error: any) {
      console.error('❌ Failed to load content:', error);
      setError(error.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async (audioPath: string | null) => {
    if (!audioPath) {
      console.log('No audio path provided');
      return;
    }

    // Audio playback will be implemented with react-native-sound later
    console.log('Playing audio:', audioPath);
    Alert.alert('Audio', 'Audio playback coming soon!');
  };

  const renderLetterCard = ({ item, index }: { item: any; index: number }) => {
    const colors = [
      { top: '#FF6B9D', bottom: '#C73866' }, // Pink
      { top: '#4ECDC4', bottom: '#2FA39B' }, // Teal
      { top: '#A78BFA', bottom: '#7C3AED' }, // Purple
      { top: '#FFA07A', bottom: '#FF6347' }, // Coral
      { top: '#FFD93D', bottom: '#FFC300' }, // Yellow
      { top: '#6BCB77', bottom: '#4D9559' }, // Green
    ];
    
    const colorIndex = index % colors.length;
    const colorScheme = colors[colorIndex];

    return (
      <View style={styles.cardWrapper}>
        <TouchableOpacity
          style={styles.letterCard}
          onPress={() => playAudio(item.audioPath)}
          activeOpacity={0.8}
        >
          <View style={[styles.cardTop, { backgroundColor: colorScheme.top }]}>
            <Text style={styles.tamilLetter}>{item.character}</Text>
          </View>
          
          <View style={[styles.cardBottom, { backgroundColor: colorScheme.bottom }]}>
            <Text style={styles.romanization}>{item.romanization}</Text>
            <View style={styles.audioButtons}>
              <View style={styles.audioIcon}>
                <Text style={styles.audioIconText}>🔊</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
        {item.example && (
          <Text style={styles.exampleText} numberOfLines={1}>
            {item.example}
          </Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading alphabet...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>❌ {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadContent}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentItems = activeTab === 'Vowels' ? vowels : consonants;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>அகரவரிசை</Text>
        <Text style={styles.subtitle}>Alphabet</Text>
      </View>

      {/* Three-tab switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Vowels' && styles.activeTab]}
          onPress={() => setActiveTab('Vowels')}
        >
          <Text style={[styles.tabText, activeTab === 'Vowels' && styles.activeTabText]}>
            உயிரெழுத்துக்கள்
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Consonants' && styles.activeTab]}
          onPress={() => setActiveTab('Consonants')}
        >
          <Text style={[styles.tabText, activeTab === 'Consonants' && styles.activeTabText]}>
            மெய்யெழுத்துக்கள்
          </Text>
        </TouchableOpacity>
      </View>

      {/* Letter Grid */}
      <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
        <FlatList
          data={currentItems}
          renderItem={({ item, index }) => renderLetterCard({ item, index })}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          scrollEnabled={false}
          columnWrapperStyle={styles.row}
        />
      </ScrollView>

      {/* Quiz Button */}
      <TouchableOpacity
        style={styles.quizButton}
        onPress={() => {
          if (vowels.length > 0 && consonants.length > 0) {
            setQuizVisible(true);
          } else {
            Alert.alert('Quiz Not Available', 'Please wait for the module content to load.');
          }
        }}
      >
        <Text style={styles.quizButtonText}>Take Module Quiz</Text>
      </TouchableOpacity>

      <QuizModal
        visible={quizVisible}
        onClose={() => setQuizVisible(false)}
        quizData={{
          moduleId: MODULE_ID,
          passingScore: 80,
          questions: generateQuizQuestions(vowels, consonants)
        }}
        moduleId={MODULE_ID}
        onComplete={(score, passed) => {
          updateModuleProgress(MODULE_ID, score, passed);
          setQuizVisible(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FF1744',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  activeTab: {
    backgroundColor: '#FF1744',
    borderBottomWidth: 4,
    borderBottomColor: '#D50000',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  contentArea: {
    flex: 1,
    paddingTop: 16,
  },
  gridContainer: {
    paddingHorizontal: 12,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  letterCard: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    marginBottom: 8,
  },
  cardTop: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tamilLetter: {
    fontSize: 70,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  cardBottom: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  romanization: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  audioButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  audioIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioIconText: {
    fontSize: 16,
  },
  exampleText: {
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  quizButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#00BFA5',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  quizButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF1744',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});