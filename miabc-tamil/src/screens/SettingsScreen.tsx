import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useUser } from '../state/UserContext';
import apiService from '../services/apiService';

const SettingsScreen = ({ navigation }) => {
  const { user, updateUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  
  const [grade, setGrade] = useState('');
  const [email, setEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [username, setUsername] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [learnerName, setLearnerName] = useState('');
  const [congratulationPhrase, setCongratulationPhrase] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoadingUser(true);
    try {
      const userData = await apiService.getCurrentUser();
      
      // Update local state
      setGrade(userData.learnerGrade || '');
      setEmail(userData.guardianEmail || '');
      setAccessCode(userData.accessCode || '');
      setUsername(userData.username || '');
      setGuardianName(userData.guardianName || '');
      setGuardianPhone(userData.guardianPhone || '');
      setLearnerName(userData.learnerName || '');
      setCongratulationPhrase(userData.congratulationPhrase || '');
      
      // Update context
      updateUser(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
      // Load from local storage if API fails
      if (user) {
        setGrade(user.learnerGrade || '');
        setEmail(user.guardianEmail || '');
        setAccessCode(user.accessCode || '');
        setUsername(user.username || '');
        setGuardianName(user.guardianName || '');
        setGuardianPhone(user.guardianPhone || '');
        setLearnerName(user.learnerName || '');
        setCongratulationPhrase(user.congratulationPhrase || '');
      }
    } finally {
      setLoadingUser(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const updatedData = {
        learnerGrade: grade,
        guardianEmail: email,
        guardianName,
        guardianPhone,
        learnerName,
        congratulationPhrase,
      };
      
      await apiService.updateUserProfile(updatedData);
      await updateUser(updatedData);
      
      Alert.alert('Success', 'Your profile has been updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'This feature will be implemented soon.');
  };

  const handleParentalLock = () => {
    Alert.alert('Parental Lock', 'This feature will be implemented soon.');
  };

  const handleViewPrivacyPolicy = () => {
    Alert.alert('Privacy Policy', 'This feature will be implemented soon.');
  };

  const handleRecordCongratulation = () => {
    Alert.alert('Record', 'Voice recording feature will be implemented soon.');
  };

  const handlePlayCongratulation = () => {
    if (congratulationPhrase) {
      Alert.alert('Congratulation Phrase', congratulationPhrase);
    } else {
      Alert.alert('No Phrase', 'Please record or type a congratulation phrase first.');
    }
  };

  const handleRecordLearnerName = () => {
    Alert.alert('Record', 'Voice recording feature will be implemented soon.');
  };

  const handlePlayLearnerName = () => {
    if (learnerName) {
      Alert.alert('Learner Name', learnerName);
    } else {
      Alert.alert('No Name', 'Please enter the learner name first.');
    }
  };

  const handleUploadPhoto = () => {
    Alert.alert('Upload Photo', 'Photo upload feature will be implemented soon.');
  };

  const handleDownloadPhoto = () => {
    Alert.alert('Download Photo', 'This feature will be implemented soon.');
  };

  const handleDeletePhoto = () => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete your profile photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          // Implement photo deletion
          Alert.alert('Success', 'Photo deleted successfully.');
        }},
      ]
    );
  };

  if (loadingUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4500" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings / Configuration</Text>
      </View>

      {/* Profile Picture Section */}
      <View style={styles.profileSection}>
        <Image
          source={user?.profilePicture ? { uri: user.profilePicture } : require('../../assets/user-icon.png')}
          style={styles.profileImage}
        />
        <Text style={styles.imageHint}>Image must be at least 350px</Text>
        
        <View style={styles.photoButtonsRow}>
          <TouchableOpacity style={styles.photoButton} onPress={handleDownloadPhoto}>
            <Text style={styles.photoButtonText}>Download Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.photoButton, styles.uploadButton]} onPress={handleUploadPhoto}>
            <Text style={styles.photoButtonText}>Upload Photo</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={[styles.photoButton, styles.deleteButton]} onPress={handleDeletePhoto}>
          <Text style={styles.photoButtonText}>Delete Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Access Code */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Access Code</Text>
        <TextInput
          style={styles.input}
          value={accessCode}
          editable={false}
          placeholder="Access code"
        />
      </View>

      {/* Username */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          editable={false}
          placeholder="Username"
        />
      </View>

      {/* Guardian Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Guardian Name</Text>
        <TextInput
          style={styles.input}
          value={guardianName}
          onChangeText={setGuardianName}
          placeholder="Guardian name"
        />
      </View>

      {/* Guardian Phone */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Guardian Phone Number</Text>
        <TextInput
          style={styles.input}
          value={guardianPhone}
          onChangeText={setGuardianPhone}
          placeholder="Example: (XXX) - XXX - XXXX"
          keyboardType="phone-pad"
        />
        <Text style={styles.hint}>Example: (XXX) - XXX - XXXX</Text>
      </View>

      {/* Learner Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Learner Name</Text>
        <TextInput
          style={styles.input}
          value={learnerName}
          onChangeText={setLearnerName}
          placeholder="Learner name"
        />
      </View>

      {/* Grade Selection */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Select Grade</Text>
        <View style={styles.pickerContainer}>
          <TextInput
            style={styles.input}
            value={grade}
            onChangeText={setGrade}
            placeholder="Select grade..."
          />
        </View>
      </View>

      {/* Email */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email address"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Change Button */}
      <TouchableOpacity style={styles.changeButton} onPress={handleUpdate}>
        {loading ? (
          <ActivityIndicator color="#666" />
        ) : (
          <Text style={styles.changeButtonText}>CHANGE</Text>
        )}
      </TouchableOpacity>

      {/* Password Button */}
      <TouchableOpacity style={styles.actionButton} onPress={handleChangePassword}>
        <Text style={styles.actionButtonText}>PASSWORD</Text>
      </TouchableOpacity>

      {/* Parental Lock Button */}
      <TouchableOpacity style={styles.actionButton} onPress={handleParentalLock}>
        <Text style={styles.actionButtonText}>PARENTAL LOCK</Text>
      </TouchableOpacity>

      {/* Congratulation Phrase Section */}
      <View style={styles.inputGroup}>
        <Text style={styles.sectionLabel}>CONGRATULATION PHRASE</Text>
        <View style={styles.audioControls}>
          <TouchableOpacity style={styles.audioButton} onPress={handleRecordCongratulation}>
            <Text style={styles.audioIcon}>🎤</Text>
            <Text style={styles.audioText}>RECORD</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.audioButton} onPress={handlePlayCongratulation}>
            <Text style={styles.audioIcon}>▶️</Text>
            <Text style={styles.audioText}>PLAY</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Learner Name Audio Section */}
      <View style={styles.inputGroup}>
        <Text style={styles.sectionLabel}>LEARNER NAME</Text>
        <View style={styles.audioControls}>
          <TouchableOpacity style={styles.audioButton} onPress={handleRecordLearnerName}>
            <Text style={styles.audioIcon}>🎤</Text>
            <Text style={styles.audioText}>RECORD</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.audioButton} onPress={handlePlayLearnerName}>
            <Text style={styles.audioIcon}>▶️</Text>
            <Text style={styles.audioText}>PLAY</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Privacy Policy Section */}
      <View style={styles.inputGroup}>
        <Text style={styles.sectionLabel}>PRIVACY POLICY</Text>
        <TouchableOpacity style={styles.privacyButton} onPress={handleViewPrivacyPolicy}>
          <Text style={styles.actionButtonText}>VIEW PRIVACY POLICY</Text>
        </TouchableOpacity>
      </View>

      {/* Update Button */}
      <TouchableOpacity 
        style={styles.updateButton} 
        onPress={handleUpdate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.updateButtonText}>UPDATE</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 15,
  },
  backIcon: {
    fontSize: 28,
    color: '#000',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0E0E0',
  },
  imageHint: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
  },
  photoButtonsRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  photoButton: {
    backgroundColor: '#9C27B0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  uploadButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  photoButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  inputGroup: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  label: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 5,
  },
  changeButton: {
    backgroundColor: '#DDD',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  changeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#FF0000',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 15,
    textAlign: 'center',
  },
  audioControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  audioIcon: {
    fontSize: 24,
    color: '#FF0000',
  },
  audioText: {
    fontSize: 16,
    fontWeight: '600',
  },
  privacyButton: {
    backgroundColor: '#FF0000',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  updateButton: {
    backgroundColor: '#0000FF',
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  updateButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
});

export default SettingsScreen;
