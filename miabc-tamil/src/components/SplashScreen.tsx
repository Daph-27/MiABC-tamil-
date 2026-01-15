
import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/splash-screen.png')}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  image: {
    width: '80%',
    height: '80%',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#333',
  },
});

export default SplashScreen;
