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
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import {ThemeColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';
import {RegisterScreenProps} from '../navigation/AppNavigator';
import {useAuth} from '../contexts/AuthContext';
import {t} from '../locales/i18n';
import * as WebBrowser from 'expo-web-browser';
import {isValidEmail} from '../utils/validation';

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

  // Errores inline
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [termsError, setTermsError] = useState('');

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
    setFullNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setTermsError('');
    let hasError = false;

    if (!fullName) { 
      setFullNameError(t('auth.errors.emptyName')); 
      hasError = true; 
    }
    
    if (!email) { 
      setEmailError(t('auth.errors.emailRequired')); 
      hasError = true; 
    } else if (!isValidEmail(email)) {
      setEmailError(t('auth.errors.invalidEmail'));
      hasError = true;
    }
    
    if (!password) { 
      setPasswordError(t('auth.errors.passwordRequired')); 
      hasError = true; 
    } else if (password.length < 8) {
      setPasswordError(t('auth.errors.shortPassword'));
      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError(t('auth.errors.passwordRequired'));
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError(t('auth.errors.passwordsDoNotMatch'));
      hasError = true;
    }

    if (!acceptedTerms) {
      setTermsError(t('auth.errors.acceptTerms'));
      hasError = true;
    }

    if (hasError) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);
    try {
      await register({ email, password, fullName });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      const serverMessage = error.message || '';
      let displayTitle = t('general.error');
      let displayMessage = t('auth.errors.networkError');

      if (serverMessage.toLowerCase().includes('exists') || serverMessage.toLowerCase().includes('ya existe')) {
        displayTitle = t('auth.errors.accountExistsTitle');
        displayMessage = t('auth.errors.userExists');
      } else {
        // Limpieza genérica para otros errores
        displayMessage = serverMessage.replace(/^Error:?\s*/i, '');
        displayMessage = displayMessage.replace(/^Error en registro:?\s*/i, '');
      }
      
      Toast.show({
        type: 'error',
        text1: displayTitle,
        text2: displayMessage,
      });
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
                    <Text style={[styles.label, fullNameError ? styles.labelError : null]}>{t('auth.fullNameLabel')}</Text>
                    <View style={[styles.inputWrapper, fullNameError ? styles.inputError : null]}>
                      <MaterialIcons name="person" size={20} color={fullNameError ? colors.burgundy.DEFAULT : colors.gold.dim} style={styles.inputIcon} />
                      <TextInput
                        ref={fullNameRef}
                        style={styles.input}
                        placeholder="John Doe"
                        placeholderTextColor={isDarkMode ? colors.charcoal.muted : `${colors.charcoal.muted}80`}
                        value={fullName}
                        onChangeText={(t) => { setFullName(t); if(fullNameError) setFullNameError(''); }}
                        autoCapitalize="words"
                        returnKeyType="next"
                        onSubmitEditing={() => emailRef.current?.focus()}
                        blurOnSubmit={false}
                      />
                    </View>
                    {fullNameError ? <Text style={styles.errorText}>{fullNameError}</Text> : null}
                  </View>

                  {/* Email Input */}
                  <View style={[styles.inputGroup, {marginBottom: dynamicStyles.inputGroupMarginBottom}]}>
                    <Text style={[styles.label, emailError ? styles.labelError : null]}>{t('auth.emailLabel')}</Text>
                    <View style={[styles.inputWrapper, emailError ? styles.inputError : null]}>
                      <MaterialIcons name="mail" size={20} color={emailError ? colors.burgundy.DEFAULT : colors.gold.dim} style={styles.inputIcon} />
                      <TextInput
                        ref={emailRef}
                        style={styles.input}
                        placeholder="your@email.com"
                        placeholderTextColor={isDarkMode ? colors.charcoal.muted : `${colors.charcoal.muted}80`}
                        value={email}
                        onChangeText={(t) => { setEmail(t); if(emailError) setEmailError(''); }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        returnKeyType="next"
                        onSubmitEditing={() => passwordRef.current?.focus()}
                        blurOnSubmit={false}
                      />
                    </View>
                    {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                  </View>

                  {/* Password Input */}
                  <View style={[styles.inputGroup, {marginBottom: dynamicStyles.inputGroupMarginBottom}]}>
                    <Text style={[styles.label, passwordError ? styles.labelError : null]}>{t('auth.passwordLabel')}</Text>
                    <View style={[styles.inputWrapper, passwordError ? styles.inputError : null]}>
                      <MaterialIcons name="lock" size={20} color={passwordError ? colors.burgundy.DEFAULT : colors.gold.dim} style={styles.inputIcon} />
                      <TextInput
                        ref={passwordRef}
                        style={[styles.input, styles.passwordInput]}
                        placeholder="••••••••"
                        placeholderTextColor={isDarkMode ? colors.charcoal.muted : `${colors.charcoal.muted}80`}
                        value={password}
                        onChangeText={(t) => { setPassword(t); if(passwordError) setPasswordError(''); }}
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
                    {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                  </View>

                  {/* Confirm Password Input */}
                  <View style={[styles.inputGroup, {marginBottom: dynamicStyles.inputGroupMarginBottom}]}>
                    <Text style={[styles.label, confirmPasswordError ? styles.labelError : null]}>{t('auth.passwordLabel')}</Text>
                    <View style={[styles.inputWrapper, confirmPasswordError ? styles.inputError : null]}>
                      <MaterialIcons name="lock-reset" size={20} color={confirmPasswordError ? colors.burgundy.DEFAULT : colors.gold.dim} style={styles.inputIcon} />
                      <TextInput
                        ref={confirmPasswordRef}
                        style={[styles.input, styles.passwordInput]}
                        placeholder="••••••••"
                        placeholderTextColor={isDarkMode ? colors.charcoal.muted : `${colors.charcoal.muted}80`}
                        value={confirmPassword}
                        onChangeText={(t) => { setConfirmPassword(t); if(confirmPasswordError) setConfirmPasswordError(''); }}
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
                    {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
                  </View>

                  <View style={[styles.termsContainer, {marginTop: dynamicStyles.termsMarginTop}]}>
                    <TouchableOpacity style={styles.checkbox} onPress={() => { setAcceptedTerms(!acceptedTerms); if(termsError) setTermsError(''); }} activeOpacity={0.7}>
                      <View style={[styles.checkboxBox, acceptedTerms && styles.checkboxBoxChecked, termsError && !acceptedTerms ? styles.checkboxBoxError : null]}>
                        {acceptedTerms && <MaterialIcons name="check" size={18} color="#FFFFFF" />}
                      </View>
                    </TouchableOpacity>
                    <View style={{flex: 1}}>
                      <Text style={styles.termsText}>
                        Accept {' '}
                        <Text style={styles.termsLink} onPress={openTerms}>Terms</Text> 
                        {' '} and {' '} 
                        <Text style={styles.termsLink} onPress={openPrivacy}>Privacy Policy</Text>.
                      </Text>
                      {termsError ? <Text style={styles.errorText}>{termsError}</Text> : null}
                    </View>
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
  label: { fontSize: 10, fontWeight: '700', color: colors.charcoal.DEFAULT, letterSpacing: 1.2, marginBottom: 6, marginLeft: 4, textTransform: 'uppercase' },
  labelError: { color: colors.burgundy.DEFAULT },
  inputWrapper: { position: 'relative', flexDirection: 'row', alignItems: 'center', backgroundColor: colors.ivory.shade, borderRadius: 12, borderWidth: 1, borderColor: colors.ivory.border },
  inputIcon: { position: 'absolute', left: 14, zIndex: 1 },
  input: { flex: 1, height: 48, paddingLeft: 44, paddingRight: 16, fontSize: 16, color: colors.charcoal.DEFAULT },
  inputError: { borderColor: colors.burgundy.DEFAULT, borderWidth: 1.5 },
  passwordInput: { paddingRight: 44 },
  errorText: { fontSize: 11, color: colors.burgundy.DEFAULT, marginTop: 4, marginLeft: 4, fontWeight: '700', textTransform: 'uppercase' },
  eyeButton: { position: 'absolute', right: 12, padding: 4 },
  termsContainer: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkbox: { paddingTop: 2 },
  checkboxBox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: colors.ivory.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.ivory.shade },
  checkboxBoxChecked: { backgroundColor: colors.primary.DEFAULT, borderColor: colors.primary.DEFAULT },
  checkboxBoxError: { borderColor: colors.burgundy.DEFAULT },
  termsText: { fontSize: 14, lineHeight: 21, color: `${colors.charcoal.DEFAULT}CC` },
  termsLink: { fontWeight: '600', color: colors.burgundy.DEFAULT },
  registerButton: { width: '100%', height: 48, backgroundColor: colors.primary.DEFAULT, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary.DEFAULT, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 },
  registerButtonDisabled: { opacity: 0.7 },
  registerButtonText: { color: isDarkMode ? colors.charcoal.dark : '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  loginLinkSection: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 20 },
  loginLinkText: { fontSize: 14, color: `${colors.charcoal.DEFAULT}CC` },
  loginLink: { fontSize: 14, fontWeight: '600', color: colors.burgundy.DEFAULT },
});

export default RegisterScreen;
