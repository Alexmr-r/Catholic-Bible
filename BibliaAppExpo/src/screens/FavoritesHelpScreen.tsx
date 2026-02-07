/**
 * PANTALLA DE AYUDA: TUS FAVORITOS
 */

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {colors} from '../theme/colors';

const FavoritesHelpScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const steps = [
    {icon: 'touch-app', title: 'Guardar versículos', description: 'Realiza una pulsación prolongada sobre cualquier versículo y toca el icono del corazón para añadirlo a tu lista.'},
    {icon: 'more-horiz', title: 'Capítulo completo', description: '¿Quieres guardar todo el capítulo? Pulsa en los tres puntos (...) situados en la esquina superior derecha de la lectura.'},
    {icon: 'bookmarks', title: 'Acceso rápido', description: 'Encuentra todo lo que has guardado rápidamente en la pestaña "Favoritos" del menú inferior.'},
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back-ios" size={24} color={colors.charcoal.DEFAULT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tus Favoritos</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.heroIconContainer}>
            <MaterialIcons name="favorite" size={28} color="#EF4444" />
          </View>
          <Text style={styles.heroTitle}>Tus Favoritos</Text>
          <Text style={styles.heroSubtitle}>Guarda y organiza los versículos y capítulos que más te inspiran en tu camino de fe.</Text>
        </View>

        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepCard}>
              <View style={styles.stepIconContainer}>
                <MaterialIcons name={step.icon as any} size={20} color={colors.gold.DEFAULT} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepNumber}>PASO {index + 1}</Text>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.infoBox}>
          <View style={styles.infoHeader}>
            <MaterialIcons name="workspace-premium" size={18} color={colors.gold.DEFAULT} />
            <Text style={styles.infoTitle}>TESORO ESPIRITUAL</Text>
          </View>
          <Text style={styles.infoText}>Tus pasajes favoritos son semillas de sabiduría guardadas en tu corazón, disponibles siempre.</Text>
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
  heroIconContainer: {width: 60, height: 60, borderRadius: 16, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginBottom: 14},
  heroTitle: {fontSize: 22, fontWeight: '700', color: colors.charcoal.DEFAULT, fontFamily: 'serif', marginBottom: 8},
  heroSubtitle: {fontSize: 15, color: colors.charcoal.muted, textAlign: 'center', lineHeight: 21, paddingHorizontal: 8},
  stepsContainer: {gap: 12, marginBottom: 20},
  stepCard: {flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, gap: 14, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2, borderWidth: 1, borderColor: colors.ivory.border},
  stepIconContainer: {width: 46, height: 46, borderRadius: 12, backgroundColor: colors.cream, borderWidth: 1, borderColor: colors.gold.DEFAULT + '10', alignItems: 'center', justifyContent: 'center'},
  stepContent: {flex: 1},
  stepNumber: {fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: colors.gold.DEFAULT, marginBottom: 2},
  stepTitle: {fontSize: 16, fontWeight: '700', color: colors.charcoal.DEFAULT, marginBottom: 3},
  stepDescription: {fontSize: 14, color: colors.charcoal.muted, lineHeight: 19},
  infoBox: {backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, borderLeftWidth: 4, borderLeftColor: colors.gold.DEFAULT, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2},
  infoHeader: {flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8},
  infoTitle: {fontSize: 13, fontWeight: '700', color: colors.charcoal.DEFAULT, letterSpacing: 1},
  infoText: {fontSize: 14, color: colors.charcoal.muted, lineHeight: 20, paddingLeft: 28},
});

export default FavoritesHelpScreen;
