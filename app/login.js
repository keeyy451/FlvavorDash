import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../constants/Theme';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Email dan password wajib diisi!');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        router.replace('/');
      } else {
        setError(res.message || 'Login gagal!');
      }
    } catch {
      setError('Terjadi kesalahan koneksi.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('user@flavordash.com');
    setPassword('password123');
    setError('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.backButtonWrapper}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="lock-closed" size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Selamat Datang{'\n'}Kembali</Text>
            <Text style={styles.subtitle}>
              Masuk untuk menikmati hidangan terbaik dari FlavorDash
            </Text>
          </View>

          <View style={styles.form}>
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={20} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="key-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPw}
                />
                <TouchableOpacity onPress={() => setShowPw(!showPw)}>
                  <Ionicons 
                    name={showPw ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={COLORS.textMuted} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.text} />
              ) : (
                <Text style={styles.loginButtonText}>Masuk Sekarang</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.demoButton} onPress={fillDemo}>
              <Text style={styles.demoButtonText}>Gunakan Akun Demo</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingHorizontal: '8%', paddingBottom: SPACING.xl, paddingTop: SPACING.md },
  backButtonWrapper: { marginBottom: SPACING.lg },
  backButton: { width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.glassBorder },
  header: { alignItems: 'center', marginBottom: SPACING.xl },
  iconCircle: { width: 80, height: 80, borderRadius: RADIUS.xl, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.glassBorder, ...SHADOWS.medium },
  title: { ...TYPOGRAPHY.h1, color: COLORS.text, textAlign: 'center', marginBottom: SPACING.sm },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: 20, lineHeight: 20 },
  form: { width: '100%' },
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: COLORS.error, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.lg },
  errorText: { color: COLORS.error, fontSize: 13, fontWeight: '700', marginLeft: 8 },
  inputContainer: { marginBottom: SPACING.md },
  label: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 8, marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.glassBorder, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, height: 56 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: COLORS.text, fontSize: 15, fontWeight: '600' },
  loginButton: { backgroundColor: COLORS.primary, height: 56, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginTop: SPACING.lg, ...SHADOWS.medium },
  loginButtonText: { color: COLORS.text, fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  demoButton: { marginTop: SPACING.md, paddingVertical: 12, alignItems: 'center' },
  demoButtonText: { color: COLORS.primaryLight, fontSize: 14, fontWeight: '700', textDecorationLine: 'underline' },
});
