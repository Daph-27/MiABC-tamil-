
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';

// Dummy user data, replace with actual user data from your state management
const user = { username: 'User' };

const modules = [
  { name: 'Alphabets', screen: 'Alphabet', icon: require('../../assets/alphabet-icon.png') },
  { name: 'Sounds', screen: 'Sounds', icon: require('../../assets/sounds-icon.png') },
  { name: 'Words', screen: 'Words', icon: require('../../assets/words-icon.png') },
  { name: 'Family', screen: 'Family', icon: require('../../assets/family-icon.png') },
  { name: 'Math', screen: 'Mathematics', icon: require('../../assets/math-icon.png') },
  { name: 'Colors', screen: 'Colors', icon: require('../../assets/colors-icon.png') },
  { name: 'Festivals', screen: 'Festivals', icon: require('../../assets/festivals-icon.png') },
  { name: 'I can write', screen: 'Write', icon: require('../../assets/writing-icon.png') },
  { name: 'I can read', screen: 'Read', icon: require('../../assets/I can read-icon.png') },
  { name: 'To complete', screen: 'Complete', icon: require('../../assets/complete-icon.png') },
];

const HomeScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Image source={require('../../assets/menu-icon.png')} style={styles.menuIcon} />
        </TouchableOpacity>
        <Text style={styles.greeting}>Hello, {user.username}</Text>
      </View>

      <View style={styles.modulesContainer}>
        {modules.map((module, index) => (
          <TouchableOpacity key={index} style={styles.module} onPress={() => module.screen && navigation.navigate(module.screen)}>
            {module.icon ? (
              <Image source={module.icon} style={[styles.icon, module.name === 'Festivals' && styles.festivalIcon]} />
            ) : (
              <View style={styles.placeholderIcon}><Text>ICON</Text></View>
            )}
            <Text style={styles.moduleName}>{module.name}</Text>
          </TouchableOpacity>
        ))}
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
