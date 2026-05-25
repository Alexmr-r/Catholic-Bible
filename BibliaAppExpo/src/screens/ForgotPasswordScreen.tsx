import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { ThemeColors } from '../theme/colors';
import { ForgotPasswordScreenProps } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';
import { apiClient } from '../services/api.client';
import { isValidEmail, isValidPassword } from '../utils/validation';
import { t } from '../locales/i18n';

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Errores inline
  const [emailError, setEmailError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { colors, isDarkMode } = useTheme();
  const styles = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => (prev - 1) as 1 | 2 | 3);
    } else {
      navigation.goBack();
    }
  };

  const handleSendCode = async () => {
    setEmailError('');
    if (!email.trim()) {
      setEmailError(t('auth.errors.emailRequired'));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    } else if (!isValidEmail(email)) {
      setEmailError(t('auth.errors.invalidEmail'));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    
    Keyboard.dismiss();
    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setStep(2);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: 'success',
        text1: 'Code Sent',
        text2: 'Check your inbox for the reset code.',
      });
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Error sending code.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setCodeError('');
    if (code.length < 6) {
      setCodeError(t('auth.errors.incompleteFields'));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    
    Keyboard.dismiss();
    setIsLoading(true);
    try {
      const resp = await apiClient.post<{ valid: boolean }>('/auth/verify-reset-code', { 
        email: email.trim().toLowerCase(), 
        code 
      });
      if (resp.valid) {
        setStep(3);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setCodeError('The code is invalid or has expired.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Incorrect or expired code.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setPasswordError('');
    if (!isValidPassword(newPassword)) {
      setPasswordError(t('auth.errors.shortPassword'));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    
    Keyboard.dismiss();
    setIsLoading(true);
    try {
      await apiClient.post('/auth/reset-password', { 
        email: email.trim().toLowerCase(), 
        code, 
        newPassword 
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Password reset successfully',
      });
      navigation.navigate('Login');
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      let displayMessage = error.message || 'Error updating password.';
      displayMessage = displayMessage.replace(/^Error:?\s*/i, '');

      Toast.show({
        type: 'error',
        text1: t('general.error'),
        text2: displayMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} activeOpacity={0.7} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.charcoal.dark} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <MaterialIcons name="lock-reset" size={64} color={colors.gold.DEFAULT} style={styles.icon} />
          <Text style={styles.title}>
            {step === 1 && 'Recover Password'}
            {step === 2 && 'Verify Code'}
            {step === 3 && 'New Password'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 1 && 'Enter your email and we will send you a security code.'}
            {step === 2 && `We've sent a 6-digit code to ${email}.`}
            {step === 3 && 'Create a new, secure password.'}
          </Text>

          {/* STEP 1: Email */}
          {step === 1 && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, emailError ? styles.labelError : null]}>EMAIL ADDRESS</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="mail" size={20} color={emailError ? colors.burgundy.DEFAULT : colors.gold.dim} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, emailError ? styles.inputError : null]}
                  placeholder="example@email.com"
                  placeholderTextColor={isDarkMode ? colors.charcoal.muted : `${colors.charcoal.muted}80`}
                  value={email}
                  onChangeText={(t) => { setEmail(t); if(emailError) setEmailError(''); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleSendCode}
                />
              </View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleSendCode}
                disabled={isLoading}
                activeOpacity={0.8}>
                {isLoading ? <ActivityIndicator color={isDarkMode ? colors.charcoal.dark : '#FFFFFF'} /> : <Text style={styles.primaryButtonText}>Send Code</Text>}
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: Code */}
          {step === 2 && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, codeError ? styles.labelError : null]}>6-DIGIT CODE</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="vpn-key" size={20} color={codeError ? colors.burgundy.DEFAULT : colors.gold.dim} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, codeError ? styles.inputError : null]}
                  placeholder="123456"
                  placeholderTextColor={isDarkMode ? colors.charcoal.muted : `${colors.charcoal.muted}80`}
                  value={code}
                  onChangeText={(t) => { setCode(t); if(codeError) setCodeError(''); }}
                  keyboardType="number-pad"
                  maxLength={6}
                  returnKeyType="done"
                  onSubmitEditing={handleVerifyCode}
                />
              </View>
              {codeError ? <Text style={styles.errorText}>{codeError}</Text> : null}
              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleVerifyCode}
                disabled={isLoading}
                activeOpacity={0.8}>
                {isLoading ? <ActivityIndicator color={isDarkMode ? colors.charcoal.dark : '#FFFFFF'} /> : <Text style={styles.primaryButtonText}>Verify Code</Text>}
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 3: New Password */}
          {step === 3 && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, passwordError ? styles.labelError : null]}>NEW PASSWORD</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock" size={20} color={passwordError ? colors.burgundy.DEFAULT : colors.gold.dim} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, passwordError ? styles.inputError : null]}
                  placeholder="••••••••"
                  placeholderTextColor={isDarkMode ? colors.charcoal.muted : `${colors.charcoal.muted}80`}
                  value={newPassword}
                  onChangeText={(t) => { setNewPassword(t); if(passwordError) setPasswordError(''); }}
                  secureTextEntry={true}
                  returnKeyType="done"
                  onSubmitEditing={handleResetPassword}
                />
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={isLoading}
                activeOpacity={0.8}>
                {isLoading ? <ActivityIndicator color={isDarkMode ? colors.charcoal.dark : '#FFFFFF'} /> : <Text style={styles.primaryButtonText}>Update Password</Text>}
              </TouchableOpacity>
            </View>
          )}

        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const getStyles = (colors: ThemeColors, isDarkMode: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDarkMode ? colors.background.dark : colors.ivory.DEFAULT },
  header: { paddingHorizontal: 24, paddingTop: 48, paddingBottom: 16 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  content: { flex: 1, paddingHorizontal: 32, paddingTop: 20 },
  icon: { alignSelf: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', color: colors.charcoal.dark, textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 14, color: colors.charcoal.muted, textAlign: 'center', marginBottom: 40, lineHeight: 22 },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 10, fontWeight: '700', color: colors.charcoal.DEFAULT, letterSpacing: 1.2, marginBottom: 8, marginLeft: 4, opacity: isDarkMode ? 0.8 : 1 },
  labelError: { color: colors.burgundy.DEFAULT },
  inputWrapper: { position: 'relative', flexDirection: 'row', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 16, zIndex: 1 },
  input: { flex: 1, height: 48, paddingLeft: 48, paddingRight: 16, backgroundColor: colors.ivory.shade, borderRadius: 12, fontSize: 16, color: colors.charcoal.DEFAULT, borderWidth: 1, borderColor: colors.ivory.border },
  inputError: { borderColor: colors.burgundy.DEFAULT, borderWidth: 1 },
  errorText: { fontSize: 12, color: colors.burgundy.DEFAULT, marginTop: 6, marginLeft: 4, fontWeight: '500' },
  primaryButton: { width: '100%', height: 48, backgroundColor: colors.primary.DEFAULT, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 24, shadowColor: colors.primary.DEFAULT, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 },
  buttonDisabled: { opacity: 0.7 },
  primaryButtonText: { color: isDarkMode ? colors.charcoal.dark : '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});

export default ForgotPasswordScreen;
