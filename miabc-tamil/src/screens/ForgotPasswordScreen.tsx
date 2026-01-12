
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleVerify = () => {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    } else if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }
    // This is where you would add your backend logic to send a password reset email
    console.log('Attempting to send password reset to:', email);
    Alert.alert(
      'Check Your Email',
      `A password reset link has been sent to ${email}.`,
      [
        { text: "OK", onPress: () => navigation.goBack() }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/miABC-login icon.png')} style={styles.logo} />
      <Text style={styles.title}>Forgot Your Password?</Text>
      <Text style={styles.subtitle}>Enter your email to receive a reset link.</Text>

      <View style={styles.inputContainer}>
        <View style={styles.iconWrapper}>
            <Image source={require('../../assets/user-icon.png')} style={styles.circularIcon} />
        </View>
        <TextInput
          style={styles.input}
          placeholder="EMAIL"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
        <Text style={styles.verifyButtonText}>Verify</Text>
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
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 40,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 35,
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
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  verifyButton: {
    backgroundColor: '#ff6347',
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 30,
    marginTop: 20,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;
