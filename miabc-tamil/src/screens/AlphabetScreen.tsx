import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, FlatList, Dimensions, Alert } from 'react-native';
import { theme } from '../styles/theme';
import { QuizModal } from '../components/QuizModal';
import apiService from '../services/apiService';

const MODULE_ID = '01';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

export const AlphabetScreen = () => {
  const [quizVisible, setQuizVisible] = useState(false);
  const [moduleData, setModuleData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'Tamil Vowels' | 'English Vowels' | 'Tamil Consonants' | 'English Consonants' | 'Parallel Sounds'>('Tamil Vowels');
  const [currentWeek, setCurrentWeek] = useState(1);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📱 Loading foundational alphabet module:', MODULE_ID);
      
      // Fetch module content using apiService
      const data = await apiService.getModuleContent(MODULE_ID);
      
      console.log('Module data loaded:', data);
      
      if (data && data.items) {
        setModuleData(data);
        console.log('✅ Loaded foundational alphabet with', data.items.length, 'items');
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

    console.log('Playing audio:', audioPath);
    Alert.alert('Audio', `Playing: ${audioPath}\n\nFull audio implementation coming soon!`);
  };

  const getFilteredItems = () => {
    if (!moduleData || !moduleData.items) return [];
    
    switch (activeTab) {
      case 'Tamil Vowels':
        return moduleData.items.filter((item: any) => item.type === 'tamil_vowel');
      case 'English Vowels':
        return moduleData.items.filter((item: any) => item.type === 'english_vowel');
      case 'Tamil Consonants':
        return moduleData.items.filter((item: any) => item.type === 'tamil_consonant');
      case 'English Consonants':
        return moduleData.items.filter((item: any) => item.type === 'english_consonant');
      case 'Parallel Sounds':
        return moduleData.crossLinguisticBridges || [];
      default:
        return [];
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

    // Handle parallel sounds card differently
    if (activeTab === 'Parallel Sounds') {
      return (
        <View style={styles.parallelCardWrapper}>
          <View style={[styles.parallelCard, { borderColor: colorScheme.top }]}>
            <View style={styles.parallelContent}>
              {item.tamilLetter && (
                <View style={styles.parallelSide}>
                  <Text style={styles.parallelLabel}>Tamil</Text>
                  <Text style={styles.parallelLetter}>{item.tamilLetter}</Text>
                </View>
              )}
              
              {item.tamilLetter && item.englishLetter && (
                <Text style={styles.bridgeIcon}>⟷</Text>
              )}
              
              {item.englishLetter && (
                <View style={styles.parallelSide}>
                  <Text style={styles.parallelLabel}>English</Text>
                  <Text style={styles.parallelLetter}>{item.englishLetter}</Text>
                </View>
              )}
            </View>
            
            {item.sharedSound && (
              <Text style={styles.sharedSound}>{item.sharedSound}</Text>
            )}
            <Text style={styles.teachingNote}>{item.teachingNote}</Text>
            <View style={[styles.typeTag, { backgroundColor: item.type === 'direct_parallel' ? '#4CAF50' : '#FF9800' }]}>
              <Text style={styles.typeTagText}>
                {item.type === 'direct_parallel' ? 'PARALLEL' : item.type === 'tamil_unique' ? 'Tamil Only' : 'English Only'}
              </Text>
            </View>
          </View>
        </View>
      );
    }

    // Regular letter card for vowels and consonants
    const isTamil = item.type?.includes('tamil');
    const displayChar = item.character || item.letter || '?';
    const displayRoman = item.transliteration || item.romanization || item.sound || '';
    const displayExample = item.exampleWord || '';
    const displayMeaning = item.exampleMeaning || item.examplePronunciation || '';

    return (
      <View style={styles.cardWrapper}>
        <TouchableOpacity
          style={styles.letterCard}
          onPress={() => playAudio(item.audioPath)}
          activeOpacity={0.8}
        >
          <View style={[styles.cardTop, { backgroundColor: colorScheme.top }]}>
            <Text style={styles.tamilLetter}>{displayChar}</Text>
            {item.parallelEnglish && (
              <Text style={styles.parallelBadge}>↔ {item.parallelEnglish}</Text>
            )}
            {item.parallelTamil && (
              <Text style={styles.parallelBadge}>↔ {item.parallelTamil}</Text>
            )}
          </View>
          
          <View style={[styles.cardBottom, { backgroundColor: colorScheme.bottom }]}>
            <View style={styles.cardInfo}>
              <Text style={styles.romanization}>{displayRoman}</Text>
              {item.englishSound && (
                <Text style={styles.soundDescription}>{item.englishSound}</Text>
              )}
              {item.description && (
                <Text style={styles.soundDescription}>{item.description}</Text>
              )}
            </View>
            <View style={styles.audioButtons}>
              <View style={styles.audioIcon}>
                <Text style={styles.audioIconText}>🔊</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
        
        {displayExample && (
          <View style={styles.exampleContainer}>
            <Text style={styles.exampleWord}>{displayExample}</Text>
            {displayMeaning && (
              <Text style={styles.exampleMeaning}>{displayMeaning}</Text>
            )}
          </View>
        )}
        
        {item.weekIntroduced && (
          <Text style={styles.weekBadge}>Week {item.weekIntroduced}</Text>
        )}
      </View>
    );
  };

  const renderWeekInfo = () => {
    if (!moduleData || !moduleData.weeks) return null;
    
    const week = moduleData.weeks.find((w: any) => w.weekNumber === currentWeek);
    if (!week) return null;

    return (
      <View style={styles.weekInfoContainer}>
        <Text style={styles.weekTitle}>Week {week.weekNumber}: {week.weekTitle || week.focus}</Text>
        {week.description && (
          <Text style={styles.weekDescription}>{week.description}</Text>
        )}
        {week.days && (
          <View style={styles.daysContainer}>
            {week.days.map((day: any, index: number) => (
              <View key={index} style={styles.dayCard}>
                <Text style={styles.dayNumber}>Day {day.day}</Text>
                <Text style={styles.dayFocus}>{day.focus}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const generateFoundationalQuiz = () => {
    if (!moduleData || !moduleData.items) return [];
    
    const questions: any[] = [];
    const tamilVowels = moduleData.items.filter((i: any) => i.type === 'tamil_vowel');
    const englishVowels = moduleData.items.filter((i: any) => i.type === 'english_vowel');
    const tamilConsonants = moduleData.items.filter((i: any) => i.type === 'tamil_consonant');
    const englishConsonants = moduleData.items.filter((i: any) => i.type === 'english_consonant');
    
    // Question 1: Identify Tamil vowel
    if (tamilVowels.length > 0) {
      const correct = tamilVowels[0];
      questions.push({
        id: 'q1',
        text: `Which is the Tamil vowel that sounds like "a in father"?`,
        options: [
          { id: 'o1', text: `${correct.character} (${correct.romanization})`, isCorrect: true },
          { id: 'o2', text: `${tamilVowels[1]?.character} (${tamilVowels[1]?.romanization})`, isCorrect: false },
          { id: 'o3', text: `${tamilConsonants[0]?.character} (${tamilConsonants[0]?.romanization})`, isCorrect: false },
        ]
      });
    }
    
    // Question 2: Parallel sounds
    if (moduleData.crossLinguisticBridges) {
      questions.push({
        id: 'q2',
        text: 'Which Tamil letter has the same sound as English M?',
        options: [
          { id: 'o1', text: 'ம (ma)', isCorrect: true },
          { id: 'o2', text: 'ப (pa)', isCorrect: false },
          { id: 'o3', text: 'க (ka)', isCorrect: false },
        ]
      });
    }
    
    // Question 3: Count Tamil foundational sounds
    questions.push({
      id: 'q3',
      text: 'How many Tamil foundational sounds (vowels + consonants) should you master first?',
      options: [
        { id: 'o1', text: '8 sounds', isCorrect: false },
        { id: 'o2', text: '11 sounds (3 vowels + 8 consonants)', isCorrect: true },
        { id: 'o3', text: '30 sounds', isCorrect: false },
      ]
    });
    
    // Question 4: English foundational sounds
    questions.push({
      id: 'q4',
      text: 'How many English foundational sounds should you master first?',
      options: [
        { id: 'o1', text: '13 sounds (5 vowels + 8 consonants)', isCorrect: true },
        { id: 'o2', text: '26 letters', isCorrect: false },
        { id: 'o3', text: '10 sounds', isCorrect: false },
      ]
    });
    
    // Question 5: Unique sounds
    questions.push({
      id: 'q5',
      text: 'Which English sound has NO Tamil equivalent at foundational level?',
      options: [
        { id: 'o1', text: 'S (as in sit)', isCorrect: true },
        { id: 'o2', text: 'M (as in mom)', isCorrect: false },
        { id: 'o3', text: 'L (as in lap)', isCorrect: false },
      ]
    });
    
    return questions;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading foundational alphabet...</Text>
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

  const currentItems = getFilteredItems();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>அகரவரிசை / Alphabet</Text>
        <Text style={styles.subtitle}>Foundational Level: Tamil & English</Text>
        <Text style={styles.subtitleSmall}>Master 8-10 core sounds in each language</Text>
      </View>

      {/* Week selector */}
      {moduleData && moduleData.weeks && (
        <View style={styles.weekSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {moduleData.weeks.map((week: any) => (
              <TouchableOpacity
                key={week.weekNumber}
                style={[styles.weekButton, currentWeek === week.weekNumber && styles.weekButtonActive]}
                onPress={() => setCurrentWeek(week.weekNumber)}
              >
                <Text style={[styles.weekButtonText, currentWeek === week.weekNumber && styles.weekButtonTextActive]}>
                  Week {week.weekNumber}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {renderWeekInfo()}

      {/* Tab switcher for different sound categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScrollContainer}>
        <View style={styles.tabContainer}>
          {['Tamil Vowels', 'English Vowels', 'Tamil Consonants', 'English Consonants', 'Parallel Sounds'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab as any)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Content Area */}
      <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
        {activeTab === 'Parallel Sounds' ? (
          <View style={styles.parallelContainer}>
            {currentItems.map((item: any, index: number) => renderLetterCard({ item, index }))}
          </View>
        ) : (
          <FlatList
            data={currentItems}
            renderItem={({ item, index }) => renderLetterCard({ item, index })}
            keyExtractor={(item, index) => item.id || `item-${index}`}
            numColumns={2}
            contentContainerStyle={styles.gridContainer}
            scrollEnabled={false}
            columnWrapperStyle={styles.row}
          />
        )}
        
        {/* Family Words Section */}
        {moduleData && moduleData.familyWords && (activeTab === 'Tamil Vowels' || activeTab === 'Tamil Consonants') && (
          <View style={styles.familyWordsSection}>
            <Text style={styles.sectionTitle}>👨‍👩‍👧‍👦 Tamil Family Words</Text>
            {moduleData.familyWords.tamil.map((word: any, index: number) => (
              <View key={index} style={styles.familyWordCard}>
                <Text style={styles.familyWordTamil}>{word.word}</Text>
                <Text style={styles.familyWordMeaning}>{word.meaning}</Text>
                <Text style={styles.familyWordPronun}>{word.pronunciation}</Text>
              </View>
            ))}
          </View>
        )}

        {moduleData && moduleData.familyWords && (activeTab === 'English Vowels' || activeTab === 'English Consonants') && (
          <View style={styles.familyWordsSection}>
            <Text style={styles.sectionTitle}>👨‍👩‍👧‍👦 English Family Words</Text>
            {moduleData.familyWords.english.map((word: any, index: number) => (
              <View key={index} style={styles.familyWordCard}>
                <Text style={styles.familyWordEnglish}>{word.word}</Text>
                <Text style={styles.familyWordPronun}>{word.pronunciation}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Foundational Quiz Button */}
      <TouchableOpacity
        style={styles.quizButton}
        onPress={() => {
          if (moduleData && moduleData.items && moduleData.items.length > 0) {
            setQuizVisible(true);
          } else {
            Alert.alert('Quiz Not Available', 'Please wait for the module content to load.');
          }
        }}
      >
        <Text style={styles.quizButtonText}>Foundational Assessment</Text>
      </TouchableOpacity>

      <QuizModal
        visible={quizVisible}
        onClose={() => setQuizVisible(false)}
        quizData={{
          moduleId: MODULE_ID,
          passingScore: 80,
          questions: generateFoundationalQuiz()
        }}
        onComplete={(score: number, passed: boolean) => {
          // Module progress will be updated by QuizModal
          setQuizVisible(false);
          if (passed) {
            Alert.alert(
              'Congratulations! 🎉',
              'You have mastered the foundational alphabet sounds in both Tamil and English!'
            );
          }
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.95,
    marginBottom: 2,
  },
  subtitleSmall: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  weekSelector: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  weekButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 6,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  weekButtonActive: {
    backgroundColor: '#FF1744',
  },
  weekButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  weekButtonTextActive: {
    color: '#FFFFFF',
  },
  weekInfoContainer: {
    backgroundColor: '#FFF9C4',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  weekDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    minWidth: 100,
    borderLeftWidth: 3,
    borderLeftColor: '#FF1744',
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF1744',
    marginBottom: 4,
  },
  dayFocus: {
    fontSize: 11,
    color: '#333333',
  },
  tabScrollContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#E0E0E0',
    maxHeight: 60,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
  },
  tab: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FF1744',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
  },
  activeTabText: {
    color: '#FF1744',
    fontWeight: 'bold',
  },
  contentArea: {
    flex: 1,
    paddingTop: 16,
  },
  gridContainer: {
    paddingHorizontal: 12,
    paddingBottom: 120,
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
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
    marginBottom: 8,
  },
  cardTop: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tamilLetter: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  parallelBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  cardBottom: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  romanization: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  soundDescription: {
    fontSize: 10,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
  audioButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  audioIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioIconText: {
    fontSize: 14,
  },
  exampleContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  exampleWord: {
    fontSize: 13,
    color: '#333333',
    fontWeight: '600',
    textAlign: 'center',
  },
  exampleMeaning: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
    marginTop: 2,
  },
  weekBadge: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  parallelContainer: {
    paddingHorizontal: 12,
    paddingBottom: 120,
  },
  parallelCardWrapper: {
    width: '100%',
    marginBottom: 16,
  },
  parallelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  parallelContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  parallelSide: {
    alignItems: 'center',
    flex: 1,
  },
  parallelLabel: {
    fontSize: 11,
    color: '#666666',
    marginBottom: 4,
    fontWeight: '600',
  },
  parallelLetter: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#333333',
  },
  bridgeIcon: {
    fontSize: 24,
    color: '#FF1744',
    marginHorizontal: 8,
  },
  sharedSound: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  teachingNote: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 18,
  },
  typeTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'center',
  },
  typeTagText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  familyWordsSection: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    marginTop: 16,
    marginHorizontal: 12,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  familyWordCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  familyWordTamil: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  familyWordEnglish: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  familyWordMeaning: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  familyWordPronun: {
    fontSize: 12,
    color: '#999999',
    fontStyle: 'italic',
  },
  quizButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#00BFA5',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  quizButtonText: {
    fontSize: 18,
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