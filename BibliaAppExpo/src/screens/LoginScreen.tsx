import React, {useState} from 'react';
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
} from 'react-native';
import {MaterialIcons, AntDesign} from '@expo/vector-icons';
import {ThemeColors} from '../theme/colors';
import {LoginScreenProps} from '../navigation/AppNavigator';
import {useAuth} from '../contexts/AuthContext';
import {useTheme} from '../contexts/ThemeContext';

const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {
  const {height} = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { colors, isDarkMode, toggleTheme } = useTheme();
  const styles = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);

  const { login } = useAuth();

  // Calcular espaciados dinámicos basados en la altura de pantalla
  // Para pantallas más pequeñas, reducir espacios proporcionalmente
  const scaleFactor = Math.min(height / 800, 1);

  const dynamicStyles = {
    headerPaddingTop: 48 * scaleFactor,
    logoMarginTop: 16 * scaleFactor,
    logoMarginBottom: 32 * scaleFactor,
    logoContainerMarginBottom: 24 * scaleFactor,
    inputGroupMarginBottom: 20 * scaleFactor,
    dividerMarginVertical: 24 * scaleFactor,
    socialButtonsGap: 12 * scaleFactor,
    registerMarginTop: 16 * scaleFactor, // Espacio con botones sociales (reducido para acercar)
  };

  const handleLogin = async () => {
    // ✅ Validación: email y password deben estar completos
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    try {
      // ✅ CONECTADO A API: Llamada real al backend
      await login({ email, password });
      // Navegación automática si el login es exitoso
      navigation.navigate('MainTabs');
    } catch (error: any) {
      console.error('Error en login:', error);
      Alert.alert(
        'Error de inicio de sesión',
        error.message || 'No se pudo iniciar sesión. Verifica tus credenciales.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = () => {
    Alert.alert('Apple Sign In', 'Funcionalidad en desarrollo');
  };

  const handleGoogleLogin = () => {
    Alert.alert('Google Sign In', 'Funcionalidad en desarrollo');
  };

  const handleForgotPassword = () => {
    Alert.alert('Recuperar Contraseña', 'Funcionalidad en desarrollo');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleBack = () => {
    Alert.alert('Volver', 'Funcionalidad en desarrollo');
  };

  const handleHelp = () => {
    Alert.alert('Ayuda', 'Funcionalidad en desarrollo');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.innerContainer}>
        {/* Header */}
        <View style={[styles.header, {paddingTop: dynamicStyles.headerPaddingTop}]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}>
          </TouchableOpacity>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 16}}>
            <TouchableOpacity onPress={toggleTheme} activeOpacity={0.7}>
              <MaterialIcons name={isDarkMode ? "light-mode" : "dark-mode"} size={24} color={colors.charcoal.dark} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleHelp} activeOpacity={0.7}>
              <Text style={styles.helpText}>Ayuda</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.scrollView}>
          {/* Logo and Title */}
          <View style={[styles.logoSection, {
            marginTop: dynamicStyles.logoMarginTop,
            marginBottom: dynamicStyles.logoMarginBottom
          }]}>
            <Image
              source={require('../../assets/logo-transparent.png')}
              style={[styles.logoImage, {marginBottom: dynamicStyles.logoContainerMarginBottom}]}
              resizeMode="contain"
            />
            <Text style={styles.title}>Biblia Católica</Text>
            <Text style={styles.subtitle}>Inicio de Sesión</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={[styles.inputGroup, {marginBottom: dynamicStyles.inputGroupMarginBottom}]}>
              <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons
                  name="mail"
                  size={20}
                  color={colors.gold.dim}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="ejemplo@email.com"
                  placeholderTextColor={isDarkMode ? colors.charcoal.muted : `${colors.charcoal.muted}80`}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={[styles.inputGroup, {marginBottom: dynamicStyles.inputGroupMarginBottom}]}>
              <Text style={styles.label}>CONTRASEÑA</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons
                  name="lock"
                  size={20}
                  color={colors.gold.dim}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="••••••••"
                  placeholderTextColor={isDarkMode ? colors.charcoal.muted : `${colors.charcoal.muted}80`}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
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
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              activeOpacity={0.7}
              style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color={colors.charcoal.dark} />
              ) : (
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={[styles.divider, {marginVertical: dynamicStyles.dividerMarginVertical}]}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>O CONTINÚA CON</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialButtons}>
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={[styles.socialButton, styles.appleButton]}
                onPress={handleAppleLogin}
                activeOpacity={0.7}>
                <AntDesign name="apple" size={20} color={colors.charcoal.dark} />
                <Text style={styles.appleButtonText}>Continuar con Apple</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.socialButton, styles.googleButton]}
              onPress={handleGoogleLogin}
              activeOpacity={0.7}>
              <AntDesign name="google" size={20} color={colors.charcoal.dark} />
              <Text style={styles.googleButtonText}>Continuar con Google</Text>
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View style={[styles.registerSection, {marginTop: dynamicStyles.registerMarginTop}]}>
            <Text style={styles.registerText}>¿Aún no tienes cuenta? </Text>
            <TouchableOpacity onPress={handleRegister} activeOpacity={0.7}>
              <Text style={styles.registerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const getStyles = (colors: ThemeColors, isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? colors.background.dark : colors.ivory.DEFAULT,
  },
  innerContainer: {
    flex: 1,
    maxWidth: 450,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    marginLeft: -8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  helpText: {
    color: colors.burgundy.DEFAULT,
    fontSize: 14,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  logoImage: {
    width: 96,
    height: 96,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.charcoal.dark,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: isDarkMode ? colors.charcoal.muted : colors.charcoal.muted,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.charcoal.DEFAULT,
    letterSpacing: 1.2,
    marginBottom: 6,
    marginLeft: 4,
    opacity: isDarkMode ? 0.8 : 1,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 48,
    paddingLeft: 48,
    paddingRight: 16,
    backgroundColor: colors.ivory.shade,
    borderRadius: 12,
    fontSize: 16,
    color: colors.charcoal.DEFAULT,
    borderWidth: 1,
    borderColor: colors.ivory.border,
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
    fontStyle: 'italic',
    color: colors.burgundy.DEFAULT,
  },
  loginButton: {
    width: '100%',
    height: 48,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: isDarkMode ? colors.charcoal.dark : '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    opacity: 0.8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: isDarkMode ? colors.primary.light : colors.ivory.border,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: isDarkMode ? colors.charcoal.muted : colors.charcoal.muted,
    letterSpacing: 2.5,
    marginHorizontal: 16,
  },
  socialButtons: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24, // Official buttons are usually more rounded
    borderWidth: 1,
    gap: 12,
  },
  appleButton: {
    backgroundColor: isDarkMode ? colors.background.dark : colors.surface.light,
    borderColor: isDarkMode ? colors.primary.light : colors.ivory.border,
  },
  appleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.charcoal.dark,
  },
  googleButton: {
    backgroundColor: isDarkMode ? colors.background.dark : colors.surface.light,
    borderColor: isDarkMode ? colors.primary.light : colors.ivory.border,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.charcoal.dark,
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 32,
  },
  registerText: {
    fontSize: 14,
    color: isDarkMode ? colors.charcoal.muted : colors.charcoal.muted,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.burgundy.DEFAULT,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
