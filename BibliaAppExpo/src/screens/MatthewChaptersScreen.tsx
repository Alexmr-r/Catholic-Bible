import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {colors} from '../theme/colors';
import {MatthewChaptersScreenProps} from '../navigation/AppNavigator';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_PADDING = 16;
const GAP = 12;
const COLUMNS = 5;
const BUTTON_SIZE = (SCREEN_WIDTH - (HORIZONTAL_PADDING * 2) - (GAP * (COLUMNS - 1))) / COLUMNS;

const MatthewChaptersScreen: React.FC<MatthewChaptersScreenProps> = ({navigation}) => {
  const totalChapters = 28;
  const currentChapter = 1; // Capítulo actual habilitado
  const bookmarkedChapter = 21; // Capítulo con favorito
  const enabledChapters = [1]; // Solo capítulo 1 habilitado

  // =====================================================
  // ✅ NAVEGACIÓN IMPLEMENTADA - Solo capítulo 1 habilitado
  // Navega a la pantalla de lectura del capítulo
  // =====================================================
  const handleChapterPress = (chapter: number) => {
    const isEnabled = enabledChapters.includes(chapter);

    if (isEnabled) {
      navigation.navigate('ChapterReading');
    } else {
      Alert.alert(
        '🔒 Capítulo Bloqueado',
        `El capítulo ${chapter} estará disponible próximamente.\n\nPor ahora, solo el capítulo 1 está habilitado para demo.`,
        [{text: 'Entendido'}]
      );
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // =====================================================
  // 🔴 MOCKEADO - Info del libro
  // TODO: Mostrar información detallada del libro
  // =====================================================
  const handleInfo = () => {
    Alert.alert(
      'ℹ️ Sobre San Mateo',
      'Funcionalidad en desarrollo.\n\nPróximamente verás información detallada sobre el Evangelio de San Mateo: autor, contexto histórico, temas principales, etc.',
      [{text: 'Entendido'}]
    );
  };

  const renderChapterButton = (chapter: number, index: number) => {
    const isEnabled = enabledChapters.includes(chapter);
    const isCurrent = chapter === currentChapter && isEnabled;
    const isBookmarked = chapter === bookmarkedChapter;
    const isLastInRow = (index + 1) % COLUMNS === 0;
    const isLastRow = index >= totalChapters - COLUMNS;

    return (
      <TouchableOpacity
        key={chapter}
        style={[
          styles.chapterButton,
          !isEnabled && styles.chapterButtonDisabled,
          isCurrent && styles.chapterButtonCurrent,
          isBookmarked && isEnabled && styles.chapterButtonBookmarked,
          !isLastInRow && {marginRight: GAP},
          !isLastRow && {marginBottom: GAP},
        ]}
        onPress={() => handleChapterPress(chapter)}
        activeOpacity={isEnabled ? 0.7 : 0.9}>
        <Text
          style={[
            styles.chapterText,
            !isEnabled && styles.chapterTextDisabled,
            isCurrent && styles.chapterTextCurrent,
            isBookmarked && isEnabled && styles.chapterTextBookmarked,
          ]}>
          {chapter}
        </Text>
        {isCurrent && <View style={styles.currentDot} />}
        {isBookmarked && isEnabled && <View style={styles.bookmarkDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Sticky */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color={colors.charcoal.dark} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>San Mateo</Text>
          <Text style={styles.headerSubtitle}>NUEVO TESTAMENTO</Text>
        </View>
        <TouchableOpacity
          onPress={handleInfo}
          style={styles.infoButton}
          activeOpacity={0.7}>
          <MaterialIcons name="info-outline" size={24} color={colors.charcoal.muted} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>Evangelios</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>El Reino de los Cielos</Text>
            <Text style={styles.infoDescription}>
              Proclama a Jesús como el Mesías prometido, el Rey de los judíos, y presenta sus enseñanzas sobre el Reino de Dios.
            </Text>
          </View>
          <View style={styles.infoIconContainer}>
            <MaterialIcons
              name="menu-book"
              size={140}
              color={colors.charcoal.DEFAULT}
              style={styles.infoIcon}
            />
          </View>
        </View>

        {/* Chapters Header */}
        <View style={styles.chaptersHeader}>
          <Text style={styles.chaptersTitle}>Capítulos</Text>
          <Text style={styles.chaptersCount}>{totalChapters} Capítulos</Text>
        </View>

        {/* Chapters Grid */}
        <View style={styles.chaptersGrid}>
          {Array.from({length: totalChapters}, (_, i) => i + 1).map((chapter, index) =>
            renderChapterButton(chapter, index)
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: `${colors.cream}F2`,
    borderBottomWidth: 1,
    borderBottomColor: colors.ivory.border,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.charcoal.dark,
    lineHeight: 24,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.secondary,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  infoButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },

  // Info Card
  infoCard: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.ivory.border,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${colors.gold.accent}33`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${colors.gold.accent}66`,
    marginBottom: 12,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gold.dim,
    letterSpacing: 0.5,
  },
  infoContent: {
    zIndex: 10,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.charcoal.dark,
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.charcoal.muted,
    maxWidth: '85%',
  },
  infoIconContainer: {
    position: 'absolute',
    right: -24,
    bottom: -32,
    opacity: 0.05,
    transform: [{rotate: '12deg'}],
  },
  infoIcon: {
    opacity: 1,
  },

  // Chapters Header
  chaptersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  chaptersTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.charcoal.dark,
  },
  chaptersCount: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.charcoal.muted,
  },

  // Chapters Grid
  chaptersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  chapterButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.ivory.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    position: 'relative',
  },
  chapterButtonDisabled: {
    opacity: 0.5,
    backgroundColor: `${colors.ivory.shade}50`,
  },
  chapterButtonCurrent: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
    shadowColor: colors.primary.DEFAULT,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  chapterButtonBookmarked: {
    borderColor: `${colors.burgundy.accent}66`,
    borderWidth: 1,
  },
  chapterText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.charcoal.DEFAULT,
  },
  chapterTextDisabled: {
    color: colors.charcoal.muted,
  },
  chapterTextCurrent: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chapterTextBookmarked: {
    color: colors.burgundy.accent,
  },
  currentDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  bookmarkDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.burgundy.accent,
  },

  bottomSpacer: {
    height: 20,
  },
});

export default MatthewChaptersScreen;

