import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {colors} from '../theme/colors';
import {useAuth} from '../contexts/AuthContext';

type ProfileScreenProps = {
  navigation: any;
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({navigation}) => {
  const {user, logout} = useAuth();

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
              navigation.navigate('Auth');
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
      </View>

      {/* Contenido */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_lz0TfULdOGmbgvMICdhazJ9MCLeJdcRmmmNT_h433OT15oOFPTgAewtfnEy5iVWAYF7aI1TEBxC-HanVNS2JLeXNrISF9-OAqGRk50TO9Ih4-jduOLs_9R-fVfs26kJgjGuq3_i9zjzPnnw8xV--giTNFXrWqpqGSFhc6Z0nmX7C7NsUHLkQmPXAuyTv8JIJCDacbv5OoqPGTMphBDy1gA8z-e4UVkIgMA5jFwJdNQi4wrvI-UOSXxD-IWU5-OETgWropsOPCEN0',
              }}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.userName}>{user?.fullName || 'Usuario'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
        </View>

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
            <MaterialIcons name="chevron-right" size={24} color={colors.charcoal.muted} />
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
            <MaterialIcons name="chevron-right" size={24} color={colors.charcoal.muted} />
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
            <MaterialIcons name="chevron-right" size={24} color={colors.charcoal.muted} />
          </TouchableOpacity>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ivory.DEFAULT,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
    backgroundColor: colors.ivory.DEFAULT,
    borderBottomWidth: 1,
    borderBottomColor: colors.ivory.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
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
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.ivory.shade,
    borderWidth: 2,
    borderColor: `${colors.gold.DEFAULT}20`,
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
    backgroundColor: '#FFFFFF',
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
