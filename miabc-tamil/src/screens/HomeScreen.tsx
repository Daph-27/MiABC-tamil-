
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useUser } from '../state/UserContext';

const modules = [
  { name: 'Alphabets', screen: 'Alphabet', moduleId: '01_alphabet', icon: require('../../assets/alphabet-icon.png') },
  { name: 'Sounds', screen: 'Sounds', moduleId: '02_sounds', icon: require('../../assets/sounds-icon.png') },
  { name: 'Math', screen: 'Mathematics', moduleId: '03_mathematics', icon: require('../../assets/math-icon.png') },
  { name: 'Family', screen: 'Family', moduleId: '04_family', icon: require('../../assets/family-icon.png') },
  { name: 'I can write', screen: 'Write', moduleId: '05_write', icon: require('../../assets/writing-icon.png') },
  { name: 'I can read', screen: 'Read', moduleId: '06_i_know_how_to_read', icon: require('../../assets/I can read-icon.png') },
  { name: 'To complete', screen: 'Complete', moduleId: '07_complete', icon: require('../../assets/complete-icon.png') },
  { name: 'Words', screen: 'Words', moduleId: '08_words', icon: require('../../assets/words-icon.png') },
  { name: 'Festivals', screen: 'Festivals', moduleId: '09_festivals', icon: require('../../assets/festivals-icon.png') },
  { name: 'Colors', screen: 'Colors', moduleId: '10_colors', icon: require('../../assets/colors-icon.png') },
];

const HomeScreen = ({ navigation }) => {
  const { user, isUnlocked, progress } = useUser();
  const displayName = user?.learnerName || user?.username || 'User';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Image source={require('../../assets/menu-icon.png')} style={styles.menuIcon} />
        </TouchableOpacity>
        <Text style={styles.greeting}>Hello, {displayName}</Text>
      </View>

      <View style={styles.modulesContainer}>
        {modules.map((module, index) => {
          const locked = !isUnlocked(module.moduleId);
          const passed = progress[module.moduleId]?.passed || false;
          return (
          <TouchableOpacity 
            key={index} 
            style={[styles.module, locked && styles.lockedModule]} 
            onPress={() => module.screen && !locked && navigation.navigate(module.screen)}
            disabled={locked}
          >
            {module.icon ? (
              <Image source={module.icon} style={[styles.icon, module.name === 'Festivals' && styles.festivalIcon, locked && styles.lockedIcon]} />
            ) : (
              <View style={styles.placeholderIcon}><Text>ICON</Text></View>
            )}
            <Text style={[styles.moduleName, locked && styles.lockedText]}>{module.name}</Text>
            {locked && <Text style={styles.lockIcon}>🔒</Text>}
            {passed && <Text style={styles.checkIcon}>✅</Text>}
          </TouchableOpacity>
        );})}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f7f7',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
    },
    menuIcon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
        tintColor: '#000',
    },
    greeting: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 15,
    },
    modulesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        padding: 10,
    },
    module: {
        width: '45%',
        alignItems: 'center',
        marginBottom: 25,
    },
    icon: {
        width: 180,
        height: 180,
        resizeMode: 'contain',
    },
    festivalIcon: {
        width: 200, // Custom size for the festival icon
        height: 200,
    },
    placeholderIcon: {
        width: 180,
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ddd',
        borderRadius: 20,
    },
    moduleName: {
        marginTop: 5,
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
});

export default HomeScreen;
