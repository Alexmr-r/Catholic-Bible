import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {ThemeColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {writingsService} from '../services/writings.service';
import {bibleService} from '../services/bible.service';
import {shareService} from '../services/share.service';
import {useFocusEffect} from '@react-navigation/native';
import {useTextSettings} from '../contexts/TextSettingsContext';
import TextSettingsModal from '../components/TextSettingsModal';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type WritingDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'WritingDetail'>;

const WritingDetailScreen: React.FC<WritingDetailScreenProps> = ({navigation, route}) => {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => getStyles(colors, isDarkMode, insets.top), [colors, isDarkMode, insets.top]);
  const {writingId, title: initialTitle, content: initialContent, bookId, bookName, chapter, verse, createdAt, isFavorite: initialFavorite} = route.params;

  // Estados mutables para título y contenido (pueden cambiar tras editar)
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [verseText, setVerseText] = useState<string | null>(null);
  const [isLoadingVerse, setIsLoadingVerse] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal de configuración de texto
  const [showTextSettings, setShowTextSettings] = useState(false);
  const {settings} = useTextSettings();

  // Debug: ver qué parámetros recibimos
  console.log('WritingDetail params:', { bookId, bookName, chapter, verse });

  // Cargar el versículo completo si existe referencia bíblica
  useEffect(() => {
    const loadVerse = async () => {
      if (bookId && chapter && verse) {
        try {
          setIsLoadingVerse(true);
          const chapterData = await bibleService.getChapter(bookId, chapter);

          // Buscar el versículo en todas las secciones
          let verseData = null;
          for (const section of chapterData.sections) {
            verseData = section.verses.find((v) => v.number === verse);
            if (verseData) break;
          }

          if (verseData) {
            setVerseText(verseData.text);
          }
        } catch (err) {
          console.error('Error cargando versículo:', err);
        } finally {
          setIsLoadingVerse(false);
        }
      }
    };

    loadVerse();
  }, [bookId, chapter, verse]);

  // Recargar datos cuando la pantalla recibe el foco (vuelve de EditWriting)
  useFocusEffect(
    React.useCallback(() => {
      const refreshWriting = async () => {
        try {
          setIsRefreshing(true);
          const writing = await writingsService.getWriting(writingId);
          setTitle(writing.title);
          setContent(writing.content);
          setIsFavorite(writing.isFavorite);
          console.log('✅ Escrito actualizado:', writing.title);
        } catch (err) {
          console.error('Error recargando escrito:', err);
        } finally {
          setIsRefreshing(false);
        }
      };

      refreshWriting();
    }, [writingId])
  );

  const handleBack = () => {
    navigation.goBack();
  };

  const handleShare = async () => {
    try {
      const reference = bookName && chapter && verse
        ? `${bookName} ${chapter}:${verse}`
        : '';

      let message = `✍️ ${title || 'My writing'}\n\n`;
      if (reference) {
        message += `📖 Based on: ${reference}\n\n`;
      }
      message += `${content}\n\n— Shared from CatholicVerse`;

      console.log('[WritingDetail] Llamando a Share.share()...');

      const result = await Share.share({
        message: message,
      });

      console.log('[WritingDetail] Resultado:', result);
    } catch (error: any) {
      console.error('Error compartiendo escrito:', error);
      Alert.alert('Error', 'Could not share. Please try again.');
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const updated = await writingsService.toggleFavorite(writingId);
      setIsFavorite(updated.isFavorite);
    } catch (err) {
      console.error('Error toggling favorite:', err);
      Alert.alert('Error', 'Could not update favorite.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete writing',
      'Are you sure you want to delete this writing?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await writingsService.deleteWriting(writingId);
              Alert.alert('✅ Deleted', 'The writing has been deleted.');
              navigation.goBack();
            } catch (err) {
              console.error('Error eliminando escrito:', err);
              Alert.alert('Error', 'Could not delete writing.');
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    navigation.navigate('EditWriting', {
      writingId,
      initialTitle: title,
      initialContent: content,
      bookName,
      chapter,
      verse,
      verseText: verseText || undefined,
      createdAt,
    });
  };

  const handleReadChapter = () => {
    if (bookId && bookName && chapter) {
      navigation.navigate('ChapterReading', {
        bookId: bookId,
        bookName: bookName,
        chapter: chapter,
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).toUpperCase();
  };

  return (
    <View style={styles.container}>
      {/* Header - igual que HTML */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.charcoal.dark} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Writing Detail</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setShowTextSettings(true)}
            style={styles.headerButton}>
            <MaterialIcons name="text-fields" size={24} color={colors.charcoal.muted} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
            <MaterialIcons name="share" size={24} color={colors.primary.DEFAULT} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Fecha y Favorito - igual que HTML */}
        <View style={styles.metaRow}>
          <View style={styles.dateChip}>
            <MaterialIcons name="calendar-today" size={18} color={colors.primary.DEFAULT} />
            <Text style={styles.dateText}>{formatDate(createdAt)}</Text>
          </View>
        </View>

        {/* Título del Escrito - grande como HTML */}
        <Text
          style={[
            styles.mainTitle,
            {
              fontSize: 28 * (settings.fontSize / 100),
              // lineHeight mínimo 1.4x para títulos
              lineHeight: Math.max(36, 28 * (settings.fontSize / 100) * 1.4),
              fontFamily: settings.fontFamily === 'sans' ? undefined : (Platform.OS === 'ios' ? 'Georgia' : 'serif'),
            },
          ]}>
          {title}
        </Text>

        {/* Contenido de la Reflexión - prosa como HTML */}
        <View style={styles.proseContent}>
          <Text
            style={[
              styles.proseText,
              {
                fontSize: 18 * (settings.fontSize / 100),
                // lineHeight mínimo 1.6x para texto
                lineHeight: Math.max(30, 18 * (settings.fontSize / 100) * 1.6),
                fontFamily: settings.fontFamily === 'sans' ? undefined : (Platform.OS === 'ios' ? 'Georgia' : 'serif'),
              },
            ]}>
            {content}
          </Text>
        </View>

        {/* Separador gradient */}
        <View style={styles.gradientDivider} />

        {/* Card del Versículo Asociado - EXACTAMENTE como HTML */}
        {bookName && chapter && verse && (
          <View style={styles.verseCard}>
            {/* Barra dorada a la izquierda */}
            <View style={styles.verseCardAccent} />

            <View style={styles.verseCardContent}>
              {/* Etiqueta VERSÍCULO ASOCIADO */}
              <View style={styles.verseLabelRow}>
                <MaterialIcons name="auto-stories" size={20} color={colors.burgundy.DEFAULT} />
                <Text style={styles.verseLabelText}>ASSOCIATED VERSE</Text>
              </View>

              {/* Referencia: Salmo 23:1 */}
              <Text style={styles.verseReference}>{bookName} {chapter}:{verse}</Text>

              {/* Texto del versículo en itálica */}
              {isLoadingVerse ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
                  <Text style={styles.loadingText}>Loading verse...</Text>
                </View>
              ) : verseText ? (
                <Text style={styles.verseText}>"{verseText}"</Text>
              ) : (
                <Text style={styles.verseText}>"The verse could not be loaded"</Text>
              )}
            </View>

            {/* Footer del card - Leer Capítulo Completo */}
            <View style={styles.verseCardFooter}>
              <TouchableOpacity style={styles.readChapterButton} onPress={handleReadChapter}>
                <Text style={styles.readChapterText}>Read Full Chapter</Text>
                <MaterialIcons name="arrow-forward" size={16} color={colors.primary.DEFAULT} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Botones de Acción - grid de 2 columnas como HTML */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <MaterialIcons name="delete" size={20} color={colors.burgundy.DEFAULT} />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <MaterialIcons name="edit-note" size={20} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Edit Writing</Text>
          </TouchableOpacity>
        </View>

        {/* Espaciado inferior */}
        <View style={{height: 32}} />
      </ScrollView>

      {/* Modal de Configuración de Texto */}
      <TextSettingsModal
        visible={showTextSettings}
        onClose={() => setShowTextSettings(false)}
      />
    </View>
  );
};

const getStyles = (colors: ThemeColors, isDarkMode: boolean, safeTop: number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? colors.background.dark : colors.cream,
  },

  // Header - igual que HTML
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Math.max(safeTop, 20) + 16,
    backgroundColor: isDarkMode ? colors.background.dark : colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: colors.ivory.border,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.charcoal.dark,
    flex: 1,
    textAlign: 'center',
  },

  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  // Meta Row (Fecha + Favorito)
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${colors.charcoal.muted}10`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.charcoal.muted,
    letterSpacing: 0.5,
  },

  // Título Principal - grande como HTML (text-3xl)
  mainTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.charcoal.dark,
    lineHeight: 38,
    marginBottom: 24,
  },

  // Contenido prosa - como HTML
  proseContent: {
    marginBottom: 32,
  },
  proseText: {
    fontSize: 16,
    lineHeight: 28,
    color: `${colors.charcoal.DEFAULT}E6`,
  },

  // Separador gradient
  gradientDivider: {
    height: 1,
    backgroundColor: colors.ivory.border,
    marginBottom: 32,
  },

  // Card del Versículo - EXACTAMENTE como HTML
  verseCard: {
    backgroundColor: isDarkMode ? colors.paper : '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: colors.ivory.border,
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  verseCardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: isDarkMode ? colors.primary.DEFAULT : colors.gold?.DEFAULT || '#CFB075',
  },
  verseCardContent: {
    padding: 20,
    paddingLeft: 28,
  },
  verseLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  verseLabelText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.burgundy.DEFAULT,
    letterSpacing: 1.5,
  },
  verseReference: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.charcoal.dark,
    marginBottom: 8,
  },
  verseText: {
    fontSize: 18,
    lineHeight: 28,
    color: colors.charcoal.muted,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.charcoal.muted,
  },
  verseCardFooter: {
    backgroundColor: `${colors.charcoal.muted}08`,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.ivory.border,
  },
  readChapterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  readChapterText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary.DEFAULT,
  },

  // Botones de Acción - grid 2 columnas como HTML
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${colors.burgundy.DEFAULT}30`,
    backgroundColor: 'transparent',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.burgundy.DEFAULT,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary.DEFAULT,
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: isDarkMode ? colors.charcoal.dark : '#FFFFFF',
  },
});

export default WritingDetailScreen;

