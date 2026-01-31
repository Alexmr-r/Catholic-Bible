import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {colors} from '../theme/colors';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {writingsService} from '../services/writings.service';
import {bibleService} from '../services/bible.service';

type WritingDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'WritingDetail'>;

const WritingDetailScreen: React.FC<WritingDetailScreenProps> = ({navigation, route}) => {
  const {writingId, title, content, bookId, bookName, chapter, verse, createdAt, isFavorite: initialFavorite} = route.params;
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [verseText, setVerseText] = useState<string | null>(null);
  const [isLoadingVerse, setIsLoadingVerse] = useState(false);

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

  const handleBack = () => {
    navigation.goBack();
  };

  const handleShare = () => {
    Alert.alert('Compartir', 'Funcionalidad próximamente disponible.');
  };

  const handleToggleFavorite = async () => {
    try {
      const updated = await writingsService.toggleFavorite(writingId);
      setIsFavorite(updated.isFavorite);
    } catch (err) {
      console.error('Error toggling favorite:', err);
      Alert.alert('Error', 'No se pudo actualizar el favorito.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar escrito',
      '¿Estás seguro de que quieres eliminar este escrito?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await writingsService.deleteWriting(writingId);
              Alert.alert('✅ Eliminado', 'El escrito ha sido eliminado.');
              navigation.goBack();
            } catch (err) {
              console.error('Error eliminando escrito:', err);
              Alert.alert('Error', 'No se pudo eliminar el escrito.');
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    Alert.alert('Editar', 'Funcionalidad próximamente disponible.');
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
          <MaterialIcons name="arrow-back-ios" size={24} color={colors.primary.DEFAULT} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Detalle del Escrito</Text>

        <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
          <MaterialIcons name="share" size={24} color={colors.primary.DEFAULT} />
        </TouchableOpacity>
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
          <TouchableOpacity onPress={handleToggleFavorite}>
            <MaterialIcons
              name={isFavorite ? "star" : "star-border"}
              size={20}
              color={colors.gold?.DEFAULT || '#CFB075'}
            />
          </TouchableOpacity>
        </View>

        {/* Título del Escrito - grande como HTML */}
        <Text style={styles.mainTitle}>{title}</Text>

        {/* Contenido de la Reflexión - prosa como HTML */}
        <View style={styles.proseContent}>
          <Text style={styles.proseText}>{content}</Text>
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
                <Text style={styles.verseLabelText}>VERSÍCULO ASOCIADO</Text>
              </View>

              {/* Referencia: Salmo 23:1 */}
              <Text style={styles.verseReference}>{bookName} {chapter}:{verse}</Text>

              {/* Texto del versículo en itálica */}
              {isLoadingVerse ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
                  <Text style={styles.loadingText}>Cargando versículo...</Text>
                </View>
              ) : verseText ? (
                <Text style={styles.verseText}>"{verseText}"</Text>
              ) : (
                <Text style={styles.verseText}>"El versículo no pudo cargarse"</Text>
              )}
            </View>

            {/* Footer del card - Leer Capítulo Completo */}
            <View style={styles.verseCardFooter}>
              <TouchableOpacity style={styles.readChapterButton} onPress={handleReadChapter}>
                <Text style={styles.readChapterText}>Leer Capítulo Completo</Text>
                <MaterialIcons name="arrow-forward" size={16} color={colors.primary.DEFAULT} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Botones de Acción - grid de 2 columnas como HTML */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <MaterialIcons name="delete" size={20} color={colors.burgundy.DEFAULT} />
            <Text style={styles.deleteButtonText}>Eliminar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <MaterialIcons name="edit-note" size={20} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Editar Escrito</Text>
          </TouchableOpacity>
        </View>

        {/* Espaciado inferior */}
        <View style={{height: 32}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },

  // Header - igual que HTML
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
    backgroundColor: `${colors.cream}F2`,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.ivory.border}99`,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: colors.gold?.DEFAULT || '#CFB075',
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
    color: '#FFFFFF',
  },
});

export default WritingDetailScreen;

