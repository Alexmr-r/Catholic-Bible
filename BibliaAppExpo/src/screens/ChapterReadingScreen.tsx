import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Share,
  Platform,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {ThemeColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';
import {ChapterReadingScreenProps} from '../navigation/AppNavigator';
import {bibleService, Chapter} from '../services/bible.service';
import {favoritesService} from '../services/favorites.service';
import {highlightService, Highlight, HighlightColor, getHighlightHex, HIGHLIGHT_COLORS} from '../services/highlights.service';
import {shareService} from '../services/share.service';
import {audioService} from '../services/audio.service';
import {readingHistoryService} from '../services/reading-history.service';
import {useTextSettings} from '../contexts/TextSettingsContext';
import TextSettingsModal from '../components/TextSettingsModal';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useIsOnline, useNetwork} from '../contexts/NetworkContext';

const ChapterReadingScreen: React.FC<ChapterReadingScreenProps> = ({navigation, route}) => {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => getStyles(colors, isDarkMode, insets.top), [colors, isDarkMode, insets.top]);

  const {
    bookId,
    bookName,
    chapter: initialChapter,
    testament, // Para historial de lectura
    // Parámetros desde favoritos
    fromFavorite = false, // Si viene de favoritos, ocultar navegación
    favoriteVerseNumber,  // Versículo inicial para filtrar
    favoriteVerseEnd,     // Versículo final si es un rango (ej: 1-5)
  } = route.params;

  const [selectedVerses, setSelectedVerses] = useState<number[]>([]); // Array de versículos seleccionados
  const [selectionMode, setSelectionMode] = useState(false); // Modo selección múltiple
  const [chapterData, setChapterData] = useState<Chapter | null>(null);
  const [currentChapter, setCurrentChapter] = useState(initialChapter);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para subrayados
  const [highlights, setHighlights] = useState<Map<number, Highlight>>(new Map());

  // Modal de configuración de texto
  const [showTextSettings, setShowTextSettings] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false); // Modal de opciones (3 puntos)
  const [pendingAction, setPendingAction] = useState<'share' | 'favorite' | 'audio' | null>(null);
  const {settings} = useTextSettings();

  // ✅ Hook para modo offline global
  const {isBibleDownloaded, refreshDownloadStatus} = useNetwork();
  const isOnline = useIsOnline();
  const needsDownload = !isOnline && !isBibleDownloaded;

  // Determinar si debemos filtrar versículos (solo si hay rango específico)
  const shouldFilterVerses = favoriteVerseNumber !== undefined;

  // =====================================================
  // ✅ CONECTADO A API / OFFLINE - Cargar capítulo
  // =====================================================
  useEffect(() => {
    // Si está offline y no tiene Biblia descargada, redirigir
    if (needsDownload) {
      Alert.alert(
        'Sin conexión',
        'No tienes conexión a internet. ¿Deseas descargar la Biblia para leerla sin conexión?',
        [
          {text: 'Volver', onPress: () => navigation.goBack()},
          {text: 'Descargar', onPress: () => navigation.navigate('ManageDownloads')},
        ]
      );
      return;
    }
    const initStatus = async () => {
      await refreshDownloadStatus();
    };
    initStatus();
    loadChapter();
  }, [currentChapter, needsDownload]);

  const loadChapter = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let data: Chapter | null = null;

      if (isOnline) {
        // ✅ PRIORIDAD: Si hay internet, intentar siempre la API primero
        try {
          data = await bibleService.getChapter(bookId, currentChapter);
          console.log('[ChapterReading] 🌐 Capítulo cargado desde API');
        } catch (apiError: any) {
          console.warn('[ChapterReading] ⚠️ Error API, intentando fallback local...', apiError.message);
          
          // Fallback a descarga si existe
          if (isBibleDownloaded) {
            data = await loadChapterOffline(bookId, currentChapter, bookName);
            console.log('[ChapterReading] ⚡ Fallback: Cargado desde descarga local');
          } else {
            throw apiError;
          }
        }
      } else if (isBibleDownloaded) {
        // ✅ MODO OFFLINE: Cargar desde descarga local
        data = await loadChapterOffline(bookId, currentChapter, bookName);
        console.log('[ChapterReading] 📱 Cargado desde descarga (Modo Offline)');
      }

      if (!data) {
        setError('No se pudo cargar el capítulo.');
        return;
      }

      // Si hay versículos específicos para mostrar, filtrar
      if (shouldFilterVerses && data) {
        const startVerse = favoriteVerseNumber!;
        const endVerse = favoriteVerseEnd || startVerse;

        // Filtrar los versículos en cada sección
        const filteredSections = data.sections.map(section => ({
          ...section,
          verses: section.verses.filter(
            verse => verse.number >= startVerse && verse.number <= endVerse
          ),
        })).filter(section => section.verses.length > 0); // Eliminar secciones vacías

        setChapterData({
          ...data,
          sections: filteredSections,
          // Ocultar navegación en modo favorito
          previousChapter: undefined,
          nextChapter: undefined,
        });
      } else {
        setChapterData(data);
      }

      // ✅ Guardar en historial de lectura (solo si no viene desde favoritos y se tiene testament)
      if (!fromFavorite && testament) {
        try {
          await readingHistoryService.addReading({
            bookId,
            bookName,
            chapter: currentChapter,
            testament,
          });
        } catch (err) {
          console.error('[ChapterReading] Error guardando en historial:', err);
        }
      }
    } catch (err: any) {
      console.error('Error cargando capítulo:', err);
      setError('No se pudo cargar el capítulo. Verifica tu conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función centralizada para ejecutar la acción pendiente
  const executePendingAction = () => {
    if (!pendingAction) return;

    console.log(`[ChapterReading] Ejecutando acción pendiente: ${pendingAction}`);
    const action = pendingAction;
    setPendingAction(null); // Limpiar inmediatamente para evitar duplicados

    if (action === 'share') handleShareChapter();
    else if (action === 'favorite') handleAddChapterToFavorites();
    else if (action === 'audio') handleListenAudio();
  };

  // Efecto para disparar la acción después de que el modal se cierre definitivamente (especialmente útil en Android)
  useEffect(() => {
    if (!showOptionsMenu && pendingAction && Platform.OS === 'android') {
      const timeout = setTimeout(() => {
        executePendingAction();
      }, 400); 
      return () => clearTimeout(timeout);
    }
  }, [showOptionsMenu, pendingAction]);

  // Cargar subrayados del capítulo
  const loadHighlights = async () => {
    try {
      const response = await highlightService.getChapterHighlights(bookId, currentChapter);
      const highlightMap = new Map<number, Highlight>();
      response.highlights.forEach(h => highlightMap.set(h.verseNumber, h));
      setHighlights(highlightMap);
    } catch (err) {
      // Si falla, simplemente no mostramos subrayados (no es crítico)
      console.log('No se pudieron cargar subrayados:', err);
    }
  };

  // Cargar subrayados cuando cambia el capítulo
  useEffect(() => {
    if (!isLoading && chapterData) {
      loadHighlights();
    }
  }, [currentChapter, isLoading]);

  const handleBack = () => {
    navigation.goBack();
  };

  // Navegación entre capítulos
  const handlePreviousChapter = () => {
    if (chapterData?.previousChapter) {
      const prev = chapterData.previousChapter;
      // Si es el mismo libro, solo cambiamos capítulo
      if (prev.bookId === bookId) {
        setCurrentChapter(prev.chapter);
      } else {
        // Cambiar de libro - navegar a nueva pantalla
        navigation.replace('ChapterReading', {
          bookId: prev.bookId,
          bookName: prev.bookName,
          chapter: prev.chapter,
          testament, // Mantener el testament actual
        });
      }
    }
  };

  const handleNextChapter = () => {
    if (chapterData?.nextChapter) {
      const next = chapterData.nextChapter;
      // Si es el mismo libro, solo cambiamos capítulo
      if (next.bookId === bookId) {
        setCurrentChapter(next.chapter);
      } else {
        // Cambiar de libro - navegar a nueva pantalla
        navigation.replace('ChapterReading', {
          bookId: next.bookId,
          bookName: next.bookName,
          chapter: next.chapter,
          testament, // Mantener el testament actual
        });
      }
    }
  };

  // =====================================================
  // ✅ CONECTADO - Ajustes de texto
  // =====================================================
  const handleTextSettings = () => {
    setShowTextSettings(true);
  };

  // =====================================================
  // ✅ IMPLEMENTADO - Más opciones (Modal)
  // =====================================================
  const handleMoreOptions = () => {
    setShowOptionsMenu(true);
  };

  // Compartir capítulo completo
  const handleShareChapter = async () => {
    if (!chapterData) return;

    try {
      await shareService.shareChapter({
        bookName: chapterData.bookName,
        chapter: chapterData.chapter,
        sections: chapterData.sections,
      });
    } catch (error: any) {
      console.error('[ChapterReading] Error compartiendo capítulo:', error);
      Alert.alert('Error', 'No se pudo compartir el capítulo. Intenta de nuevo.');
    }
  };

  // Escuchar audio del capítulo completo
  const handleListenAudio = async () => {
    if (!chapterData) return;

    if (audioService.getStatus().isSpeaking) {
      await audioService.stop();
      return;
    }

    try {
      const modelExists = await audioService.checkModelExists();
      
      const startSpeaking = async (engine: 'native' | 'ai-local') => {
        // Limpiar acción pendiente para evitar duplicados en el onDismiss del modal
        if (pendingAction === 'audio') {
          setPendingAction(null);
        }

        // Unir todos los versículos
        const fullText = chapterData.sections
          .map(section => {
            const sectionTitle = section.title ? `${section.title}. ` : '';
            const versesText = section.verses.map(v => `${v.number}. ${v.text}`).join(' ');
            return `${sectionTitle}${versesText}`;
          })
          .join('\n\n');

        const title = `${chapterData.bookName} Capítulo ${chapterData.chapter}`;
        await audioService.speak(fullText, title, engine);
      };

      if (!modelExists) {
        Alert.alert(
          'Narrador Premium IA',
          'Para escuchar la Biblia con voz natural, necesitas descargar el motor de IA (50MB).',
          [
            {
              text: 'Descargar Ahora',
              onPress: () => audioService.downloadModel(),
            },
            {
              text: 'Cancelar',
              style: 'cancel',
            },
          ]
        );
      } else {
        await startSpeaking('ai-local');
      }
    } catch (error) {
      console.error('[ChapterReading] Error al reproducir audio:', error);
      Alert.alert('Error', 'No se pudo iniciar la lectura de audio.');
    }
  };

  // =====================================================
  // ✅ CONECTADO A API - Subrayados
  // =====================================================
  const handleHighlight = async (color: HighlightColor) => {
    try {
      // Subrayar cada versículo seleccionado
      for (const verseNumber of selectedVerses) {
        // Encontrar el texto del versiculo para guardarlo offline
        const verseTextInfo = chapterData?.sections.flatMap(s => s.verses).find(v => v.number === verseNumber)?.text || '';

        const highlight = await highlightService.highlightVerse({
          bookId,
          chapterNumber: currentChapter,
          verseNumber,
          color,
          bookName,
          verseText: verseTextInfo,
        });
        // Actualizar el estado local
        setHighlights(prev => new Map(prev).set(verseNumber, highlight));
      }

    } catch (err) {
      console.error('Error subrayando:', err);
      Alert.alert('Error', 'No se pudo subrayar el versículo.');
    }
    cancelSelection();
  };

  const handleRemoveHighlight = async (verseNumber: number) => {
    const highlight = highlights.get(verseNumber);
    if (!highlight) return;

    try {
      await highlightService.removeHighlight(highlight.id);
      setHighlights(prev => {
        const newMap = new Map(prev);
        newMap.delete(verseNumber);
        return newMap;
      });
    } catch (err) {
      console.error('Error eliminando subrayado:', err);
    }
  };

  // Eliminar subrayados de los versículos seleccionados
  const handleRemoveSelectedHighlights = async () => {
    try {
      let removedCount = 0;
      for (const verseNumber of selectedVerses) {
        const highlight = highlights.get(verseNumber);
        if (highlight) {
          await highlightService.removeHighlight(highlight.id);
          setHighlights(prev => {
            const newMap = new Map(prev);
            newMap.delete(verseNumber);
            return newMap;
          });
          removedCount++;
        }
      }
    } catch (err) {
      console.error('Error eliminando subrayados:', err);
      Alert.alert('Error', 'No se pudieron eliminar los subrayados.');
    }
    cancelSelection();
  };

  const handleAddNote = () => {
    const verseRef = selectedVerses.length === 1
      ? `versículo ${selectedVerses[0]}`
      : `versículos ${Math.min(...selectedVerses)}-${Math.max(...selectedVerses)}`;

    Alert.alert(
      '📝 Agregar Nota',
      `Funcionalidad en desarrollo.\n\nPróximamente podrás escribir una nota para ${verseRef}.`,
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

      cancelSelection();
    } catch (err: any) {
      console.error('Error añadiendo favorito:', err);
      Alert.alert('Error', 'No se pudo añadir a favoritos');
      cancelSelection();
    }
  };

  // =====================================================
  // ✅ CONECTADO - Compartir versículos seleccionados
  // =====================================================
  const handleShare = async () => {
    if (selectedVerses.length === 0 || !chapterData) return;

    try {
      const minVerse = Math.min(...selectedVerses);
      const maxVerse = Math.max(...selectedVerses);

      // Obtener el texto de los versículos seleccionados
      let versesText = '';
      chapterData.sections.forEach(section => {
        section.verses.forEach(verse => {
          if (selectedVerses.includes(verse.number)) {
            versesText += `${verse.number}. ${verse.text}\n`;
          }
        });
      });

      let result;

      if (selectedVerses.length === 1) {
        // Versículo individual
        const verseData = chapterData.sections
          .flatMap(s => s.verses)
          .find(v => v.number === minVerse);

        result = await shareService.shareVerse({
          bookName,
          chapter: currentChapter,
          verseNumber: minVerse,
          verseText: verseData?.text || '',
        });
      } else {
        // Múltiples versículos
        result = await shareService.shareVerses({
          bookName,
          chapter: currentChapter,
          startVerse: minVerse,
          endVerse: maxVerse,
          versesText: versesText.trim(),
        });
      }

      if (result.action === 'error') {
        Alert.alert('Error', 'No se pudo compartir. Intenta de nuevo.');
      }

      cancelSelection();
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo compartir. Intenta de nuevo.');
      console.error('Error compartiendo:', error);
      cancelSelection();
    }
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
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
              <MaterialIcons name="arrow-back" size={24} color={colors.charcoal.dark} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{bookName}</Text>
          </View>
          <View style={styles.headerActions} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
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
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
              <MaterialIcons name="arrow-back" size={24} color={colors.charcoal.dark} />
            </TouchableOpacity>
          </View>
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
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={24} color={colors.charcoal.dark} />
          </TouchableOpacity>
        </View>

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
          {chapterData.sections.map((section, sectionIndex) => {
            // Usar solo el título del backend (si existe y no está vacío)
            const displayTitle = section.title && section.title.trim() !== '' ? section.title : null;

            return (
            <View key={sectionIndex} style={styles.section}>
              {/* Section Title - Solo mostrar si existe */}
              {displayTitle && (
              <View style={styles.sectionHeader}>
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      fontSize: 24 * (settings.fontSize / 100),
                      // lineHeight mínimo 1.4x para títulos
                      lineHeight: Math.max(32, 24 * (settings.fontSize / 100) * 1.4),
                      fontFamily: settings.fontFamily === 'sans' ? undefined : (Platform.OS === 'ios' ? 'Georgia' : 'serif'),
                    },
                  ]}>
                  {displayTitle}
                </Text>
                <View style={styles.sectionDivider} />
              </View>
              )}

              {/* Verses */}
              <View style={styles.versesContainer}>
                {section.verses.map((verse) => {
                  const isSelected = selectedVerses.includes(verse.number);
                  const highlight = highlights.get(verse.number);
                  const highlightBg = highlight ? getHighlightHex(highlight.color) : undefined;

                  return (
                  <TouchableOpacity
                    key={verse.number}
                    style={[
                      styles.verseRow,
                      isSelected && styles.verseRowSelected,
                      highlightBg && { backgroundColor: highlightBg },
                    ]}
                    onPress={() => handleVersePress(verse.number)}
                    onLongPress={() => highlight && handleRemoveHighlight(verse.number)}
                    activeOpacity={0.7}>
                    <Text style={[
                      styles.verseNumber,
                      isSelected && styles.verseNumberSelected,
                      highlightBg && { color: '#4A5568' }, // Número oscuro sobre resaltado
                    ]}>{verse.number}</Text>
                    <View style={styles.verseContent}>
                      <Text
                        style={[
                          styles.verseText,
                          isSelected && styles.verseTextSelected,
                          (highlightBg || isSelected) && { color: '#1A1A1A' }, // Texto oscuro sobre fondo claro (resaltado o selección)
                          {
                            fontSize: 18 * (settings.fontSize / 100),
                            // lineHeight mínimo 1.7x para buena legibilidad
                            lineHeight: Math.max(32, 18 * (settings.fontSize / 100) * 1.7),
                            fontFamily: settings.fontFamily === 'sans' ? undefined : (Platform.OS === 'ios' ? 'Georgia' : 'serif'),
                          },
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
            );
          })}

          {/* Navigation Buttons - Solo mostrar si NO viene desde favoritos */}
          {!fromFavorite && (
            <View style={styles.navigationButtons}>
              {chapterData.previousChapter ? (
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={handlePreviousChapter}
                  activeOpacity={0.7}>
                  <MaterialIcons name="arrow-back" size={20} color={colors.charcoal.muted} />
                  <View style={styles.navButtonText}>
                    <Text style={styles.navButtonLabel}>ANTERIOR</Text>
                    <Text style={styles.navButtonTitle}>
                      {chapterData.previousChapter.bookName} {chapterData.previousChapter.chapter}
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.navButton} />
              )}

              {chapterData.nextChapter ? (
                <TouchableOpacity
                  style={[styles.navButton, styles.navButtonRight]}
                  onPress={handleNextChapter}
                  activeOpacity={0.7}>
                  <View style={[styles.navButtonText, styles.navButtonTextRight]}>
                    <Text style={styles.navButtonLabel}>SIGUIENTE</Text>
                    <Text style={styles.navButtonTitle}>
                      {chapterData.nextChapter.bookName} {chapterData.nextChapter.chapter}
                    </Text>
                  </View>
                  <MaterialIcons name="arrow-forward" size={20} color={colors.charcoal.muted} />
                </TouchableOpacity>
              ) : (
                <View style={styles.navButton} />
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Toolbar (cuando hay versículos seleccionados) */}
      {selectionMode && selectedVerses.length > 0 && (
        <View style={styles.floatingToolbar}>
          <View style={styles.toolbarInfo}>
            <Text style={styles.toolbarText}>
              {selectedVerses.length === 1
                ? `v.${selectedVerses[0]}`
                : `v.${Math.min(...selectedVerses)}-${Math.max(...selectedVerses)}`}
            </Text>
          </View>

          <View style={styles.toolbarDivider} />

          {/* Botones de colores para subrayar */}
          <View style={styles.colorButtons}>
            {HIGHLIGHT_COLORS.slice(0, 4).map((colorOption) => (
              <TouchableOpacity
                key={colorOption.name}
                style={[styles.colorButton, { backgroundColor: colorOption.hex }]}
                onPress={() => handleHighlight(colorOption.name)}
                activeOpacity={0.7}
              />
            ))}
          </View>

          {/* Botón de borrador para quitar subrayado */}
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={handleRemoveSelectedHighlights}
            activeOpacity={0.7}>
            <MaterialIcons name="format-color-reset" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.toolbarDivider} />

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={handleAddFavorite}
            activeOpacity={0.7}>
            <MaterialIcons name="favorite" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={handleShare}
            activeOpacity={0.7}>
            <MaterialIcons name="share" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={cancelSelection}
            activeOpacity={0.7}>
            <MaterialIcons name="close" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Modal de Configuración de Texto */}
      <TextSettingsModal
        visible={showTextSettings}
        onClose={() => setShowTextSettings(false)}
      />

      {/* Modal de Opciones (3 puntos) */}
      <Modal
        visible={showOptionsMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOptionsMenu(false)}
        onDismiss={() => {
          // onDismiss solo funciona en iOS y es el lugar perfecto para disparar el Share
          console.log('[ChapterReading] Modal onDismiss disparado (iOS)');
          if (Platform.OS === 'ios') executePendingAction();
        }}>
        <View style={styles.optionsModalOverlay}>
          {/* Overlay para cerrar al tocar fuera */}
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={() => setShowOptionsMenu(false)}
          />

          {/* Menú de opciones */}
          <View style={styles.optionsMenuContainer}>
            {/* Guardar capítulo completo */}
            <TouchableOpacity
              style={styles.optionsMenuItem}
              onPress={() => {
                setShowOptionsMenu(false);
                setPendingAction('favorite');
              }}
              activeOpacity={0.7}>
              <View style={styles.optionsMenuIcon}>
                <MaterialIcons name="bookmark" size={20} color={colors.gold.DEFAULT} />
              </View>
              <Text style={styles.optionsMenuText}>Guardar capítulo completo</Text>
            </TouchableOpacity>

            {/* Compartir capítulo */}
            <TouchableOpacity
              style={styles.optionsMenuItem}
              onPress={() => {
                setShowOptionsMenu(false);
                setPendingAction('share');
              }}
              activeOpacity={0.7}>
              <View style={styles.optionsMenuIcon}>
                <MaterialIcons name="share" size={20} color={colors.gold.DEFAULT} />
              </View>
              <Text style={styles.optionsMenuText}>Compartir capítulo</Text>
            </TouchableOpacity>

            {/* Escuchar audio */}
            <TouchableOpacity
              style={styles.optionsMenuItem}
              onPress={() => {
                setShowOptionsMenu(false);
                setPendingAction('audio');
              }}
              activeOpacity={0.7}>
              <View style={styles.optionsMenuIcon}>
                <MaterialIcons name="headphones" size={20} color={colors.gold.DEFAULT} />
              </View>
              <Text style={styles.optionsMenuText}>Escuchar audio</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const loadChapterOffline = async (bookId: string, chapter: number, bookName: string): Promise<Chapter | null> => {
  const {BibleOfflineService} = await import('../services/english-bible-download.service');
  // Usar toLowerCase para asegurar coincidencia con el JSON
  const offlineChapter = await BibleOfflineService.getChapter(bookId.toLowerCase(), chapter);

  if (!offlineChapter) return null;

  return {
    book: bookId,
    bookName: bookName,
    chapter: chapter,
    version: 'Offline',
    sections: [{
      title: '',
      verses: offlineChapter.verses.map(v => ({
        number: v.verse,
        text: v.text,
        hasNote: false,
      })),
    }],
    previousChapter: chapter > 1 ? {
      bookId,
      bookName,
      chapter: chapter - 1,
    } : undefined,
    nextChapter: {
      bookId,
      bookName,
      chapter: chapter + 1,
    },
  };
};

const getStyles = (colors: ThemeColors, isDarkMode: boolean, safeTop: number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? colors.background.dark : colors.cream,
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
    paddingTop: Math.max(safeTop, 20) + 16,
    paddingBottom: 8,
    backgroundColor: isDarkMode ? colors.background.dark : colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: colors.ivory.border,
  },
  headerLeft: {
    width: 80,
    alignItems: 'flex-start',
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
    width: 80,
    justifyContent: 'flex-end',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },

  // Content
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
    color: isDarkMode ? colors.primary.DEFAULT : colors.burgundy.DEFAULT, 
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  sectionDivider: {
    width: 64,
    height: 3,
    backgroundColor: isDarkMode ? `${colors.primary.DEFAULT}66` : `${colors.gold.accent}80`,
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
    backgroundColor: isDarkMode ? `${colors.primary.DEFAULT}33` : `${colors.primary.DEFAULT}20`,
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
    backgroundColor: isDarkMode ? `${colors.primary.DEFAULT}33` : `${colors.primary.DEFAULT}20`,
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
    top: 90,
    alignSelf: 'center', // Centrado y más estrecho
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1E', // Color premium casi negro
    borderRadius: 30, // Forma de cápsula/pill
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12, // Mejor espacio entre elementos
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // Borde sutil premium
    zIndex: 1000,
  },
  toolbarInfo: {
    paddingHorizontal: 4,
  },
  toolbarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  toolbarButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  colorButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
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

  // Modal de Opciones
  optionsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  optionsMenuContainer: {
    position: 'absolute',
    top: 56,
    right: 16,
    width: 280,
    backgroundColor: isDarkMode ? colors.paper : '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: isDarkMode ? 1 : 0,
    borderColor: colors.ivory.border,
  },
  optionsMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 16,
  },
  optionsMenuIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${colors.gold.DEFAULT}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsMenuText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.charcoal.dark,
  },
});

export default ChapterReadingScreen;

