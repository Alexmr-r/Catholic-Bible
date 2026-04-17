import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useTheme } from '../contexts/ThemeContext';

interface TrialWelcomeModalProps {
  isVisible: boolean;
  onClose: () => void;
  onViewPlans: () => void;
}

const { width } = Dimensions.get('window');

const TrialWelcomeModal: React.FC<TrialWelcomeModalProps> = ({ isVisible, onClose, onViewPlans }) => {
  const { isDarkMode } = useTheme();

  const bg = isDarkMode ? '#1a160d' : '#FFFFFF';
  const gradientColors: [string, string] = isDarkMode ? ['#2a2415', '#1a160d'] : ['#FDFCF8', '#F8F5EE'];
  const titleColor = isDarkMode ? '#e6b319' : '#2D2A22';
  const descColor = isDarkMode ? '#94a3b8' : '#6B7280';
  const btnBg = isDarkMode ? '#e6b319' : '#6B9080';
  const btnText = isDarkMode ? '#1a160d' : '#FFFFFF';

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      {/* Fondo semi-transparent neutro, sin rojo */}
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: bg }]}>
          <LinearGradient colors={gradientColors} style={styles.gradient}>

            {/* Logo */}
            <View style={styles.logoWrap}>
              <Image
                source={require('../../assets/logo-transparent.png')}
                style={styles.logo}
                contentFit="contain"
              />
            </View>

            {/* Título */}
            <Text style={[styles.title, { color: titleColor }]}>
              Welcome to CatholicVerse
            </Text>

            {/* Descripción */}
            <Text style={[styles.desc, { color: descColor }]}>
              Your journey with the Word of God begins today.{'\n'}
              We've granted you{' '}
              <Text style={styles.highlight}>7 days of Premium access</Text>
              {' '}to explore and grow in faith.
            </Text>

            {/* Botón principal */}
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: btnBg }]}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={[styles.primaryBtnText, { color: btnText }]}>
                Start Exploring
              </Text>
            </TouchableOpacity>

            {/* Enlace a planes */}
            <TouchableOpacity style={styles.secondaryBtn} onPress={onViewPlans} activeOpacity={0.7}>
              <Text style={styles.secondaryBtnText}>View Premium Plans</Text>
            </TouchableOpacity>

          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 22, 13, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
  gradient: {
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 28,
    alignItems: 'center',
  },
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 56,
    height: 56,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    lineHeight: 28,
  },
  desc: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  highlight: {
    color: '#D4AF37',
    fontWeight: '700',
  },
  primaryBtn: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    paddingVertical: 6,
  },
  secondaryBtnText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default TrialWelcomeModal;
