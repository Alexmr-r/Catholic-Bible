/**
 * ==========================================
 * TEXT SETTINGS MODAL
 * ==========================================
 * Modal inferior para ajustar tamaño de texto y fuente
 * Diseño basado en el HTML de referencia
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {ThemeColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';
import {useTextSettings, FontFamily} from '../contexts/TextSettingsContext';
import Slider from '@react-native-community/slider';

interface TextSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const TextSettingsModal: React.FC<TextSettingsModalProps> = ({visible, onClose}) => {
  const { colors, isDarkMode } = useTheme();
  const styles = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);
  const {settings, updateFontSize, updateFontFamily} = useTextSettings();
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [400, 0],
  });

  const backdropOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent>
      {/* Backdrop */}
      <Animated.View
        style={[styles.backdrop, {opacity: backdropOpacity}]}
        onTouchEnd={onClose}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
      </Animated.View>

      {/* Modal Content */}
      <Animated.View
        style={[
          styles.modalContainer,
          {
            transform: [{translateY}],
          },
        ]}>
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        <View style={styles.content}>
          {/* Tipo de Letra */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TIPO DE LETRA</Text>
            <View style={styles.fontSelector}>
              <TouchableOpacity
                style={[
                  styles.fontButton,
                  settings.fontFamily === 'serif' && styles.fontButtonActive,
                ]}
                onPress={() => updateFontFamily('serif')}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.fontButtonText,
                    settings.fontFamily === 'serif' && styles.fontButtonTextActive,
                    {fontFamily: 'serif'},
                  ]}>
                  Serif
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.fontButton,
                  settings.fontFamily === 'sans' && styles.fontButtonActive,
                ]}
                onPress={() => updateFontFamily('sans')}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.fontButtonText,
                    settings.fontFamily === 'sans' && styles.fontButtonTextActive,
                  ]}>
                  Sans
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tamaño */}
          <View style={styles.section}>
            <View style={styles.sizeHeader}>
              <Text style={styles.sectionTitle}>TAMAÑO</Text>
              <View style={styles.percentageBadge}>
                <Text style={styles.percentageText}>{settings.fontSize}%</Text>
              </View>
            </View>

            <View style={styles.sliderContainer}>
              <MaterialIcons name="text-fields" size={20} color={colors.ink.light} />

              <View style={styles.sliderWrapper}>
                <Slider
                  style={styles.slider}
                  minimumValue={80}
                  maximumValue={150}
                  step={5}
                  value={settings.fontSize}
                  onValueChange={updateFontSize}
                  minimumTrackTintColor={colors.primary.DEFAULT}
                  maximumTrackTintColor={colors.ivory.border}
                  thumbTintColor={colors.primary.DEFAULT}
                />
              </View>

              <MaterialIcons name="text-fields" size={28} color={colors.ink.light} />
            </View>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

const getStyles = (colors: ThemeColors, isDarkMode: boolean) => StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(54, 69, 79, 0.3)', // charcoal/30
    zIndex: 60,
  },

  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: isDarkMode ? colors.background.dark : '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -15},
    shadowOpacity: 0.1,
    shadowRadius: 50,
    elevation: 20,
    borderTopWidth: 1,
    borderTopColor: colors.ivory.border,
    zIndex: 70,
    paddingBottom: 48, // Safe area
  },

  handleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  handle: {
    width: 48,
    height: 6,
    backgroundColor: colors.ivory.shade,
    borderRadius: 3,
  },

  content: {
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 48,
  },

  section: {
    marginBottom: 32,
  },

  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.ink.light,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 12,
  },

  // Font Selector
  fontSelector: {
    backgroundColor: isDarkMode ? colors.ivory.shade : colors.ivory.shade,
    padding: 6,
    borderRadius: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: colors.ivory.border,
  },
  fontButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  fontButtonActive: {
    backgroundColor: isDarkMode ? colors.primary.DEFAULT : '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: isDarkMode ? colors.primary.DEFAULT : colors.ivory.border,
  },
  fontButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.ink.light,
  },
  fontButtonTextActive: {
    fontWeight: '700',
    color: isDarkMode ? colors.charcoal.dark : colors.charcoal.dark,
  },

  // Size Slider
  sizeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  percentageBadge: {
    backgroundColor: isDarkMode ? `${colors.primary.DEFAULT}33` : `${colors.primary.DEFAULT}15`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary.DEFAULT,
  },

  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    backgroundColor: isDarkMode ? colors.paper : `${colors.ivory.shade}80`,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.ivory.border,
  },
  sliderWrapper: {
    flex: 1,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});

export default TextSettingsModal;
