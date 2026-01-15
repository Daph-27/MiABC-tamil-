import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, FlatList, Dimensions } from 'react-native';
import { Audio } from 'expo-av';
import { theme } from '../styles/theme';
import { QuizModal } from '../components/QuizModal';
import { useUser } from '../state/UserContext';
import axios from 'axios';

const MODULE_ID = '01_alphabet';
// Use 10.0.2.2 for Android emulator to access localhost
const API_URL = 'http://127.0.0.1:8000/api/v1/content';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

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
  const { updateModuleProgress } = useUser();
  const [quizVisible, setQuizVisible] = useState(false);
  const [vowels, setVowels] = useState<any[]>([]);
  const [consonants, setConsonants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'Vowels' | 'Consonants'>('Vowels');
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    loadContent();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch module content from backend API
      const response = await axios.get(`${API_URL}/modules/${MODULE_ID}`);
      const data = response.data;
      
      console.log('Module data:', data);
      
      if (data && data.items) {
        const vowelItems = data.items.filter((item: any) => item.type === 'vowel');
        const consonantItems = data.items.filter((item: any) => item.type === 'consonant');
        
        setVowels(vowelItems);
        setConsonants(consonantItems);
        
        console.log('Loaded vowels:', vowelItems.length);
        console.log('Loaded consonants:', consonantItems.length);
      } else {
        setError('No content available');
      }
    } catch (error: any) {
      console.error('Failed to load content:', error);
      setError(error.response?.data?.detail || error.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async (audioPath: string | null) => {
    if (!audioPath) {
      console.log('No audio path provided');
      return;
    }

    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: `file://${audioPath}` },
        { shouldPlay: true }
      );
      setSound(newSound);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
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
        onPress={() => setQuizVisible(true)}
      >
        <Text style={styles.quizButtonText}>Take Module Quiz</Text>
      </TouchableOpacity>

      <QuizModal
        visible={quizVisible}
        onClose={() => setQuizVisible(false)}
        quizData={DUMMY_QUIZ_DATA}
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