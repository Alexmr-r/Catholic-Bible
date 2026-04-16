/**
 * PANTALLA DE AYUDA: FLUJO DE ESCRITOS
 */

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {MaterialIcons} from '@expo/vector-icons';
import {ThemeColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';

const WritingsHelpScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => getStyles(colors, isDarkMode, insets.top), [colors, isDarkMode, insets.top]);
  const steps = [
    {icon: 'edit-calendar', title: 'Write your reflection', description: "Write down your thoughts in 'Daily Reading' while meditating on the Word."},
    {icon: 'auto-awesome', title: 'Automatic saving', description: "Your writings save automatically and appear organized in 'Writings'."},
    {icon: 'ios-share', title: 'Edit and share', description: 'Access your reflections to edit or share them.'},
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.charcoal.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Writings Flow</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.heroIconContainer}>
            <MaterialIcons name="edit-note" size={28} color={isDarkMode ? colors.primary.DEFAULT : colors.gold.DEFAULT} />
          </View>
          <Text style={styles.heroTitle}>Writings Flow</Text>
          <Text style={styles.heroSubtitle}>Capture your reflections and moments of prayer while meditating on the Word of God.</Text>
        </View>

        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepCard}>
              <View style={styles.stepIconContainer}>
                <MaterialIcons name={step.icon as any} size={20} color={isDarkMode ? colors.primary.DEFAULT : colors.gold.DEFAULT} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepNumber}>STEP {index + 1}</Text>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.infoBox}>
          <View style={styles.infoHeader}>
            <MaterialIcons name="history-edu" size={18} color={isDarkMode ? colors.primary.DEFAULT : colors.gold.DEFAULT} />
            <Text style={styles.infoTitle}>SPIRITUAL LIBRARY</Text>
          </View>
          <Text style={styles.infoText}>Your spiritual diary is always with you, synchronized across all your devices.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const getStyles = (colors: ThemeColors, isDarkMode: boolean, safeTop: number) => StyleSheet.create({
  container: {flex: 1, backgroundColor: isDarkMode ? colors.background.dark : colors.cream},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Math.max(safeTop, 20) + 16,
    backgroundColor: isDarkMode ? colors.background.dark : colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: colors.ivory.border
  },
  backButton: {width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center'},
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.charcoal.dark,
    fontFamily: 'serif',
    flex: 1,
    textAlign: 'center'
  },
  headerSpacer: {width: 40},
  scrollView: {flex: 1},
  content: {paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32},
  heroSection: {alignItems: 'center', marginBottom: 20},
  heroIconContainer: {width: 60, height: 60, borderRadius: 16, backgroundColor: isDarkMode ? `${colors.primary.DEFAULT}1A` : colors.gold.DEFAULT + '15', alignItems: 'center', justifyContent: 'center', marginBottom: 14},
  heroTitle: {fontSize: 22, fontWeight: '700', color: colors.charcoal.DEFAULT, fontFamily: 'serif', marginBottom: 8},
  heroSubtitle: {fontSize: 15, color: colors.charcoal.muted, textAlign: 'center', lineHeight: 21, paddingHorizontal: 8},
  stepsContainer: {gap: 12, marginBottom: 20},
  stepCard: {flexDirection: 'row', backgroundColor: isDarkMode ? colors.paper : '#FFFFFF', borderRadius: 18, padding: 14, gap: 14, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2, borderWidth: 1, borderColor: colors.ivory.border},
  stepIconContainer: {width: 46, height: 46, borderRadius: 12, backgroundColor: isDarkMode ? colors.ivory.shade : colors.cream, borderWidth: 1, borderColor: colors.ivory.border, alignItems: 'center', justifyContent: 'center'},
  stepContent: {flex: 1},
  stepNumber: {fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: isDarkMode ? colors.primary.DEFAULT : colors.gold.DEFAULT, marginBottom: 2},
  stepTitle: {fontSize: 16, fontWeight: '700', color: colors.charcoal.DEFAULT, marginBottom: 3},
  stepDescription: {fontSize: 14, color: colors.charcoal.muted, lineHeight: 19},
  infoBox: {backgroundColor: isDarkMode ? colors.paper : '#FFFFFF', borderRadius: 16, padding: 18, borderLeftWidth: 4, borderLeftColor: isDarkMode ? colors.primary.DEFAULT : colors.gold.DEFAULT, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2},
  infoHeader: {flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8},
  infoTitle: {fontSize: 13, fontWeight: '700', color: colors.charcoal.DEFAULT, letterSpacing: 1},
  infoText: {fontSize: 14, color: colors.charcoal.muted, lineHeight: 20, paddingLeft: 28},
});

export default WritingsHelpScreen;
