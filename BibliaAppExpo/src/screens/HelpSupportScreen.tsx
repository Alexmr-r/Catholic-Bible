import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {colors} from '../theme/colors';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/AppNavigator';

type HelpSupportScreenProps = NativeStackScreenProps<RootStackParamList, 'HelpSupport'>;

const HelpSupportScreen: React.FC<HelpSupportScreenProps> = ({navigation}) => {
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

  const handleContactSupport = () => {
    navigation.navigate('SendMessage');
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
        <Text style={styles.headerTitle}>Guía y Soporte</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Contenido */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Sección: Temas Frecuentes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TEMAS FRECUENTES</Text>

          {/* Cómo usar los escritos */}
          <TouchableOpacity
            style={styles.topicCard}
            onPress={handleWritingsHelp}
            activeOpacity={0.7}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="history-edu" size={24} color={colors.gold.DEFAULT} />
            </View>
            <Text style={styles.topicText}>Cómo usar los escritos</Text>
            <MaterialIcons name="chevron-right" size={24} color={colors.charcoal.muted} />
          </TouchableOpacity>

          {/* Gestión de favoritos */}
          <TouchableOpacity
            style={styles.topicCard}
            onPress={handleFavoritesHelp}
            activeOpacity={0.7}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="favorite" size={24} color={colors.gold.DEFAULT} />
            </View>
            <Text style={styles.topicText}>Gestión de favoritos</Text>
            <MaterialIcons name="chevron-right" size={24} color={colors.charcoal.muted} />
          </TouchableOpacity>

          {/* Uso sin conexión */}
          <TouchableOpacity
            style={styles.topicCard}
            onPress={handleOfflineHelp}
            activeOpacity={0.7}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="cloud-download" size={24} color={colors.gold.DEFAULT} />
            </View>
            <Text style={styles.topicText}>Uso sin conexión</Text>
            <MaterialIcons name="chevron-right" size={24} color={colors.charcoal.muted} />
          </TouchableOpacity>
        </View>

        {/* Sección: ¿Necesitas más ayuda? */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>¿NECESITAS MÁS AYUDA?</Text>

          {/* Tarjeta de contacto */}
          <TouchableOpacity
            style={styles.contactCard}
            onPress={handleContactSupport}
            activeOpacity={0.8}>
            <View style={styles.contactIconContainer}>
              <MaterialIcons name="mail" size={32} color={colors.gold.DEFAULT} />
            </View>
            <Text style={styles.contactTitle}>Enviar un mensaje al soporte</Text>
            <Text style={styles.contactDescription}>
              Nuestro equipo te responderá en menos de 24 horas para asistirte en lo que necesites.
            </Text>
            <View style={styles.contactButton}>
              <Text style={styles.contactButtonText}>CONTACTAR AHORA</Text>
            </View>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.charcoal.dark,
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${colors.ivory.border}80`,
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
    backgroundColor: `${colors.gold.DEFAULT}10`,
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
    borderColor: `${colors.gold.DEFAULT}66`,
    backgroundColor: `${colors.gold.DEFAULT}08`,
  },
  contactButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.gold.DEFAULT,
    letterSpacing: 1.2,
  },
});

export default HelpSupportScreen;
