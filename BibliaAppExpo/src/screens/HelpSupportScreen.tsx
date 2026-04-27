import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {ThemeColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/AppNavigator';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useIsOnline} from '../contexts/NetworkContext';
import OfflineBanner from '../components/OfflineBanner';

type HelpSupportScreenProps = NativeStackScreenProps<RootStackParamList, 'HelpSupport'>;

const HelpSupportScreen: React.FC<HelpSupportScreenProps> = ({navigation}) => {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const isOnline = useIsOnline();
  const styles = React.useMemo(() => getStyles(colors, isDarkMode, insets.top), [colors, isDarkMode, insets.top]);
  const handleBack = () => {
    navigation.goBack();
  };

  // Navegación a pantallas de ayuda
  const handleWritingsHelp = () => {
    navigation.navigate('WritingsHelp');
  };

  const handleFavoritesHelp = () => {
    navigation.navigate('FavoritesHelp');
  };

  const handleOfflineHelp = () => {
    navigation.navigate('OfflineHelp');
  };

  const handleContactSupport = async () => {
    const email = 'support@getcatholicverse.com';
    const subject = encodeURIComponent('Support - CatholicVerse');
    const body = encodeURIComponent('Hello,\n\nProblem description or inquiry:\n\n');
    const url = `mailto:${email}?subject=${subject}&body=${body}`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'No email app',
          `No email app found. You can write directly to:\n\n${email}`,
          [{text: 'Got it'}]
        );
      }
    } catch (error) {
      Alert.alert(
        'No email app',
        `Could not open email app. You can write directly to:\n\n${email}`,
        [{text: 'Got it'}]
      );
    }
  };

  return (
    <View style={styles.container}>
      <OfflineBanner />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.7}
          style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.charcoal.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Contenido */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Sección: Temas Frecuentes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FREQUENT TOPICS</Text>

          {/* Cómo usar los escritos */}
          <TouchableOpacity
            style={styles.topicCard}
            onPress={handleWritingsHelp}
            activeOpacity={0.7}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="history-edu" size={24} color={colors.gold.DEFAULT} />
            </View>
            <Text style={styles.topicText}>How to use writings</Text>
            <MaterialIcons name="arrow-forward" size={24} color={colors.charcoal.muted} />
          </TouchableOpacity>

          {/* Gestión de favoritos */}
          <TouchableOpacity
            style={styles.topicCard}
            onPress={handleFavoritesHelp}
            activeOpacity={0.7}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="favorite" size={24} color={colors.gold.DEFAULT} />
            </View>
            <Text style={styles.topicText}>Managing favorites</Text>
            <MaterialIcons name="arrow-forward" size={24} color={colors.charcoal.muted} />
          </TouchableOpacity>

          {/* Uso sin conexión */}
          <TouchableOpacity
            style={styles.topicCard}
            onPress={handleOfflineHelp}
            activeOpacity={0.7}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="cloud-download" size={24} color={colors.gold.DEFAULT} />
            </View>
            <Text style={styles.topicText}>Offline use</Text>
            <MaterialIcons name="arrow-forward" size={24} color={colors.charcoal.muted} />
          </TouchableOpacity>
        </View>

        {/* Sección: ¿Necesitas más ayuda? */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NEED MORE HELP?</Text>

          {/* Tarjeta de contacto */}
          <TouchableOpacity
            style={[styles.contactCard, !isOnline && {opacity: 0.5}]}
            onPress={isOnline ? handleContactSupport : () => Alert.alert('No connection', 'You need a connection to send an email.')}
            activeOpacity={0.8}>
            <View style={styles.contactIconContainer}>
              <MaterialIcons name={isOnline ? "mail" : "cloud-off"} size={32} color={isOnline ? colors.gold.DEFAULT : colors.charcoal.muted} />
            </View>
            <Text style={styles.contactTitle}>{isOnline ? 'Email us' : 'No connection'}</Text>
            <Text style={styles.contactDescription}>
              {isOnline
                ? 'Your email app will open with our email ready. Tell us your question and we will reply as soon as possible.'
                : 'Restore your connection to contact us by email.'}
            </Text>
            {isOnline && (
              <View style={styles.contactButton}>
                <Text style={styles.contactButtonText}>CONTACT NOW</Text>
              </View>
            )}
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
    textAlign: 'center',
    flex: 1,
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

  // Sections
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.charcoal.muted,
    letterSpacing: 1.8,
    marginBottom: 16,
    paddingHorizontal: 8,
  },

  // Topic Cards
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? colors.paper : '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.ivory.border,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.02,
    shadowRadius: 15,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.ivory.shade,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  topicText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.charcoal.dark,
  },

  // Contact Card
  contactCard: {
    backgroundColor: isDarkMode ? colors.paper : '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.ivory.border,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.03,
    shadowRadius: 25,
    elevation: 3,
  },
  contactIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: isDarkMode ? `${colors.primary.DEFAULT}1A` : `${colors.gold.DEFAULT}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.charcoal.dark,
    marginBottom: 8,
    textAlign: 'center',
  },
  contactDescription: {
    fontSize: 13,
    color: colors.charcoal.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  contactButton: {
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: isDarkMode ? colors.primary.DEFAULT : `${colors.gold.DEFAULT}66`,
    backgroundColor: isDarkMode ? `${colors.primary.DEFAULT}1A` : `${colors.gold.DEFAULT}08`,
  },
  contactButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: isDarkMode ? colors.primary.DEFAULT : colors.gold.DEFAULT,
    letterSpacing: 1.2,
  },
});

export default HelpSupportScreen;
