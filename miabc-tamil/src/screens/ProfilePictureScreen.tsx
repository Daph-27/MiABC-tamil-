
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, Platform, ActivityIndicator, PermissionsAndroid } from 'react-native';
import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';

const ProfilePictureScreen = ({ navigation }) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const showSuccessAndGoToLogin = () => {
    Alert.alert(
      'Registration Successful',
      'You have been successfully registered.',
      [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]
    );
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs access to your camera to take photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleImagePicker = async () => {
    try {
      Alert.alert(
        'Select Photo',
        'Choose an option to upload your profile picture',
        [
          {
            text: 'Camera',
            onPress: () => openCamera(),
          },
          {
            text: 'Gallery',
            onPress: () => openGallery(),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
      return;
    }

    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'front',
        quality: 0.8,
        saveToPhotos: false,
      },
      (response: ImagePickerResponse) => {
        handleImageResponse(response);
      }
    );
  };

  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      (response: ImagePickerResponse) => {
        handleImageResponse(response);
      }
    );
  };

  const handleImageResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.errorCode) {
      console.log('ImagePicker Error: ', response.errorMessage);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } else if (response.assets && response.assets[0]) {
      const asset = response.assets[0];
      setImageUri(asset.uri || null);
    }
  };

  const handleSetPicture = () => {
    if (imageUri) {
      uploadProfilePicture();
    } else {
      handleImagePicker();
    }
  };

  const uploadProfilePicture = async () => {
    if (!imageUri) {
      Alert.alert('No Image', 'Please select an image first.');
      return;
    }

    setIsUploading(true);
    try {
      // TODO: Implement actual upload to backend/Firebase
      // For now, just proceed to success after a short delay
      setTimeout(() => {
        setIsUploading(false);
        showSuccessAndGoToLogin();
      }, 1000);
    } catch (error) {
      setIsUploading(false);
      Alert.alert('Upload Failed', 'Failed to upload profile picture. You can add it later from settings.');
      showSuccessAndGoToLogin();
    }
  };

  const handleSkip = () => {
    showSuccessAndGoToLogin();
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/miABC-login icon.png')} style={styles.logo} />
      <Text style={styles.title}>Set Up Your Profile Picture</Text>

      <TouchableOpacity style={styles.pictureContainer} onPress={handleImagePicker}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.profileImage} />
        ) : (
          <Text style={styles.pictureText}>Tap to select a picture</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]} 
        onPress={handleSetPicture}
        disabled={isUploading}
      >
        {isUploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.uploadButtonText}>
            {imageUri ? 'Upload Picture' : 'Select Picture'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSkip} disabled={isUploading}>
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
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
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
  uploadButtonDisabled: {
    backgroundColor: '#ffb3a8',
    opacity: 0.7,
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
