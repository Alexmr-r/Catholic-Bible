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
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import {MaterialIcons} from '@expo/vector-icons';
import {ThemeColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import {useSubscription} from '../contexts/SubscriptionContext';
import {RootStackParamList} from '../navigation/AppNavigator';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNetwork} from '../contexts/NetworkContext';
import {Switch} from 'react-native';
import { t } from '../locales/i18n';
import PremiumAlertModal, { PremiumAlertAction } from '../components/PremiumAlertModal';

type ProfileScreenProps = {
  navigation: any;
};

const ProfileScreen: React.FC<ProfileScreenProps> = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {user, logout, profilePhoto, updateProfilePhoto} = useAuth();
  const { colors, isDarkMode } = useTheme();
  const { isPremium, isTrialActive } = useSubscription();
  const { isForcedOffline, setForcedOffline, isServerAvailable, isConnected, isBibleDownloaded, isInternetReachable } = useNetwork();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => getStyles(colors, isDarkMode, insets.top), [colors, isDarkMode, insets.top]);

  const [alertConfig, setAlertConfig] = React.useState<{
    visible: boolean;
    title: string;
    message: string;
    icon?: any;
    actions: PremiumAlertAction[];
  }>({
    visible: false,
    title: '',
    message: '',
    actions: []
  });

  const showPremiumAlert = (title: string, message: string, actions: PremiumAlertAction[], icon?: any) => {
    setAlertConfig({ visible: true, title, message, actions, icon });
  };

  const hidePremiumAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const handleLogout = async () => {
    showPremiumAlert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: hidePremiumAlert
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            hidePremiumAlert();
            try {
              await logout();
            } catch (error) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Could not log out. Try again.',
              });
            }
          },
        },
      ],
      'logout'
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
      'Change Photo',
      'Choose an option',
      [
        {
          text: 'Take Photo', 
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              Toast.show({
                type: 'error',
                text1: 'Permission denied',
                text2: 'Camera access is required',
              });
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
          text: 'Choose from Gallery', 
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              Toast.show({
                type: 'error',
                text1: 'Permission denied',
                text2: 'Gallery access is required',
              });
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
        {text: 'Cancel', style: 'cancel'},
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
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

        {/* Contenido */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Tarjeta VIP Ultra-Compacta */}
        {!isPremium && (
          <TouchableOpacity 
            style={[styles.vipCard, { 
              backgroundColor: isDarkMode ? '#1f1807' : '#fffdf5',
              borderColor: isDarkMode ? '#8c7324' : '#d4af37' 
            }]} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Paywall')}
          >
            <View style={styles.vipCardContent}>
              <MaterialIcons name="workspace-premium" size={20} color="#d4af37" />
              <View style={styles.vipCardText}>
                <Text style={[styles.vipCardTitle, { color: isDarkMode ? '#d4af37' : '#b8860b' }]}>Upgrade to Premium</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#d4af37" />
            </View>
          </TouchableOpacity>
        )}

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
          <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
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
              <Text style={styles.menuTitle}>Reading Settings</Text>
              <Text style={styles.menuSubtitle}>Font size and themes</Text>
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
              <Text style={styles.menuTitle}>My Account</Text>
              <Text style={styles.menuSubtitle}>Personal data and profile</Text>
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
              <Text style={styles.menuTitle}>Guide & Support</Text>
              <Text style={styles.menuSubtitle}>Assistance center</Text>
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
                <Text style={styles.menuTitle}>Offline Mode</Text>
                <Text style={[styles.menuSubtitle, { color: colors.charcoal.DEFAULT }]}>
                  {isForcedOffline 
                    ? 'Offline mode active' 
                    : isConnected 
                      ? (isServerAvailable ? 'Online • Synced' : 'Online • Connecting...') 
                      : (isConnected === false && !isForcedOffline)
                        ? 'No internet connection'
                        : 'Disconnected'}
                </Text>
              </View>
            </View>
            <Switch
              value={isForcedOffline}
              onValueChange={(value) => {
                if (value && !isBibleDownloaded) {
                  showPremiumAlert(
                    t('general.bibleNotDownloadedTitle'),
                    t('general.downloadRequired'),
                    [
                      { text: t('general.cancel') || 'Cancel', style: 'cancel', onPress: hidePremiumAlert },
                      { 
                        text: 'Descargar', 
                        style: 'default', 
                        onPress: () => {
                          hidePremiumAlert();
                          navigation.navigate('ManageDownloads', { returnTo: 'Profile' } as never);
                        }
                      }
                    ],
                    'wifi-off'
                  );
                  return;
                }

                // Si intentan apagarlo pero FÍSICAMENTE no hay internet o el servidor no responde
                if (!value && (!isConnected || !isServerAvailable)) {
                  showPremiumAlert(
                    t('general.error'),
                    'You need an internet connection to disable offline mode.',
                    [
                      { text: 'Got it', style: 'default', onPress: hidePremiumAlert }
                    ],
                    'error-outline'
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
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
      <PremiumAlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        actions={alertConfig.actions}
        onDismiss={hidePremiumAlert}
      />
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
    paddingTop: Platform.OS === 'android' ? Math.max(safeTop, 45) + 20 : Math.max(safeTop, 20) + 16,
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
  vipCard: {
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d4af37',
    shadowColor: '#d4af37',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 16,
  },
  vipCardContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vipCardText: {
    flex: 1,
    marginLeft: 12,
  },
  vipCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#d4af37',
  
  },
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
