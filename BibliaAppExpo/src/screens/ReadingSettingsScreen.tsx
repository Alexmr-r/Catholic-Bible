/**
 * ==========================================
 * READING SETTINGS SCREEN
 * ==========================================
 * Pantalla completa para ajustar configuración de lectura
 * Incluye tamaño de fuente, estilo de tipografía y vista previa
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import {MaterialIcons} from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import {ThemeColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';
import {useTextSettings} from '../contexts/TextSettingsContext';

type ReadingSettingsScreenProps = {
  navigation: any;
};

const ReadingSettingsScreen: React.FC<ReadingSettingsScreenProps> = ({navigation}) => {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => getStyles(colors, isDarkMode, insets.top), [colors, isDarkMode, insets.top]);
  const {settings, updateFontSize, updateFontFamily} = useTextSettings();

  // Determinar el label del tamaño
  const getSizeLabel = (fontSize: number): string => {
    if (fontSize <= 90) return 'Small';
    if (fontSize <= 110) return 'Medium';
    return 'Large';
  };

  const handleBack = () => {
    navigation.goBack();
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
        <Text style={styles.headerTitle}>Reading Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Font Size Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>FONT SIZE</Text>
            <View style={styles.sizeBadge}>
              <Text style={styles.sizeBadgeText}>{getSizeLabel(settings.fontSize)}</Text>
            </View>
          </View>

          <View style={styles.sliderCard}>
            <View style={styles.sliderContainer}>
              <MaterialIcons name="format-size" size={18} color={colors.ink.light} />

              <Slider
                style={styles.slider}
                minimumValue={80}
                maximumValue={150}
                step={5}
                value={settings.fontSize}
                onValueChange={updateFontSize}
                minimumTrackTintColor={isDarkMode ? colors.primary.DEFAULT : colors.gold.DEFAULT}
                maximumTrackTintColor={isDarkMode ? colors.ivory.border : "#e2e8f0"}
                thumbTintColor={isDarkMode ? colors.primary.DEFAULT : "#FFFFFF"}
              />

              <MaterialIcons name="format-size" size={28} color={colors.ink.light} />
            </View>

            <View style={styles.previewQuote}>
              <Text
                style={[
                  styles.quoteText,
                  {
                    fontSize: 15 * (settings.fontSize / 100),
                    fontFamily: settings.fontFamily === 'sans' ? undefined : (Platform.OS === 'ios' ? 'Georgia' : 'serif'),
                  },
                ]}>
                "Your word is a lamp for my feet"
              </Text>
            </View>
          </View>
        </View>

        {/* Typography Style Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TYPOGRAPHY STYLE</Text>
          </View>

          <View style={styles.typographyGrid}>
            {/* Clásica - Serif */}
            <TouchableOpacity
              style={[
                styles.typographyCard,
                settings.fontFamily === 'Lora_400Regular' && styles.typographyCardActive,
              ]}
              onPress={() => updateFontFamily('Lora_400Regular')}
              activeOpacity={0.7}>
              <Text style={[styles.typographySample, {fontFamily: 'Lora_400Regular'}]}>Aa</Text>
              <Text
                style={[
                  styles.typographyLabel,
                  settings.fontFamily === 'Lora_400Regular' && styles.typographyLabelActive,
                ]}>
                CLASSIC
              </Text>
              <Text style={styles.typographySubLabel}>Serif</Text>
            </TouchableOpacity>

            {/* Moderna - Sans */}
            <TouchableOpacity
              style={[
                styles.typographyCard,
                settings.fontFamily === 'sans' && styles.typographyCardActive,
              ]}
              onPress={() => updateFontFamily('sans')}
              activeOpacity={0.7}>
              <Text style={[styles.typographySample, {fontFamily: 'sans-serif'}]}>Aa</Text>
              <Text
                style={[
                  styles.typographyLabel,
                  settings.fontFamily === 'sans' && styles.typographyLabelActive,
                ]}>
                MODERN
              </Text>
              <Text style={styles.typographySubLabel}>Sans Serif</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Preview Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PREVIEW</Text>
          </View>

          <View style={styles.previewCard}>
            <View style={styles.previewContent}>
              <Text
                style={[
                  styles.previewText,
                  {
                    fontSize: 19 * (settings.fontSize / 100),
                    fontFamily: settings.fontFamily === 'sans' ? undefined : (Platform.OS === 'ios' ? 'Georgia' : 'serif'),
                  },
                ]}>
                In the beginning God created the heavens and the earth. Now the earth was formless and
                empty, darkness was over the surface of the deep, and the Spirit of God was hovering
                over the waters.
              </Text>

              <Text
                style={[
                  styles.previewText,
                  {
                    fontSize: 19 * (settings.fontSize / 100),
                    fontFamily: settings.fontFamily === 'sans' ? undefined : (Platform.OS === 'ios' ? 'Georgia' : 'serif'),
                    marginTop: 16,
                  },
                ]}>
                And God said, "Let there be light," and there was light. God saw that the light was good, and he separated the light from the darkness.
              </Text>

              {/* Gradient Overlay */}
              <LinearGradient
                colors={isDarkMode 
                  ? ['rgba(42, 36, 21, 0)', 'rgba(42, 36, 21, 1)'] 
                  : ['rgba(250, 249, 246, 0)', 'rgba(250, 249, 246, 1)']}
                style={styles.previewGradient}
                pointerEvents="none"
              />
            </View>
          </View>

          <Text style={styles.previewNote}>
            The Ivory/Sepia theme is optimized for prolonged reading and visual rest.
          </Text>
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? Math.max(safeTop, 45) + 20 : Math.max(safeTop, 20) + 16,
    backgroundColor: isDarkMode ? colors.background.dark : colors.ivory.DEFAULT,
    borderBottomWidth: 1,
    borderBottomColor: colors.ivory.border,
    position: 'relative',
    zIndex: 40,
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
    letterSpacing: -0.3,
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
    paddingTop: 8,
    paddingBottom: 40,
    maxWidth: 448,
    alignSelf: 'center',
    width: '100%',
  },

  // Section
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2.4,
    color: colors.charcoal.muted,
    textTransform: 'uppercase',
  },
  sizeBadge: {
    backgroundColor: `${colors.gold.DEFAULT}0D`, // 5% opacity
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sizeBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: isDarkMode ? colors.primary.DEFAULT : colors.gold.DEFAULT,
  },

  // Slider Card
  sliderCard: {
    backgroundColor: isDarkMode ? colors.paper : 'rgba(255, 255, 255, 0.4)',
    padding: 20,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.ivory.border,
    elevation: isDarkMode ? 1 : 0, // Elevation con transparencia falla en Android claro
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  previewQuote: {
    marginTop: 20,
    alignItems: 'center',
  },
  quoteText: {
    fontStyle: 'italic',
    color: colors.ink.light,
    textAlign: 'center',
    backgroundColor: 'transparent', // Forzar transparencia en Android
  },

  // Typography Grid
  typographyGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  typographyCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: isDarkMode ? colors.ivory.shade : 'rgba(148, 163, 184, 0.08)', 
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    gap: 8,
    opacity: 0.6,
  },
  typographyCardActive: {
    borderColor: isDarkMode ? colors.primary.DEFAULT : colors.gold.DEFAULT,
    backgroundColor: isDarkMode ? colors.paper : '#FFFFFF',
    shadowColor: colors.charcoal.DEFAULT,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    opacity: 1,
  },
  typographySample: {
    fontSize: 30,
    color: colors.charcoal.DEFAULT,
  },
  typographyLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.2,
    color: colors.ink.light,
  },
  typographyLabelActive: {
    color: isDarkMode ? colors.primary.DEFAULT : colors.gold.DEFAULT,
  },
  typographySubLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.ink.light,
  },

  // Preview Card
  previewCard: {
    backgroundColor: isDarkMode ? colors.paper : 'rgba(255, 255, 255, 0.3)',
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.ivory.border,
    elevation: isDarkMode ? 2 : 0, // Evitar artefactos en Android claro
  },
  previewContent: {
    maxHeight: 160,
    overflow: 'hidden',
    position: 'relative',
  },
  previewText: {
    lineHeight: 28,
    color: colors.charcoal.DEFAULT,
    backgroundColor: 'transparent', // Crucial para Android
  },
  previewGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
  },
  previewNote: {
    fontSize: 11,
    fontStyle: 'italic',
    color: colors.ink.light,
    textAlign: 'center',
    marginTop: 12,
  },
});

export default ReadingSettingsScreen;
