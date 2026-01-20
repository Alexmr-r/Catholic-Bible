import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {colors} from '../theme/colors';
import {ChapterReadingScreenProps} from '../navigation/AppNavigator';
import {bibleService, Chapter} from '../services/bible.service';
import {favoritesService} from '../services/favorites.service';

const ChapterReadingScreen: React.FC<ChapterReadingScreenProps> = ({navigation, route}) => {
  const { bookId, bookName, chapter: initialChapter } = route.params;

  const [selectedVerses, setSelectedVerses] = useState<number[]>([]); // Array de versículos seleccionados
  const [selectionMode, setSelectionMode] = useState(false); // Modo selección múltiple
  const [chapterData, setChapterData] = useState<Chapter | null>(null);
  const [currentChapter, setCurrentChapter] = useState(initialChapter);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =====================================================
  // ✅ CONECTADO A API - Cargar capítulo
  // =====================================================
  useEffect(() => {
    loadChapter();
  }, [currentChapter]);

  const loadChapter = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await bibleService.getChapter(bookId, currentChapter);
      setChapterData(data);
    } catch (err: any) {
      console.error('Error cargando capítulo:', err);
      setError('No se pudo cargar el capítulo. Verifica tu conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Navegación entre capítulos
  const handlePreviousChapter = () => {
    if (chapterData?.previousChapter) {
      setCurrentChapter(chapterData.previousChapter.chapter);
    }
  };

  const handleNextChapter = () => {
    if (chapterData?.nextChapter) {
      setCurrentChapter(chapterData.nextChapter.chapter);
    }
  };

  // =====================================================
  // 🔴 MOCKEADO - Ajustes de texto
  // =====================================================
  const handleTextSettings = () => {
    Alert.alert(
      '🔤 Ajustes de Texto',
      'Funcionalidad mockeada para demo.\n\nEn producción, aquí podrás ajustar el tamaño de letra, tipo de fuente, espaciado, etc.',
      [{text: 'Entendido'}]
    );
  };

  // =====================================================
  // 🔴 MOCKEADO - Más opciones
  // =====================================================
  const handleMoreOptions = () => {
    Alert.alert(
      '⚙️ Opciones',
      'Selecciona una opción',
      [
        {
          text: '⭐ Añadir capítulo completo a favoritos',
          onPress: handleAddChapterToFavorites,
        },
        {
          text: '🎧 Audio del capítulo',
          onPress: () => Alert.alert('En desarrollo', 'Próximamente'),
        },
        {
          text: '💬 Comentarios',
          onPress: () => Alert.alert('En desarrollo', 'Próximamente'),
        },
        {
          text: '🔗 Referencias cruzadas',
          onPress: () => Alert.alert('En desarrollo', 'Próximamente'),
        },
        {text: 'Cancelar', style: 'cancel'},
      ]
    );
  };

  // =====================================================
  // 🔴 MOCKEADO - Acciones de versículo (toolbar flotante)
  // =====================================================
  const handleHighlight = (color: string) => {
    const verseRef = selectedVerses.length === 1
      ? `versículo ${selectedVerses[0]}`
      : `versículos ${Math.min(...selectedVerses)}-${Math.max(...selectedVerses)}`;

    Alert.alert(
      '🎨 Resaltar',
      `Funcionalidad mockeada para demo.\n\nEn producción, ${verseRef} se resaltará con color ${color}.`,
      [{text: 'Entendido'}]
    );
    cancelSelection();
  };

  const handleAddNote = () => {
    const verseRef = selectedVerses.length === 1
      ? `versículo ${selectedVerses[0]}`
      : `versículos ${Math.min(...selectedVerses)}-${Math.max(...selectedVerses)}`;

    Alert.alert(
      '📝 Agregar Nota',
      `Funcionalidad mockeada para demo.\n\nEn producción, aquí podrás escribir una nota personal para ${verseRef}.`,
      [{text: 'Entendido'}]
    );
    cancelSelection();
  };

  // =====================================================
  // ✅ CONECTADO A API - Añadir a favoritos (rango o individual)
  // =====================================================
  const handleAddFavorite = async () => {
    if (selectedVerses.length === 0 || !chapterData) return;

    try {
      const minVerse = Math.min(...selectedVerses);
      const maxVerse = Math.max(...selectedVerses);

      // Determinar referencia y tag
      const isSingleVerse = selectedVerses.length === 1;
      const reference = isSingleVerse
        ? `${bookName} ${currentChapter}:${minVerse}`
        : `${bookName} ${currentChapter}:${minVerse}-${maxVerse}`;

      const tag = isSingleVerse
        ? ''
        : `Versículos ${minVerse}-${maxVerse}`;

      // Añadir directamente - el backend ahora permite múltiples combinaciones
      await favoritesService.addFavorite({
        bookId,
        chapterNumber: currentChapter,
        verseNumber: minVerse,
        tags: tag ? [tag] : [],
      });

      Alert.alert('✓', `${reference} añadido a favoritos`);
      cancelSelection();
    } catch (err: any) {
      console.error('Error añadiendo favorito:', err);
      Alert.alert('Error', 'No se pudo añadir a favoritos');
      cancelSelection();
    }
  };

  const handleShare = () => {
    const verseRef = selectedVerses.length === 1
      ? `versículo ${selectedVerses[0]}`
      : `versículos ${Math.min(...selectedVerses)}-${Math.max(...selectedVerses)}`;

    Alert.alert(
      '🔗 Compartir',
      `Funcionalidad mockeada para demo.\n\nEn producción, podrás compartir ${verseRef} en redes sociales o por mensaje.`,
      [{text: 'Entendido'}]
    );
    cancelSelection();
  };

  const handleVersePress = (verseNumber: number) => {
    if (!selectionMode) {
      // Primer toque - activar modo selección
      setSelectionMode(true);
      setSelectedVerses([verseNumber]);
    } else {
      // Ya en modo selección - toggle o extender rango
      if (selectedVerses.includes(verseNumber)) {
        // Deseleccionar
        const newSelection = selectedVerses.filter(v => v !== verseNumber);
        if (newSelection.length === 0) {
          setSelectionMode(false);
        }
        setSelectedVerses(newSelection);
      } else {
        // Extender rango si hay un solo versículo seleccionado
        if (selectedVerses.length === 1) {
          const start = Math.min(selectedVerses[0], verseNumber);
          const end = Math.max(selectedVerses[0], verseNumber);
          const range = Array.from({length: end - start + 1}, (_, i) => start + i);
          setSelectedVerses(range);
        } else {
          // Añadir individual
          setSelectedVerses([...selectedVerses, verseNumber].sort((a, b) => a - b));
        }
      }
    }
  };

  const cancelSelection = () => {
    setSelectionMode(false);
    setSelectedVerses([]);
  };

  // Añadir capítulo completo a favoritos
  const handleAddChapterToFavorites = async () => {
    if (!chapterData) return;

    try {
      // Obtener todos los versículos del capítulo
      const allVerses = chapterData.sections.flatMap(s => s.verses.map(v => v.number));
      const minVerse = Math.min(...allVerses);

      // Añadir directamente - el backend permite múltiples combinaciones
      await favoritesService.addFavorite({
        bookId,
        chapterNumber: currentChapter,
        verseNumber: minVerse,
        tags: ['Capítulo completo'],
      });

      Alert.alert('✓', `${bookName} ${currentChapter} añadido a favoritos`);
    } catch (err: any) {
      console.error('Error añadiendo capítulo:', err);
      Alert.alert('Error', 'No se pudo añadir el capítulo a favoritos');
    }
  };

  // Estado de carga
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={24} color={colors.charcoal.dark} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{bookName}</Text>
          </View>
          <View style={styles.headerActions} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.burgundy.DEFAULT} />
          <Text style={styles.loadingText}>Cargando capítulo...</Text>
        </View>
      </View>
    );
  }

  // Estado de error
  if (error || !chapterData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={24} color={colors.charcoal.dark} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{bookName}</Text>
          </View>
          <View style={styles.headerActions} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={colors.burgundy.DEFAULT} />
          <Text style={styles.errorText}>{error || 'Error desconocido'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadChapter}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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

        <View style={styles.headerCenter}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>{bookName} {currentChapter}</Text>
            <MaterialIcons name="expand-more" size={16} color={colors.secondary} style={styles.expandIcon} />
          </View>
          <Text style={styles.headerSubtitle}>{chapterData.version}</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleTextSettings}
            style={styles.iconButton}
            activeOpacity={0.7}>
            <MaterialIcons name="text-fields" size={24} color={colors.charcoal.muted} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleMoreOptions}
            style={styles.iconButton}
            activeOpacity={0.7}>
            <MaterialIcons name="more-vert" size={24} color={colors.charcoal.muted} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Content */}
        <View style={styles.content}>
          {chapterData.sections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              {/* Section Title */}
              {section.title && (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <View style={styles.sectionDivider} />
              </View>
              )}

              {/* Verses */}
              <View style={styles.versesContainer}>
                {section.verses.map((verse) => {
                  const isSelected = selectedVerses.includes(verse.number);

                  return (
                  <TouchableOpacity
                    key={verse.number}
                    style={[
                      styles.verseRow,
                      isSelected && styles.verseRowSelected,
                    ]}
                    onPress={() => handleVersePress(verse.number)}
                    activeOpacity={0.7}>
                    <Text style={[
                      styles.verseNumber,
                      isSelected && styles.verseNumberSelected,
                    ]}>{verse.number}</Text>
                    <View style={styles.verseContent}>
                      <Text
                        style={[
                          styles.verseText,
                          isSelected && styles.verseTextSelected,
                        ]}>
                        {verse.text}
                      </Text>
                      {verse.hasNote && (
                        <TouchableOpacity style={styles.noteButton}>
                          <MaterialIcons name="sticky-note-2" size={14} color={colors.secondary} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          {/* Navigation Buttons */}
          <View style={styles.navigationButtons}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={handlePreviousChapter}
              activeOpacity={0.7}>
              <MaterialIcons name="arrow-back" size={20} color={colors.charcoal.muted} />
              <View style={styles.navButtonText}>
                <Text style={styles.navButtonLabel}>ANTERIOR</Text>
                <Text style={styles.navButtonTitle}>Malaquías</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, styles.navButtonRight]}
              onPress={handleNextChapter}
              activeOpacity={0.7}>
              <View style={[styles.navButtonText, styles.navButtonTextRight]}>
                <Text style={styles.navButtonLabel}>SIGUIENTE</Text>
                <Text style={styles.navButtonTitle}>San Mateo 2</Text>
              </View>
              <MaterialIcons name="arrow-forward" size={20} color={colors.charcoal.muted} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Floating Toolbar (cuando hay versículos seleccionados) */}
      {selectionMode && selectedVerses.length > 0 && (
        <View style={styles.floatingToolbar}>
          <View style={styles.toolbarInfo}>
            <Text style={styles.toolbarText}>
              {selectedVerses.length === 1
                ? `Versículo ${selectedVerses[0]}`
                : `Versículos ${Math.min(...selectedVerses)}-${Math.max(...selectedVerses)}`}
            </Text>
          </View>

          <View style={styles.toolbarDivider} />

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={handleAddNote}
            activeOpacity={0.7}>
            <MaterialIcons name="edit-note" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={handleAddFavorite}
            activeOpacity={0.7}>
            <MaterialIcons name="favorite" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={handleShare}
            activeOpacity={0.7}>
            <MaterialIcons name="share" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.toolbarDivider} />

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={cancelSelection}
            activeOpacity={0.7}>
            <MaterialIcons name="close" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },

  // Loading y Error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.charcoal.muted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.charcoal.muted,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.burgundy.DEFAULT,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 48,
    paddingBottom: 8,
    backgroundColor: `${colors.cream}F2`,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.ivory.border}99`,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.charcoal.dark,
    lineHeight: 24,
  },
  expandIcon: {
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.charcoal.muted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
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
    paddingBottom: 24,
  },

  // Content
  content: {
    maxWidth: 700,
    alignSelf: 'center',
    width: '100%',
  },

  // Section
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.burgundy.accent,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  sectionDivider: {
    width: 64,
    height: 3,
    backgroundColor: `${colors.gold.accent}80`,
    borderRadius: 999,
  },

  // Verses
  versesContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  verseRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  verseRowSelected: {
    backgroundColor: `${colors.primary.DEFAULT}20`,
  },
  verseNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.charcoal.muted,
    marginRight: 6,
    marginTop: 6,
    minWidth: 20,
  },
  verseNumberSelected: {
    color: colors.burgundy.DEFAULT,
  },
  verseContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  verseText: {
    fontSize: 19,
    lineHeight: 34,
    color: colors.charcoal.DEFAULT,
    flex: 1,
  },
  verseTextSelected: {
    backgroundColor: `${colors.primary.DEFAULT}20`,
    borderRadius: 2,
  },
  noteButton: {
    marginLeft: 4,
    marginTop: 4,
    opacity: 0.5,
  },

  // Navigation Buttons
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  navButtonRight: {
    flexDirection: 'row-reverse',
  },
  navButtonText: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  navButtonTextRight: {
    alignItems: 'flex-end',
  },
  navButtonLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.charcoal.muted,
    letterSpacing: 1.5,
  },
  navButtonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.charcoal.dark,
  },

  // Floating Toolbar
  floatingToolbar: {
    position: 'absolute',
    top: 80,
    left: '50%',
    transform: [{translateX: -150}],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.charcoal.dark,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  toolbarInfo: {
    paddingHorizontal: 8,
  },
  toolbarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  toolbarButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  toolbarDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default ChapterReadingScreen;

