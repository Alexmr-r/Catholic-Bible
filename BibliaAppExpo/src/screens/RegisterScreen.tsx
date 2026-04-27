import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  useWindowDimensions,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {ThemeColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';
import {RegisterScreenProps} from '../navigation/AppNavigator';
import {useAuth} from '../contexts/AuthContext';
import {t} from '../locales/i18n';
import * as WebBrowser from 'expo-web-browser';

const RegisterScreen: React.FC<RegisterScreenProps> = ({navigation}) => {
  const { colors, isDarkMode } = useTheme();
  const styles = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);
  const {height} = useWindowDimensions();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Refs para navegar entre inputs
  const fullNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const { register } = useAuth();
  const scaleFactor = Math.min(height / 800, 1);

  const dynamicStyles = {
    headerPaddingTop: 48 * scaleFactor,
    iconMarginTop: 16 * scaleFactor,
    iconMarginBottom: 16 * scaleFactor,
    titleMarginBottom: 12 * scaleFactor,
    inputGroupMarginBottom: 20 * scaleFactor,
    termsMarginTop: 4 * scaleFactor,
    buttonMarginTop: 16 * scaleFactor,
    loginLinkMarginTop: 32 * scaleFactor,
  };

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert(t('general.error'), t('auth.errors.incompleteFields') || 'Please complete all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(t('general.error'), t('auth.errors.passwordsDoNotMatch') || 'Passwords do not match');
      return;
    }
    if (password.length < 8) {
      Alert.alert(t('general.error'), t('auth.errors.shortPassword'));
      return;
    }
    if (!acceptedTerms) {
      Alert.alert(t('general.error'), t('auth.errors.acceptTerms') || 'You must accept the terms');
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);
    try {
      await register({ email, password, fullName });
    } catch (error: any) {
      console.error('Error en registro:', error);
      Alert.alert(t('general.error'), error.message || t('auth.errors.networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => navigation.goBack();
  const handleLogin = () => navigation.navigate('Login');

  const openTerms = async () => {
    await WebBrowser.openBrowserAsync('https://getcatholicverse.com/terms.html');
  };

  const openPrivacy = async () => {
    await WebBrowser.openBrowserAsync('https://getcatholicverse.com/privacy.html');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={styles.fullHeight}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <View style={styles.innerContainer}>
              {/* Header */}
              <View style={[styles.header, {paddingTop: dynamicStyles.headerPaddingTop}]}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
                  <MaterialIcons name="arrow-back" size={24} color={colors.charcoal.DEFAULT} />
                </TouchableOpacity>
              </View>

              <View style={styles.content}>
                <View style={styles.topSection}>
                  <Image
                    source={require('../../assets/logo-transparent.png')}
                    style={[styles.logoImage, {
                      marginTop: dynamicStyles.iconMarginTop,
                      marginBottom: dynamicStyles.iconMarginBottom
                    }]}
                    resizeMode="contain"
                  />
                  <Text style={styles.title}>{t('auth.registerTitle')}</Text>
                </View>

                <View style={styles.form}>
                  {/* Full Name Input */}
                  <View style={[styles.inputGroup, {marginBottom: dynamicStyles.inputGroupMarginBottom}]}>
                    <Text style={styles.label}>{t('auth.fullNameLabel')}</Text>
                    <View style={styles.inputWrapper}>
                      <MaterialIcons name="person" size={20} color={colors.gold.dim} style={styles.inputIcon} />
                      <TextInput
                        ref={fullNameRef}
                        style={styles.input}
                        placeholder="John Doe"
                        placeholderTextColor={isDarkMode ? colors.charcoal.muted : `${colors.charcoal.muted}80`}
                        value={fullName}
                        onChangeText={setFullName}
                        autoCapitalize="words"
                        returnKeyType="next"
                        onSubmitEditing={() => emailRef.current?.focus()}
                        blurOnSubmit={false}
                      />
                    </View>
                  </View>

                  {/* Email Input */}
                  <View style={[styles.inputGroup, {marginBottom: dynamicStyles.inputGroupMarginBottom}]}>
                    <Text style={styles.label}>{t('auth.emailLabel')}</Text>
                    <View style={styles.inputWrapper}>
                      <MaterialIcons name="mail" size={20} color={colors.gold.dim} style={styles.inputIcon} />
                      <TextInput
                        ref={emailRef}
                        style={styles.input}
                        placeholder="your@email.com"
                        placeholderTextColor={isDarkMode ? colors.charcoal.muted : `${colors.charcoal.muted}80`}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        returnKeyType="next"
                        onSubmitEditing={() => passwordRef.current?.focus()}
                        blurOnSubmit={false}
                      />
                    </View>
                  </View>

                  {/* Password Input */}
                  <View style={[styles.inputGroup, {marginBottom: dynamicStyles.inputGroupMarginBottom}]}>
                    <Text style={styles.label}>{t('auth.passwordLabel')}</Text>
                    <View style={styles.inputWrapper}>
                      <MaterialIcons name="lock" size={20} color={colors.gold.dim} style={styles.inputIcon} />
                      <TextInput
                        ref={passwordRef}
                        style={[styles.input, styles.passwordInput]}
                        placeholder="••••••••"
                        placeholderTextColor={isDarkMode ? colors.charcoal.muted : `${colors.charcoal.muted}80`}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        returnKeyType="next"
                        onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                        blurOnSubmit={false}
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowPassword(!showPassword)}
                        activeOpacity={0.7}>
                        <MaterialIcons
                          name={showPassword ? 'visibility' : 'visibility-off'}
                          size={20}
                          color={colors.charcoal.muted}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Confirm Password Input */}
                  <View style={[styles.inputGroup, {marginBottom: dynamicStyles.inputGroupMarginBottom}]}>
                    <Text style={styles.label}>{t('auth.passwordLabel')}</Text>
                    <View style={styles.inputWrapper}>
                      <MaterialIcons name="lock-reset" size={20} color={colors.gold.dim} style={styles.inputIcon} />
                      <TextInput
                        ref={confirmPasswordRef}
                        style={[styles.input, styles.passwordInput]}
                        placeholder="••••••••"
                        placeholderTextColor={isDarkMode ? colors.charcoal.muted : `${colors.charcoal.muted}80`}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        returnKeyType="done"
                        onSubmitEditing={handleRegister}
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        activeOpacity={0.7}>
                        <MaterialIcons
                          name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                          size={20}
                          color={colors.charcoal.muted}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={[styles.termsContainer, {marginTop: dynamicStyles.termsMarginTop}]}>
                    <TouchableOpacity style={styles.checkbox} onPress={() => setAcceptedTerms(!acceptedTerms)} activeOpacity={0.7}>
                      <View style={[styles.checkboxBox, acceptedTerms && styles.checkboxBoxChecked]}>
                        {acceptedTerms && <MaterialIcons name="check" size={18} color="#FFFFFF" />}
                      </View>
                    </TouchableOpacity>
                    <Text style={styles.termsText}>
                      Accept {' '}
                      <Text style={styles.termsLink} onPress={openTerms}>Terms</Text> 
                      {' '} and {' '} 
                      <Text style={styles.termsLink} onPress={openPrivacy}>Privacy Policy</Text>.
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.registerButton, {marginTop: dynamicStyles.buttonMarginTop}, isLoading && styles.registerButtonDisabled]}
                    onPress={handleRegister}
                    activeOpacity={0.8}
                    disabled={isLoading}>
                    {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.registerButtonText}>{t('auth.createAccountButton')}</Text>}
                  </TouchableOpacity>
                </View>

                <View style={[styles.loginLinkSection, {marginTop: dynamicStyles.loginLinkMarginTop}]}>
                  <Text style={styles.loginLinkText}>{t('auth.alreadyHaveAccount')} </Text>
                  <TouchableOpacity onPress={handleLogin} activeOpacity={0.7}>
                    <Text style={styles.loginLink}>{t('auth.signInButton')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const getStyles = (colors: ThemeColors, isDarkMode: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDarkMode ? colors.background.dark : colors.ivory.DEFAULT },
  fullHeight: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  innerContainer: { flex: 1, maxWidth: 450, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  content: { flex: 1, paddingHorizontal: 24, paddingBottom: 32 },
  topSection: { alignItems: 'flex-start' },
  logoImage: { width: 80, height: 80 },
  title: { fontSize: 32, fontWeight: '700', color: colors.charcoal.dark, letterSpacing: -0.5, marginBottom: 12 },
  subtitle: { fontSize: 16, fontWeight: '400', color: `${colors.charcoal.DEFAULT}CC`, lineHeight: 24 },
  form: { width: '100%' },
  inputGroup: { width: '100%' },
  label: { fontSize: 14, fontWeight: '500', color: colors.charcoal.DEFAULT, marginBottom: 6 },
  inputWrapper: { position: 'relative', flexDirection: 'row', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 14, zIndex: 1 },
  input: { flex: 1, height: 48, paddingLeft: 44, paddingRight: 16, backgroundColor: colors.ivory.shade, borderRadius: 12, fontSize: 16, color: colors.charcoal.DEFAULT, borderWidth: 1, borderColor: colors.ivory.border },
  passwordInput: { paddingRight: 44 },
  eyeButton: { position: 'absolute', right: 12, padding: 4 },
  termsContainer: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkbox: { paddingTop: 2 },
  checkboxBox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: colors.ivory.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.ivory.shade },
  checkboxBoxChecked: { backgroundColor: colors.primary.DEFAULT, borderColor: colors.primary.DEFAULT },
  termsText: { flex: 1, fontSize: 14, lineHeight: 21, color: `${colors.charcoal.DEFAULT}CC` },
  termsLink: { fontWeight: '600', color: colors.burgundy.DEFAULT },
  registerButton: { width: '100%', height: 48, backgroundColor: colors.primary.DEFAULT, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary.DEFAULT, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 },
  registerButtonDisabled: { opacity: 0.7 },
  registerButtonText: { color: isDarkMode ? colors.charcoal.dark : '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  loginLinkSection: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 20 },
  loginLinkText: { fontSize: 14, color: `${colors.charcoal.DEFAULT}CC` },
  loginLink: { fontSize: 14, fontWeight: '600', color: colors.burgundy.DEFAULT },
});

export default RegisterScreen;
