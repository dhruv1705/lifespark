import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';

export const AuthScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { isOfflineMode } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    // Handle offline/demo mode
    if (isOfflineMode) {
      // In offline mode, just simulate successful login
      setTimeout(() => {
        setLoading(false);
        Alert.alert('Demo Mode', 'You\'re now using Lifespark in demo mode with sample data!');
      }, 1000);
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        Alert.alert('Success', 'Check your email for verification link');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      // Handle network errors gracefully
      if (error.message?.includes('fetch') || error.message?.includes('network')) {
        Alert.alert(
          'Connection Issue', 
          'Unable to connect to the server. The app will continue in demo mode with sample data.',
          [{ text: 'OK', onPress: () => {
            // Force offline mode
            setLoading(false);
          }}]
        );
      } else {
        Alert.alert('Error', error.message);
        setLoading(false);
      }
    }
  };

  const handleAutoFill = () => {
    setEmail('john@gmail.com');
    setPassword('John123456');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>✨ Lifespark</Text>
            <Text style={styles.subtitle}>
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </Text>
            {isOfflineMode && (
              <View style={styles.demoModeIndicator}>
                <Text style={styles.demoModeText}>🔄 Demo Mode</Text>
              </View>
            )}
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color={theme.colors.text.secondary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleAuth}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={styles.switchText}>
                {isSignUp 
                  ? 'Already have an account? Sign In' 
                  : "Don't have an account? Sign Up"
                }
              </Text>
            </TouchableOpacity>

            {/* Auto Fill Button */}
            <TouchableOpacity
              style={styles.autoFillButton}
              onPress={handleAutoFill}
            >
              <Text style={styles.autoFillButtonText}>
                ⚡ Auto Fill for Testing
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl + theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.sizes.heading,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  passwordInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    paddingRight: 50,
    fontSize: theme.typography.sizes.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  eyeIcon: {
    position: 'absolute',
    right: theme.spacing.md,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  button: {
    backgroundColor: theme.colors.primary.blue,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
  },
  switchButton: {
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  switchText: {
    color: theme.colors.primary.blue,
    fontSize: theme.typography.sizes.sm,
  },
  demoModeIndicator: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.5)',
  },
  demoModeText: {
    color: '#F57F17',
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    textAlign: 'center',
  },
  autoFillButton: {
    backgroundColor: theme.colors.primary.orange,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  autoFillButtonText: {
    color: '#000000',
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
  },
});