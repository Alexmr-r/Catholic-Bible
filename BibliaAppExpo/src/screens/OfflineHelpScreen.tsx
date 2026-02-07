/**
 * PANTALLA DE AYUDA: USO SIN CONEXIÓN
 */

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {colors} from '../theme/colors';

const OfflineHelpScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const steps = [
    {icon: 'bookmark-border', title: 'Favoritos y Notas', description: 'Tus marcadores locales guardados.', badge: null},
    {icon: 'workspace-premium', title: 'Biblia en Inglés', description: 'Descarga disponible para offline.', badge: 'OPCIONAL'},
    {icon: 'menu-book', title: 'Lectura de la Biblia', description: 'Lee la Palabra incluso sin conexión.', badge: null},
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back-ios" size={24} color={colors.charcoal.DEFAULT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Uso sin Conexión</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.heroIconContainer}>
            <MaterialIcons name="wifi-off" size={28} color={colors.gold.DEFAULT} />
          </View>
          <Text style={styles.heroTitle}>Uso sin conexión</Text>
          <Text style={styles.heroSubtitle}>Accede a la Palabra de Dios en cualquier lugar, incluso sin internet.</Text>
        </View>

        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepCard}>
              <View style={styles.stepIconContainer}>
                <MaterialIcons name={step.icon as any} size={20} color={colors.gold.DEFAULT} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepNumber}>PASO {index + 1}</Text>
                <View style={styles.stepTitleRow}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  {step.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{step.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.infoBox}>
          <View style={styles.infoHeader}>
            <MaterialIcons name="church" size={18} color={colors.gold.DEFAULT} />
            <Text style={styles.infoTitle}>REFLEXIÓN ESPIRITUAL</Text>
          </View>
          <Text style={styles.infoText}>La Palabra de Dios no conoce fronteras. Aprovecha el silencio del modo offline para una meditación más profunda.</Text>
          <TouchableOpacity
            style={styles.downloadButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ManageDownloads')}>
            <MaterialIcons name="cloud-download" size={16} color={colors.gold.DEFAULT} />
            <Text style={styles.downloadButtonText}>GESTIONAR DESCARGAS</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.cream},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 56, paddingBottom: 14, paddingHorizontal: 20, backgroundColor: colors.cream, borderBottomWidth: 1, borderBottomColor: colors.gold.DEFAULT + '08'},
  backButton: {width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center'},
  headerTitle: {fontSize: 18, fontWeight: '700', color: colors.charcoal.DEFAULT, fontFamily: 'serif'},
  headerSpacer: {width: 40},
  scrollView: {flex: 1},
  content: {paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32},
  heroSection: {alignItems: 'center', marginBottom: 20},
  heroIconContainer: {width: 60, height: 60, borderRadius: 16, backgroundColor: colors.gold.DEFAULT + '15', alignItems: 'center', justifyContent: 'center', marginBottom: 14},
  heroTitle: {fontSize: 22, fontWeight: '700', color: colors.charcoal.DEFAULT, fontFamily: 'serif', marginBottom: 8},
  heroSubtitle: {fontSize: 15, color: colors.charcoal.muted, textAlign: 'center', lineHeight: 21, paddingHorizontal: 8},
  stepsContainer: {gap: 12, marginBottom: 20},
  stepCard: {flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, gap: 14, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2, borderWidth: 1, borderColor: colors.ivory.border},
  stepIconContainer: {width: 46, height: 46, borderRadius: 12, backgroundColor: colors.cream, borderWidth: 1, borderColor: colors.gold.DEFAULT + '10', alignItems: 'center', justifyContent: 'center'},
  stepContent: {flex: 1},
  stepNumber: {fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: colors.gold.DEFAULT, marginBottom: 2},
  stepTitleRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  stepTitle: {fontSize: 16, fontWeight: '700', color: colors.charcoal.DEFAULT, marginBottom: 3},
  stepDescription: {fontSize: 14, color: colors.charcoal.muted, lineHeight: 19},
  badge: {backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12},
  badgeText: {fontSize: 9, fontWeight: '700', color: '#059669', letterSpacing: 0.5},
  infoBox: {backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, borderLeftWidth: 4, borderLeftColor: colors.gold.DEFAULT, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2},
  infoHeader: {flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8},
  infoTitle: {fontSize: 13, fontWeight: '700', color: colors.charcoal.DEFAULT, letterSpacing: 1},
  infoText: {fontSize: 14, color: colors.charcoal.muted, lineHeight: 20, paddingLeft: 28, marginBottom: 14},
  downloadButton: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: colors.cream, borderWidth: 1, borderColor: colors.gold.DEFAULT + '30', borderRadius: 12, paddingVertical: 12, marginLeft: 28},
  downloadButtonText: {fontSize: 11, fontWeight: '700', color: colors.gold.DEFAULT, letterSpacing: 1.5},
});

export default OfflineHelpScreen;
