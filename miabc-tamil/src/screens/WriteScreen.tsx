
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

export const WriteScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Write</Text>
      <Text style={styles.subtitle}>Content coming from Firestore...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontStyle: 'italic',
    color: theme.colors.text,
  }
});
  