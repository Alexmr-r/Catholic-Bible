import React, {useState, useRef} from 'react';
import {
  View,
  Text,
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
  Pressable,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {ThemeColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';
import {RegisterScreenProps} from '../navigation/AppNavigator';
import {useAuth} from '../contexts/AuthContext';

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

  // Calcular espaciados dinámicos basados en la altura de pantalla
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
    // ✅ Validación: todos los campos deben estar completos
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (!acceptedTerms) {
      Alert.alert('Error', 'Debes aceptar los términos y condiciones');
      return;
    }

    setIsLoading(true);
    try {
      // ✅ CONECTADO A API: Llamada real al backend
      await register({ email, password, fullName });
      // Navegación automática si el registro es exitoso
      navigation.navigate('MainTabs');
    } catch (error: any) {
      console.error('Error en registro:', error);
      Alert.alert(
        'Error de registro',
        error.message || 'No se pudo crear la cuenta. Inténtalo de nuevo.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <Pressable style={styles.container} onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        style={styles.fullHeight}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.innerContainer}>
        {/* Header */}
        <View style={[styles.header, {paddingTop: dynamicStyles.headerPaddingTop}]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={24} color={colors.charcoal.DEFAULT} />
          </TouchableOpacity>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          {/* Icon and Title */}
          <View style={styles.topSection}>
            <View style={[styles.iconContainer, {
              marginTop: dynamicStyles.iconMarginTop,
              marginBottom: dynamicStyles.iconMarginBottom
            }]}>
              <MaterialIcons name="menu-book" size={32} color={colors.gold.DEFAULT} />
            </View>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={[styles.subtitle, {marginBottom: dynamicStyles.titleMarginBottom}]}>
              Únete a nuestra comunidad de fe y comienza tu lectura diaria.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Full Name Input */}
            <View style={[styles.inputGroup, {marginBottom: dynamicStyles.inputGroupMarginBottom}]}>
              <Text style={styles.label}>Nombre completo</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons
                  name="person"
                  size={20}
                  color={colors.gold.dim}
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={fullNameRef}
                  style={styles.input}
                  placeholder="Tu nombre"
                  placeholderTextColor={isDarkMode ? colors.charcoal.muted : `${colors.charcoal.muted}80`}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={[styles.inputGroup, {marginBottom: dynamicStyles.inputGroupMarginBottom}]}>
              <Text style={styles.label}>Correo electrónico</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons
                  name="mail"
                  size={20}
                  color={colors.gold.dim}
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={emailRef}
                  style={styles.input}
                  placeholder="ejemplo@email.com"
                  placeholderTextColor={isDarkMode ? colors.charcoal.muted : `${colors.charcoal.muted}80`}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={[styles.inputGroup, {marginBottom: dynamicStyles.inputGroupMarginBottom}]}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons
                  name="lock"
                  size={20}
                  color={colors.gold.dim}
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={passwordRef}
                  style={[styles.input, styles.passwordInput]}
                   placeholder="Ingresa tu contraseña"
                  placeholderTextColor={isDarkMode ? colors.charcoal.muted : `${colors.charcoal.muted}80`}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => confirmPasswordRef.current?.focus()}
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
              <Text style={styles.label}>Confirmar Contraseña</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons
                  name="lock-reset"
                  size={20}
                  color={colors.gold.dim}
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={confirmPasswordRef}
                  style={[styles.input, styles.passwordInput]}
                   placeholder="Repite tu contraseña"
                  placeholderTextColor={isDarkMode ? colors.charcoal.muted : `${colors.charcoal.muted}80`}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={() => Keyboard.dismiss()}
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

            {/* Terms and Conditions */}
            <View style={[styles.termsContainer, {marginTop: dynamicStyles.termsMarginTop}]}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setAcceptedTerms(!acceptedTerms)}
                activeOpacity={0.7}>
                <View style={[styles.checkboxBox, acceptedTerms && styles.checkboxBoxChecked]}>
                  {acceptedTerms && (
                    <MaterialIcons name="check" size={18} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
              <Text style={styles.termsText}>
                Acepto los <Text style={styles.termsLink}>Términos</Text> y la{' '}
                <Text style={styles.termsLink}>Política de Privacidad</Text>.
              </Text>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, {marginTop: dynamicStyles.buttonMarginTop}, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              activeOpacity={0.8}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.registerButtonText}>Registrarse</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={[styles.loginLinkSection, {marginTop: dynamicStyles.loginLinkMarginTop}]}>
            <Text style={styles.loginLinkText}>¿Ya tienes una cuenta? </Text>
            <TouchableOpacity onPress={handleLogin} activeOpacity={0.7}>
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
    </Pressable>
  );
};

const getStyles = (colors: ThemeColors, isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? colors.background.dark : colors.ivory.DEFAULT,
  },
  fullHeight: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
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
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  topSection: {
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: isDarkMode ? `${colors.primary.DEFAULT}20` : `${colors.gold.DEFAULT}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.charcoal.dark,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: `${colors.charcoal.DEFAULT}CC`,
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.charcoal.DEFAULT,
    marginBottom: 6,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 48,
    paddingLeft: 44,
    paddingRight: 16,
    backgroundColor: colors.ivory.shade,
    borderRadius: 12,
    fontSize: 16,
    color: colors.charcoal.DEFAULT,
    borderWidth: 1,
    borderColor: colors.ivory.border,
  },
  passwordInput: {
    paddingRight: 44,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    paddingTop: 2,
  },
  checkboxBox: {
    width: 24, // ✅ Aumentado de 16 a 24
    height: 24, // ✅ Aumentado de 16 a 24
    borderRadius: 6, // ✅ Aumentado de 4 a 6
    borderWidth: 2, // ✅ Aumentado de 1 a 2 para mejor visibilidad
    borderColor: colors.ivory.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ivory.shade, // usa el mismo fondo que los inputs
  },
  checkboxBoxChecked: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: `${colors.charcoal.DEFAULT}CC`,
  },
  termsLink: {
    fontWeight: '600',
    color: colors.burgundy.DEFAULT,
  },
  registerButton: {
    width: '100%',
    height: 48,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: isDarkMode ? colors.charcoal.dark : '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loginLinkSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  loginLinkText: {
    fontSize: 14,
    color: `${colors.charcoal.DEFAULT}CC`,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.burgundy.DEFAULT,
  },
});

export default RegisterScreen;

