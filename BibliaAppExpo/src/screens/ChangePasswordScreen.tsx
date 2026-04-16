/**
 * ==========================================
 * CHANGE PASSWORD SCREEN
 * ==========================================
 * Pantalla para cambiar la contraseña del usuario
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {MaterialIcons} from '@expo/vector-icons';
import {ThemeColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';
import {apiClient} from '../services/api.client';
import {useIsOnline} from '../contexts/NetworkContext';
import OfflineBanner from '../components/OfflineBanner';

type ChangePasswordScreenProps = {
  navigation: any;
};

const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({navigation}) => {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const isOnline = useIsOnline();
  const styles = React.useMemo(() => getStyles(colors, isDarkMode, insets.top), [colors, isDarkMode, insets.top]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const validatePassword = (password: string): boolean => {
    // Mínimo 6 caracteres
    return password.length >= 6;
  };

  const handleSavePassword = async () => {
    // ⛔ Verificar conexión primero
    if (!isOnline) {
      Alert.alert(
        'Offline',
        'You need an internet connection to change your password. For security, this change is verified in real-time.'
      );
      return;
    }

    // Validaciones
    if (!currentPassword.trim()) {
      Alert.alert('Error', 'Enter your current password');
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert('Error', 'Enter your new password');
      return;
    }

    if (!validatePassword(newPassword)) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    setIsSaving(true);
    try {
      await apiClient.put('/users/me/password', {
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      });

      Alert.alert(
        'Success',
        'Your password was changed successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error cambiando contraseña:', error);
      const errorMessage = error.message || 'Could not change password. Try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Banner offline */}
      <OfflineBanner />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.7}
          style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.charcoal.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Icon and Description */}
        <View style={styles.headerSection}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="vpn-key" size={32} color={colors.gold.DEFAULT} />
          </View>
          <Text style={styles.description}>
            To protect your account, ensure your new password is secure.
          </Text>
        </View>

        <View style={styles.formSection}>
          {/* Current Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>CURRENT PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock" size={20} color={colors.gold.DEFAULT} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="••••••••"
                placeholderTextColor={isDarkMode ? colors.charcoal.muted : "#CBD5E1"}
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                activeOpacity={0.7}>
                <MaterialIcons
                  name={showCurrentPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color={colors.ink.light}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>NEW PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="lock-open" size={20} color={colors.gold.DEFAULT} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Minimum 6 characters"
                placeholderTextColor={isDarkMode ? colors.charcoal.muted : "#CBD5E1"}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
                activeOpacity={0.7}>
                <MaterialIcons
                  name={showNewPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color={colors.ink.light}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>CONFIRM NEW PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="verified-user" size={20} color={colors.gold.DEFAULT} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repeat new password"
                placeholderTextColor={isDarkMode ? colors.charcoal.muted : "#CBD5E1"}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                activeOpacity={0.7}>
                <MaterialIcons
                  name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color={colors.ink.light}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, (isSaving || !isOnline) && styles.saveButtonDisabled]}
            onPress={handleSavePassword}
            disabled={isSaving}
            activeOpacity={0.7}>
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : !isOnline ? (
              <Text style={styles.saveButtonText}>Connection Required</Text>
            ) : (
              <Text style={styles.saveButtonText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Bible Verse */}
        <View style={styles.verseSection}>
          <Text style={styles.verseText}>
            "The Lord is my light and my salvation; whom shall I fear?" — Psalm 27:1
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const getStyles = (colors: ThemeColors, isDarkMode: boolean, safeTop: number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? colors.background.dark : colors.ivory.DEFAULT,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Math.max(safeTop, 20) + 16,
    backgroundColor: isDarkMode ? colors.background.dark : colors.ivory.DEFAULT,
    borderBottomWidth: 1,
    borderBottomColor: colors.ivory.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'serif',
    color: colors.charcoal.dark,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 128,
    maxWidth: 448,
    alignSelf: 'center',
    width: '100%',
  },

  // Header Section
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: isDarkMode ? `${colors.primary.DEFAULT}1A` : `${colors.gold.DEFAULT}1A`, 
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: colors.ink.light,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },

  // Form Section
  formSection: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.ink.light,
    letterSpacing: 2,
    marginLeft: 4,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? colors.ivory.shade : '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.ivory.border,
    borderRadius: 12,
    shadowColor: colors.charcoal.DEFAULT,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    flex: 1,
    paddingLeft: 48, // Espacio para el icono
    paddingRight: 48, // Espacio para el ojo
    paddingVertical: 16,
    fontSize: 16,
    color: colors.charcoal.DEFAULT,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },

  // Save Button
  saveButton: {
    backgroundColor: colors.primary.DEFAULT,
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: 'center',
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
    marginTop: 32,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: isDarkMode ? colors.charcoal.dark : '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },

  // Verse Section
  verseSection: {
    marginTop: 32,
    alignItems: 'center',
  },
  verseText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#94A3B8', // slate-400
    textAlign: 'center',
    fontWeight: '300',
  },
});

export default ChangePasswordScreen;
