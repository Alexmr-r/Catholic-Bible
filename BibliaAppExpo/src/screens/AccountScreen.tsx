/**
 * ==========================================
 * ACCOUNT SCREEN (Mi Cuenta)
 * ==========================================
 * Pantalla de edición de perfil de usuario
 * Basada en el diseño HTML de referencia
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {ThemeColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import {apiClient} from '../services/api.client';

type AccountScreenProps = {
  navigation: any;
};

const AccountScreen: React.FC<AccountScreenProps> = ({navigation}) => {
  const { colors, isDarkMode } = useTheme();
  const styles = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);
  const {user, refreshAuth} = useAuth();

  // Estados del formulario
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Cargar datos del usuario
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      // Refrescar datos del usuario desde la API
      await refreshAuth();

      if (user) {
        setFullName(user.fullName);
        setEmail(user.email);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleChangePhoto = () => {
    Alert.alert(
      'Cambiar Foto',
      'Funcionalidad de cambio de foto de perfil',
      [
        {text: 'Tomar Foto', onPress: () => console.log('Tomar foto')},
        {text: 'Elegir de Galería', onPress: () => console.log('Galería')},
        {text: 'Cancelar', style: 'cancel'},
      ]
    );
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleSaveChanges = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'El nombre completo es requerido');
      return;
    }

    setIsSaving(true);
    try {
      // Llamar al endpoint de actualización de perfil
      await apiClient.put('/users/me', { fullName: fullName.trim() });

      Alert.alert(
        'Éxito',
        'Los cambios se guardaron correctamente',
        [
          {
            text: 'OK',
            onPress: () => {
              refreshAuth();
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error guardando cambios:', error);
      Alert.alert('Error', 'No se pudieron guardar los cambios. Intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar Cuenta',
      '¿Estás seguro de que deseas eliminar tu cuenta definitivamente? Esta acción no se puede deshacer.',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            // TODO: Implementar eliminación de cuenta
            console.log('Eliminar cuenta');
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.7}
          style={styles.backButton}>
          <MaterialIcons name="arrow-back-ios-new" size={24} color={colors.charcoal.DEFAULT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Cuenta</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Profile Photo Section */}
        <View style={styles.photoSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: user?.email
                    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=D4AF37&color=fff&size=200`
                    : 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_lz0TfULdOGmbgvMICdhazJ9MCLeJdcRmmmNT_h433OT15oOFPTgAewtfnEy5iVWAYF7aI1TEBxC-HanVNS2JLeXNrISF9-OAqGRk50TO9Ih4-jduOLs_9R-fVfs26kJgjGuq3_i9zjzPnnw8xV--giTNFXrWqpqGSFhc6Z0nmX7C7NsUHLkQmPXAuyTv8JIJCDacbv5OoqPGTMphBDy1gA8z-e4UVkIgMA5jFwJdNQi4wrvI-UOSXxD-IWU5-OETgWropsOPCEN0',
                }}
                style={styles.avatar}
              />
            </View>

            {/* Camera Button */}
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={handleChangePhoto}
              activeOpacity={0.7}>
              <MaterialIcons name="photo-camera" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>NOMBRE COMPLETO</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Tu nombre"
              placeholderTextColor="#CBD5E1"
              autoCapitalize="words"
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>CORREO ELECTRÓNICO</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={email}
              editable={false}
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#CBD5E1"
            />
          </View>

          {/* Change Password Button */}
          <TouchableOpacity
            style={styles.passwordButton}
            onPress={handleChangePassword}
            activeOpacity={0.7}>
            <View style={styles.passwordButtonLeft}>
              <MaterialIcons name="lock" size={24} color={colors.gold.DEFAULT} />
              <Text style={styles.passwordButtonText}>Cambiar Contraseña</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
          </TouchableOpacity>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSaveChanges}
            disabled={isSaving}
            activeOpacity={0.7}>
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Guardar Cambios</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Delete Account */}
        <View style={styles.deleteSection}>
          <TouchableOpacity onPress={handleDeleteAccount} activeOpacity={0.7}>
            <Text style={styles.deleteText}>Eliminar mi cuenta definitivamente</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const getStyles = (colors: ThemeColors, isDarkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? colors.background.dark : colors.ivory.DEFAULT,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDarkMode ? colors.background.dark : colors.ivory.DEFAULT,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingTop: 56,
    backgroundColor: isDarkMode ? colors.background.dark : colors.ivory.DEFAULT,
    borderBottomWidth: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'serif',
    color: colors.charcoal.DEFAULT,
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
    paddingTop: 16,
    paddingBottom: 48,
    maxWidth: 448,
    alignSelf: 'center',
    width: '100%',
  },

  // Photo Section
  photoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    shadowColor: colors.charcoal.DEFAULT,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: isDarkMode ? colors.primary.DEFAULT : `${colors.gold.DEFAULT}33`,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary.DEFAULT,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 2,
    borderColor: isDarkMode ? colors.background.dark : colors.ivory.DEFAULT,
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
    color: colors.charcoal.muted,
    letterSpacing: 2,
    marginLeft: 4,
  },
  input: {
    width: '100%',
    backgroundColor: isDarkMode ? colors.ivory.shade : '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.ivory.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.charcoal.DEFAULT,
  },
  inputDisabled: {
    backgroundColor: isDarkMode ? colors.background.dark : '#F8FAFC',
    color: colors.charcoal.muted,
  },

  // Password Button
  passwordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: isDarkMode ? colors.paper : '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.ivory.border,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.charcoal.DEFAULT,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginTop: 8,
  },
  passwordButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  passwordButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.charcoal.DEFAULT,
  },

  // Save Button
  saveButton: {
    backgroundColor: colors.primary.DEFAULT,
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: 'center',
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
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

  // Delete Section
  deleteSection: {
    marginTop: 48,
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 12,
    fontWeight: '300',
    color: colors.charcoal.muted,
  },
});

export default AccountScreen;
