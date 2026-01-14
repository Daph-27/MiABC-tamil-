
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ScrollView, ActivityIndicator } from 'react-native';
import apiService from '../services/apiService';

const RegistrationScreen = ({ navigation }) => {
  const [learnerName, setLearnerName] = useState('');
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!learnerName || !username || !age || !guardianName || !guardianPhone || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await apiService.register({
        username: username,
        password: password,
        learnerName: learnerName,
        guardianName: guardianName,
        learnerAge: parseInt(age),
        guardianEmail: email,
        guardianPhone: guardianPhone,
      });
      
      // Registration successful
      Alert.alert(
        'Success!',
        'Your account has been created successfully.',
        [
          {
            text: 'Continue',
            onPress: () => navigation.navigate('ProfilePicture'),
          },
        ]
      );
    } catch (error: any) {
      // Registration failed
      const errorMessage = error.message || 'Registration failed. Please try again.';
      
      if (errorMessage.includes('already registered')) {
        Alert.alert(
          'Error',
          'This username is already taken. Please choose another one.',
          [
            {
              text: 'Go to Login',
              onPress: () => navigation.navigate('Login'),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../../assets/miABC-login icon.png')} style={styles.logo} />
      
      <Text style={styles.sectionTitle}>Learner's Information</Text>
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Learner Name" placeholderTextColor="#aaa" value={learnerName} onChangeText={setLearnerName} />
      </View>
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Age" placeholderTextColor="#aaa" value={age} onChangeText={setAge} keyboardType="numeric" />
      </View>
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#aaa" value={username} onChangeText={setUsername} autoCapitalize="none" />
      </View>
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Guardian Email (optional)" placeholderTextColor="#aaa" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      </View>

      <Text style={styles.sectionTitle}>Guardian's Information</Text>
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Guardian's Name" placeholderTextColor="#aaa" value={guardianName} onChangeText={setGuardianName} />
      </View>
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Guardian's Phone Number" placeholderTextColor="#aaa" value={guardianPhone} onChangeText={setGuardianPhone} keyboardType="phone-pad" />
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#aaa" value={password} onChangeText={setPassword} secureTextEntry={!isPasswordVisible} />
        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
          <Image source={require('../../assets/eye-icon.png')} style={styles.eyeIcon} />
        </TouchableOpacity>
      </View>
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Confirm Password" placeholderTextColor="#aaa" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!isConfirmPasswordVisible} />
        <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
          <Image source={require('../../assets/eye-icon.png')} style={styles.eyeIcon} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.registerButton, loading && styles.registerButtonDisabled]} 
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.registerButtonText}>Register</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingVertical: 50,
    },
    logo: {
        width: 120,
        height: 120,
        resizeMode: 'contain',
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        alignSelf: 'flex-start',
        marginLeft: '10%',
        marginTop: 20,
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '80%',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 15,
    },
    input: {
        flex: 1,
        height: 40,
        fontSize: 16,
        color: '#333',
    },
    eyeIcon: {
        width: 24,
        height: 24,
        tintColor: '#aaa',
    },
    registerButton: {
        backgroundColor: '#ff6347',
        paddingVertical: 15,
      
    registerButtonDisabled: {
        opacity: 0.6,
    },  paddingHorizontal: 80,
        borderRadius: 30,
        marginTop: 30,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default RegistrationScreen;
