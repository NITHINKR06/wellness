import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const AuthScreen: React.FC = () => {
  const { signIn, register, authLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const toggleMode = () => {
    setError(null);
    setMode((prev) => (prev === 'login' ? 'register' : 'login'));
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setError(null);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await register(email, password);
      }
      setEmail('');
      setPassword('');
    } catch (err: any) {
      const message =
        err?.message ||
        (mode === 'login' ? 'Unable to sign in. Please try again.' : 'Unable to create account.');
      setError(message);
      Alert.alert('Authentication Failed', message, [{ text: 'OK' }]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="lock-closed" size={32} color="#6c5ce7" />
        </View>
        <Text style={styles.title}>
          {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
        </Text>
        <Text style={styles.subtitle}>
          {mode === 'login'
            ? 'Log in to continue tracking your assessments securely.'
            : 'Register to start saving your assessments securely.'}
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#b2bec3"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#b2bec3"
          />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.submitButton, authLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={authLoading}
        >
          {authLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons
                name={mode === 'login' ? 'log-in-outline' : 'person-add-outline'}
                size={20}
                color="#fff"
              />
              <Text style={styles.submitButtonText}>
                {mode === 'login' ? 'Log In' : 'Register'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
          <Text style={styles.toggleText}>
            {mode === 'login'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Log in'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f2ff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f5f0ff',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3436',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#636e72',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#636e72',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#2d3436',
    backgroundColor: '#fafafa',
  },
  errorText: {
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#6c5ce7',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  toggleButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  toggleText: {
    color: '#6c5ce7',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AuthScreen;

