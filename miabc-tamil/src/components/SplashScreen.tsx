
import React from 'react';
import { View, Image, StyleSheet, StatusBar } from 'react-native';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Image
        source={require('../../assets/splash-screen.png')}
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default SplashScreen;
