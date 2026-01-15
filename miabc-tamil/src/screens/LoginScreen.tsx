
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import apiService from '../services/apiService';
import { useUser } from '../state/UserContext';

const LoginScreen = ({ navigation }) => {
  const { setUser } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validate inputs
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password.');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await apiService.login({
        username: username,
        password: password,
      });
      
      // Save user data to context
      await setUser({
        userId: response.userId,
        username: response.username,
        learnerName: response.learnerName,
        accessCode: response.accessCode,
      });
      
      // Login successful
      Alert.alert(
        'Success',
        `Welcome back, ${response.learnerName || 'User'}!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home'),
          },
        ]
      );
    } catch (error: any) {
      // Login failed
      const errorMessage = error.message || 'Login failed. Please check your credentials.';
      
      if (errorMessage.includes('Incorrect username or password')) {
        Alert.alert(
          'Login Failed',
          'You are not registered or your password is incorrect. Please register to continue.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/miABC-login icon.png')} style={styles.logo} />
      <Text style={styles.subtitle}>An Educational Application</Text>

      {/* Email/Username Input */}
      <View style={styles.inputContainer}>
        <View style={styles.iconWrapper}>
          <Image source={require('../../assets/user-icon.png')} style={styles.circularIcon} />
        </View>
        <TextInput
          style={styles.input}
          placeholder="EMAIL / USERNAME"
          placeholderTextColor="#aaa"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <View style={styles.iconWrapper}>
          <Image source={require('../../assets/lock-icon.png')} style={styles.circularIcon} />
        </View>
        <TextInput
          style={styles.input}
          placeholder="PASSWORD"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!isPasswordVisible}
        />
        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
          <Image source={require('../../assets/eye-icon.png')} style={styles.eyeIcon} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.linkText}>Forgot your password? <Text style={styles.linkActionText}>Recover it</Text></Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkActionText}>Register</Text></Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 100,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 25,
  },
  iconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ff6347',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  circularIcon: {
    width: 18,
    height: 18,
    tintColor: '#fff',
  },
  eyeIcon: {
    width: 24,
    height: 24,
    tintColor: '#aaa',
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#ff6347',
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 30,
    marginTop: 20,
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  linkText: {
    color: '#888',
    fontSize: 14,
    marginTop: 15,
  },
  linkActionText: {
    color: '#ff6347',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
