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
import * as ImagePicker from 'expo-image-picker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => getStyles(colors, isDarkMode, insets.top), [colors, isDarkMode, insets.top]);
  const {user, refreshAuth, profilePhoto, updateProfilePhoto} = useAuth();

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
      'Elige una opción',
      [
        {
          text: 'Tomar Foto', 
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
            });
            if (!result.canceled && result.assets[0].uri) {
              await updateProfilePhoto(result.assets[0].uri);
            }
          }
        },
        {
          text: 'Elegir de Galería', 
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permiso denegado', 'Se necesita acceso a la galería');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
            });
            if (!result.canceled && result.assets[0].uri) {
              await updateProfilePhoto(result.assets[0].uri);
            }
          }
        },
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
          <MaterialIcons name="arrow-back" size={24} color={colors.charcoal.dark} />
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
              <View style={styles.avatar}>
                {profilePhoto ? (
                  <Image source={{ uri: profilePhoto }} style={{ width: '100%', height: '100%', borderRadius: 48 }} />
                ) : (
                  <Text style={styles.avatarInitials}>
                    {(user?.fullName || 'U').split(' ').map(n => n.charAt(0).toUpperCase()).slice(0, 2).join('')}
                  </Text>
                )}
              </View>
            </View>

            {/* Camera Button */}
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={handleChangePhoto}
              activeOpacity={0.7}>
              <MaterialIcons name="edit" size={18} color={isDarkMode ? colors.background.dark : '#FFFFFF'} />
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
            <MaterialIcons name="arrow-forward" size={24} color={colors.charcoal.muted} />
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

const getStyles = (colors: ThemeColors, isDarkMode: boolean, safeTop: number) => StyleSheet.create({
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDarkMode ? colors.primary.DEFAULT : colors.primary.DEFAULT,
    borderRadius: 48,
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: '700',
    color: isDarkMode ? colors.charcoal.dark : '#FFFFFF',
    letterSpacing: 1,
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
