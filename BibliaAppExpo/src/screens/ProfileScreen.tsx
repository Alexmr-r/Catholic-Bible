import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {MaterialIcons} from '@expo/vector-icons';
import {ThemeColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNetwork} from '../contexts/NetworkContext';
import {Switch} from 'react-native';

type ProfileScreenProps = {
  navigation: any;
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({navigation}) => {
  const {user, logout, profilePhoto, updateProfilePhoto} = useAuth();
  const { colors, isDarkMode } = useTheme();
  const { isForcedOffline, setForcedOffline, isServerAvailable, isConnected, isBibleDownloaded, isInternetReachable } = useNetwork();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => getStyles(colors, isDarkMode, insets.top), [colors, isDarkMode, insets.top]);

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar sesión. Intenta de nuevo.');
            }
          },
        },
      ]
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSettingsPress = () => {
    navigation.navigate('ReadingSettings');
  };

  const handleAccountPress = () => {
    navigation.navigate('Account');
  };

  const handleGuidePress = () => {
    navigation.navigate('HelpSupport');
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
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Contenido */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Profile Section */}
        <TouchableOpacity 
          style={styles.profileSection} 
          onPress={handleChangePhoto}
          activeOpacity={0.8}>
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
            <View style={styles.avatarBadge}>
              <MaterialIcons name="edit" size={14} color={isDarkMode ? colors.background.dark : '#FFFFFF'} />
            </View>
          </View>
          <Text style={styles.userName}>{user?.fullName || 'Usuario'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {/* Ajustes de Lectura */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleSettingsPress}
            activeOpacity={0.7}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="menu-book" size={28} color={colors.gold.DEFAULT} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.menuTitle}>Ajustes de Lectura</Text>
              <Text style={styles.menuSubtitle}>Tamaño de letra y temas</Text>
            </View>
            <MaterialIcons name="arrow-forward" size={24} color={colors.charcoal.muted} />
          </TouchableOpacity>

          {/* Mi Cuenta */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleAccountPress}
            activeOpacity={0.7}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="person" size={28} color={colors.gold.DEFAULT} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.menuTitle}>Mi Cuenta</Text>
              <Text style={styles.menuSubtitle}>Datos personales y perfil</Text>
            </View>
            <MaterialIcons name="arrow-forward" size={24} color={colors.charcoal.muted} />
          </TouchableOpacity>

          {/* Guía y Soporte */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleGuidePress}
            activeOpacity={0.7}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="help-outline" size={28} color={colors.gold.DEFAULT} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.menuTitle}>Guía y Soporte</Text>
              <Text style={styles.menuSubtitle}>Centro de asistencia</Text>
            </View>
            <MaterialIcons name="arrow-forward" size={24} color={colors.charcoal.muted} />
          </TouchableOpacity>

          {/* MODO OFFLINE (Nuevo) */}
          <View style={[styles.menuItem, { justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={[styles.iconContainer, { backgroundColor: isForcedOffline ? `${colors.burgundy.DEFAULT}20` : `${colors.gold.DEFAULT}20` }]}>
                <MaterialIcons 
                  name={isForcedOffline ? "cloud-off" : "cloud-done"} 
                  size={28} 
                  color={isForcedOffline ? colors.burgundy.DEFAULT : colors.gold.DEFAULT} 
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.menuTitle}>Modo Sin Conexión</Text>
                <Text style={[styles.menuSubtitle, { color: colors.charcoal.DEFAULT }]}>
                  {isForcedOffline 
                    ? 'Modo sin conexión activo' 
                    : isConnected 
                      ? (isServerAvailable ? 'En línea • Sincronizado' : 'En línea • Conectando...') 
                      : (isConnected === false && !isForcedOffline)
                        ? 'Sin conexión a internet'
                        : 'Desconectado'}
                </Text>
              </View>
            </View>
            <Switch
              value={isForcedOffline}
              onValueChange={(value) => {
                if (value && !isBibleDownloaded) {
                  Alert.alert(
                    'Biblia no descargada',
                    'Para activar el modo offline necesitas descargar la Biblia primero.',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      { 
                        text: 'Ir a Descargas', 
                        onPress: () => navigation.navigate('ManageDownloads', { returnTo: 'Profile' } as never) 
                      },
                    ]
                  );
                  return;
                }

                // Si intentan apagarlo pero FÍSICAMENTE no hay internet o el servidor no responde
                if (!value && (!isConnected || !isServerAvailable)) {
                  Alert.alert(
                    'Requiere conexión',
                    'Vuelve a tener conexión a internet para poder desactivar el modo sin conexión.',
                    [{ text: 'Entendido', style: 'default' }]
                  );
                  return;
                }

                setForcedOffline(value);
              }}
              trackColor={{ false: '#D1D5DB', true: colors.burgundy.DEFAULT }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const getStyles = (colors: ThemeColors, isDarkMode: boolean, safeTop: number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? colors.background.dark : colors.ivory.DEFAULT,
  },
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },

  // Profile Section
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: isDarkMode ? colors.primary.DEFAULT : colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: isDarkMode ? `${colors.primary.DEFAULT}40` : `${colors.gold.DEFAULT}40`,
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: '700',
    color: isDarkMode ? colors.charcoal.dark : '#FFFFFF',
    letterSpacing: 1,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary.DEFAULT,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: isDarkMode ? colors.background.dark : colors.ivory.DEFAULT,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.charcoal.dark,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.charcoal.muted,
  },

  // Menu Container
  menuContainer: {
    gap: 12,
    marginBottom: 40,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? colors.paper : '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.ivory.border,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${colors.gold.DEFAULT}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.charcoal.dark,
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.charcoal.muted,
  },

  // Logout Button
  logoutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.burgundy.DEFAULT,
    letterSpacing: 0.3,
  },
});

export default ProfileScreen;
