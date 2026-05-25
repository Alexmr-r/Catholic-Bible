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
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {MaterialIcons, AntDesign} from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import {ThemeColors} from '../theme/colors';
import {LoginScreenProps} from '../navigation/AppNavigator';
import {useAuth} from '../contexts/AuthContext';
import {useTheme} from '../contexts/ThemeContext';
import {t} from '../locales/i18n';
import {isValidEmail} from '../utils/validation';

// Configurar Google Sign In
GoogleSignin.configure({
  offlineAccess: true,
  webClientId: '1055569033141-9l6tnmaugo5tbco40si0kc9qt887ion2.apps.googleusercontent.com',
  iosClientId: '1055569033141-8ol7lvhvgn445bfgcha7l74e7kjsshcr.apps.googleusercontent.com',
});

const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {
  const {height} = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Errores inline
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Refs para navegar con Enter
  const passwordRef = useRef<TextInput>(null);

  const { colors, isDarkMode, toggleTheme } = useTheme();
  const styles = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);

  const { login, loginWithGoogle, loginWithApple } = useAuth();
  const scaleFactor = Math.min(height / 800, 1);

  const dynamicStyles = {
    headerPaddingTop: 48 * scaleFactor,
    logoMarginTop: 10 * scaleFactor,
    logoMarginBottom: 32 * scaleFactor,
    logoSize: 160 * scaleFactor, // Aumentamos tamaño a 160
    logoContainerMarginBottom: 0 * scaleFactor,
    inputGroupMarginBottom: 20 * scaleFactor,
    dividerMarginVertical: 24 * scaleFactor,
    socialButtonsGap: 12 * scaleFactor,
    registerMarginTop: 16 * scaleFactor,
  };

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');
    let hasError = false;

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
    }

    if (hasError) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);
    try {
      await login({ email, password });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      const serverMessage = error.message || '';
      let displayTitle = t('auth.errors.loginTitle');
      let displayMessage = t('auth.errors.invalidCredentials');

      if (serverMessage.toLowerCase().includes('password') || serverMessage.toLowerCase().includes('contraseña')) {
        displayMessage = t('auth.errors.invalidCredentials');
      } else if (serverMessage.toLowerCase().includes('not found') || serverMessage.toLowerCase().includes('no encontrado')) {
        displayMessage = t('auth.errors.invalidCredentials'); // Por seguridad no decimos si el email existe
      } else {
        displayMessage = serverMessage.replace(/^Error:?\s*/i, '');
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

  const handleAppleLogin = async () => {
    try {
      setIsLoading(true);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        const fullName = credential.fullName 
          ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
          : undefined;
          
        await loginWithApple(credential.identityToken, fullName);
      } else {
        throw new Error('No se recibió token de Apple');
      }
    } catch (error: any) {
      const errorMsg = String(error?.message || error);
      if (
        error.code !== 'ERR_REQUEST_CANCELED' && 
        error.code !== 'ASWebAuthenticationSessionErrorCodeCanceledLogin' &&
        !errorMsg.toLowerCase().includes('cancel') &&
        !errorMsg.toLowerCase().includes('unknown reason')
      ) {
        console.error('Error Apple Login:', error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Toast.show({
          type: 'error',
          text1: t('general.error') || 'Error',
          text2: t('auth.errors.appleLoginFailed') || 'Apple sign-in failed',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn() as any;
      
      if (response.type === 'success') {
        const idToken = response.data?.idToken || (response as any).idToken;
        if (idToken) {
          await loginWithGoogle(idToken);
        } else {
          throw new Error('No se recibió idToken de Google');
        }
      } else if (response.type === 'cancelled' || response.type === 'cancel') {
        console.log('Google login cancelled by user');
      } else if (!response.type && response.data?.idToken) {
        // Fallback p/ obj viejo v15
        await loginWithGoogle(response.data.idToken);
      } else {
        throw new Error('No se recibió idToken de Google');
      }
    } catch (error: any) {
      const errorMsg = String(error?.message || error);
      if (
        error.code === statusCodes.SIGN_IN_CANCELLED || 
        error.code === statusCodes.IN_PROGRESS ||
        errorMsg.toLowerCase().includes('cancel') ||
        errorMsg.toLowerCase().includes('12501') // commonly user canceled
      ) {
        // Usuario canceló silenciosamente
        console.log('Google login cancelled by user');
      } else {
        console.error('Error Google Login:', error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Toast.show({
          type: 'error',
          text1: t('general.error') || 'Error',
          text2: t('auth.errors.googleLoginFailed') || 'Google sign-in failed',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleForgotPassword = () => navigation.navigate('ForgotPassword');
  const handleRegister = () => navigation.navigate('Register');

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.innerContainer}>
          {/* Header */}
          <View style={[styles.header, {paddingTop: dynamicStyles.headerPaddingTop, justifyContent: 'flex-end'}]}>
            <TouchableOpacity onPress={toggleTheme} activeOpacity={0.7}>
              <MaterialIcons name={isDarkMode ? "light-mode" : "dark-mode"} size={24} color={colors.charcoal.dark} />
            </TouchableOpacity>
          </View>

          <View style={styles.scrollView}>
            <View style={styles.centerGroup}>
              <View style={[styles.logoSection, {
                marginTop: dynamicStyles.logoMarginTop,
                marginBottom: dynamicStyles.logoMarginBottom
              }]}>
                <Image
                  source={require('../../assets/logo-transparent.png')}
                  style={[
                    styles.logoImage, 
                    {
                      width: dynamicStyles.logoSize, 
                      height: dynamicStyles.logoSize,
                      marginBottom: dynamicStyles.logoContainerMarginBottom
                    }
                  ]}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.form}>
                {/* Email Input */}
                <View style={[styles.inputGroup, {marginBottom: dynamicStyles.inputGroupMarginBottom}]}>
                  <Text style={[styles.label, emailError ? styles.labelError : null]}>{t('auth.emailLabel') || 'EMAIL'}</Text>
                  <View style={[styles.inputWrapper, emailError ? styles.inputError : null]}>
                    <MaterialIcons name="mail" size={20} color={emailError ? colors.burgundy.DEFAULT : colors.gold.dim} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder={t('auth.emailPlaceholder') || 'example@email.com'}
                      placeholderTextColor={isDarkMode ? colors.charcoal.muted : `${colors.charcoal.muted}80`}
                      value={email}
                      onChangeText={(text) => { setEmail(text); if (emailError) setEmailError(''); }}
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
                  <Text style={[styles.label, passwordError ? styles.labelError : null]}>{t('auth.passwordLabel') || 'PASSWORD'}</Text>
                  <View style={[styles.inputWrapper, passwordError ? styles.inputError : null]}>
                    <MaterialIcons name="lock" size={20} color={passwordError ? colors.burgundy.DEFAULT : colors.gold.dim} style={styles.inputIcon} />
                    <TextInput
                      ref={passwordRef}
                      style={[styles.input, styles.passwordInput]}
                      placeholder="••••••••"
                      placeholderTextColor={isDarkMode ? colors.charcoal.muted : `${colors.charcoal.muted}80`}
                      value={password}
                      onChangeText={(text) => { setPassword(text); if (passwordError) setPasswordError(''); }}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      returnKeyType="done"
                      onSubmitEditing={() => {
                          Keyboard.dismiss();
                          handleLogin();
                      }}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                      activeOpacity={0.7}>
                      <MaterialIcons
                        name={showPassword ? 'visibility' : 'visibility-off'}
                        size={20}
                        color={isDarkMode ? colors.primary.DEFAULT : colors.charcoal.muted}
                      />
                    </TouchableOpacity>
                  </View>
                  {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                </View>

                <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7} style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>{t('auth.forgotPassword') || 'Forgot Password?'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                  onPress={handleLogin}
                  activeOpacity={0.8}
                  disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator color={colors.charcoal.dark} />
                  ) : (
                    <Text style={styles.loginButtonText}>{t('auth.signInButton') || 'Sign In'}</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View style={[styles.divider, {marginVertical: dynamicStyles.dividerMarginVertical}]}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t('auth.orContinueWith') || 'OR CONTINUE WITH'}</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.socialButtons}>
                {Platform.OS === 'ios' && (
                  <TouchableOpacity style={[styles.socialButton, styles.appleButton]} onPress={handleAppleLogin} activeOpacity={0.7}>
                    <AntDesign name="apple" size={20} color={colors.charcoal.dark} />
                    <Text style={styles.appleButtonText}>{t('auth.continueApple') || 'Continue with Apple'}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.socialButton, styles.googleButton]} onPress={handleGoogleLogin} activeOpacity={0.7}>
                  <AntDesign name="google" size={20} color={colors.charcoal.dark} />
                  <Text style={styles.googleButtonText}>{t('auth.continueGoogle') || 'Continue with Google'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.registerSection, {marginTop: dynamicStyles.registerMarginTop}]}>
              <Text style={styles.registerText}>{t('auth.noAccount') || 'Dont have an account?'} </Text>
              <TouchableOpacity onPress={handleRegister} activeOpacity={0.7}>
                <Text style={styles.registerLink}>{t('auth.signUp') || 'Sign Up'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const getStyles = (colors: ThemeColors, isDarkMode: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDarkMode ? colors.background.dark : colors.ivory.DEFAULT },
  innerContainer: { flex: 1, maxWidth: 450, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 4 },
  scrollView: { flex: 1, paddingHorizontal: 32, justifyContent: 'space-between' },
  centerGroup: { flex: 1, justifyContent: 'center' },
  logoSection: { alignItems: 'center', marginTop: 8, marginBottom: 20 },
  logoImage: { width: 96, height: 96 }, // El valor base, pero ahora se sobreescribe dinámicamente
  title: { fontSize: 30, fontWeight: '700', color: colors.charcoal.dark, marginBottom: 4, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, fontWeight: '500', color: colors.charcoal.muted },
  form: { width: '100%' },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 10, fontWeight: '700', color: colors.charcoal.DEFAULT, letterSpacing: 1.2, marginBottom: 6, marginLeft: 4, opacity: isDarkMode ? 0.8 : 1 },
  labelError: { color: colors.burgundy.DEFAULT },
  inputWrapper: { position: 'relative', flexDirection: 'row', alignItems: 'center', backgroundColor: colors.ivory.shade, borderRadius: 12, borderWidth: 1, borderColor: colors.ivory.border },
  inputIcon: { position: 'absolute', left: 16, zIndex: 1 },
  input: { flex: 1, height: 48, paddingLeft: 48, paddingRight: 16, fontSize: 16, color: colors.charcoal.DEFAULT },
  inputError: { borderColor: colors.burgundy.DEFAULT, borderWidth: 1.5 },
  passwordInput: { paddingRight: 48 },
  errorText: { fontSize: 11, color: colors.burgundy.DEFAULT, marginTop: 4, marginLeft: 4, fontWeight: '700', textTransform: 'uppercase' },
  eyeButton: { position: 'absolute', right: 16, padding: 4 },
  forgotPassword: { alignSelf: 'flex-end', marginBottom: 8 },
  forgotPasswordText: { fontSize: 14, fontWeight: '500', fontStyle: 'italic', color: colors.burgundy.DEFAULT },
  loginButton: { width: '100%', height: 48, backgroundColor: colors.primary.DEFAULT, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8, shadowColor: colors.primary.DEFAULT, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 },
  loginButtonDisabled: { opacity: 0.7 },
  loginButtonText: { color: isDarkMode ? colors.charcoal.dark : '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, opacity: 0.8 },
  dividerLine: { flex: 1, height: 1, backgroundColor: isDarkMode ? colors.primary.light : colors.ivory.border },
  dividerText: { fontSize: 10, fontWeight: '700', color: colors.charcoal.muted, letterSpacing: 2.5, marginHorizontal: 16 },
  socialButtons: { flexDirection: 'column', gap: 10, marginBottom: 16 },
  socialButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 24, borderWidth: 1, gap: 12 },
  appleButton: { backgroundColor: isDarkMode ? colors.background.dark : colors.surface.light, borderColor: isDarkMode ? colors.primary.light : colors.ivory.border },
  appleButtonText: { fontSize: 16, fontWeight: '600', color: colors.charcoal.dark },
  googleButton: { backgroundColor: isDarkMode ? colors.background.dark : colors.surface.light, borderColor: isDarkMode ? colors.primary.light : colors.ivory.border },
  googleButtonText: { fontSize: 16, fontWeight: '600', color: colors.charcoal.dark },
  registerSection: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 32 },
  registerText: { fontSize: 14, color: colors.charcoal.muted },
  registerLink: { fontSize: 14, fontWeight: '700', color: colors.burgundy.DEFAULT, textDecorationLine: 'underline' },
});

export default LoginScreen;
