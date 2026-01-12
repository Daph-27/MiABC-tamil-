
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';

const ProfilePictureScreen = ({ navigation }) => {

  const showSuccessAndGoToLogin = () => {
    Alert.alert(
      'Registration Successful',
      'You have been successfully registered.',
      [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]
    );
  };

  const handleSetPicture = () => {
    // This is where you would add logic to open the camera or image gallery
    // For now, we just show the success message
    showSuccessAndGoToLogin();
  };

  const handleSkip = () => {
    showSuccessAndGoToLogin();
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/miABC-login icon.png')} style={styles.logo} />
      <Text style={styles.title}>Set Up Your Profile Picture</Text>

      <TouchableOpacity style={styles.pictureContainer} onPress={handleSetPicture}>
        {/* This could be a placeholder image or an icon */}
        <Text style={styles.pictureText}>Tap to select a picture</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.uploadButton} onPress={handleSetPicture}>
        <Text style={styles.uploadButtonText}>Upload Picture</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSkip}>
        <Text style={styles.skipText}>Skip for later</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  pictureContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#ff6347',
    borderStyle: 'dashed',
  },
  pictureText: {
    color: '#888',
  },
  uploadButton: {
    backgroundColor: '#ff6347',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginBottom: 20,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipText: {
    color: '#888',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default ProfilePictureScreen;
