import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import AnimatedButton from '../components/AnimatedButton';
import { createFadeInAnimation, createSlideInAnimation } from '../utils/animations';
import colors from '../styles/colors';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const formFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Stagger animations on mount
    Animated.sequence([
      createFadeInAnimation(fadeAnim, 600),
      Animated.parallel([
        createSlideInAnimation(slideAnim, 50, 400),
        createFadeInAnimation(formFadeAnim, 400),
      ]),
    ]).start();
  }, [fadeAnim, slideAnim, formFadeAnim]);

  const handleLogin = async () => {
    // Basic validation
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await login(username.trim(), password);
      
      if (!result.success) {
        Alert.alert('Login Failed', result.error);
      }
      // If successful, navigation will be handled by the auth context
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const showDemoCredentials = () => {
    Alert.alert(
      'Demo Credentials',
      'Admin User:\nUsername: admin\nPassword: admin123\n\nRegular User:\nUsername: user1\nPassword: user123\n\nDonor User:\nUsername: donor\nPassword: donor123',
      [{ text: 'OK' }]
    );
  };



  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          {/* Header */}
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.title}>श्री साई सेवा मंडळ</Text>
            <Text style={styles.subtitle}>Digital Pavti Pustak</Text>
          </Animated.View>

          {/* Login Form */}
          <Animated.View style={[styles.form, { opacity: formFadeAnim }]}>
            <Text style={styles.formTitle}>Login to Continue</Text>

            {/* Username Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                disabled={isLoading}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={colors.textLight}
                />
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <AnimatedButton
              title="Login"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              variant="primary"
              size="large"
              style={styles.loginButton}
            />

            {/* Demo Credentials Button */}
            <AnimatedButton
              title="View Demo Credentials"
              onPress={showDemoCredentials}
              disabled={isLoading}
              variant="ghost"
              size="medium"
              style={styles.demoButton}
            />


          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    fontWeight: '500',
  },
  form: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 28,
    shadowColor: colors.shadowDark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    backgroundColor: colors.surfaceElevated,
    shadowColor: colors.shadowLight,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: colors.textDark,
  },
  eyeIcon: {
    padding: 8,
    borderRadius: 6,
  },
  loginButton: {
    marginTop: 12,
    width: '100%',
  },
  demoButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
});
