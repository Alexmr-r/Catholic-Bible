import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Keyboard,
  Share,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {colors} from '../theme/colors';
import {DailyReadingScreenProps} from '../navigation/AppNavigator';
import {dailyReadingService, DailyReading} from '../services/daily-reading.service';
import {writingsService} from '../services/writings.service';
import {readingProgressService} from '../services/reading-progress.service';
import {useTextSettings} from '../contexts/TextSettingsContext';
import TextSettingsModal from '../components/TextSettingsModal';

const DailyReadingScreen: React.FC<DailyReadingScreenProps> = ({navigation, route}) => {
  const [reflection, setReflection] = useState('');
  const [reflectionTitle, setReflectionTitle] = useState('');
  const [showFab, setShowFab] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  // Refs para navegar entre inputs de reflexión
  const reflectionTitleRef = useRef<TextInput>(null);
  const reflectionContentRef = useRef<TextInput>(null);

  // Modal de configuración de texto
  const [showTextSettings, setShowTextSettings] = useState(false);
  const {settings} = useTextSettings();

  // ✅ CONECTADO A API - Estados de datos
  const [dailyReading, setDailyReading] = useState<DailyReading | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSavingReflection, setIsSavingReflection] = useState(false);
  const [isMarkedAsRead, setIsMarkedAsRead] = useState(false);
  const [isReadingCompleted, setIsReadingCompleted] = useState(false);

  // Obtener fecha del parámetro (si viene del calendario)
  const targetDate = route?.params?.date;

  // ✅ NUEVO: Auto-guardado con debounce
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState('');

  // =====================================================
  // ✅ NUEVO - Auto-guardado con debounce
  // =====================================================
  useEffect(() => {
    // Solo auto-guardar si hay contenido y ha cambiado
    if (reflection.trim() && reflection !== lastSavedContent && dailyReading) {
      // Limpiar timer anterior
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Iniciar nuevo timer de 2 segundos
      autoSaveTimerRef.current = setTimeout(() => {
        autoSaveReflection();
      }, 2000);
    }

    // Cleanup
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [reflection, dailyReading]);

  const autoSaveReflection = async () => {
    if (!dailyReading || !reflection.trim() || isSavingReflection) return;

    try {
      setIsAutoSaving(true);

      const existingWritings = await writingsService.getWritings({
        bookId: dailyReading.bookId,
      });

      const existingReflection = existingWritings.writings.find(w =>
        w.bookId === dailyReading.bookId &&
        w.chapter === dailyReading.chapterNumber &&
        w.verse === dailyReading.verseNumbers[0] &&
        w.tags.includes('lectura-diaria')
      );

      if (existingReflection) {
        // Actualizar existente
        await writingsService.updateWriting(existingReflection.id, {
          title: reflectionTitle.trim() || '',
          content: reflection,
        });
      } else {
        // Crear nueva
        await writingsService.createWriting({
          title: reflectionTitle.trim() || '',
          content: reflection,
          bookId: dailyReading.bookId,
          chapter: dailyReading.chapterNumber,
          verse: dailyReading.verseNumbers[0],
          tags: ['reflexión', 'lectura-diaria'],
        });
      }

      // Marcar como completado si no lo está
      if (!isReadingCompleted) {
        const dateToMark = targetDate || new Date().toISOString().split('T')[0];
        await readingProgressService.markAsComplete(
          dateToMark,
          dailyReading.id !== 'fallback' ? dailyReading.id : undefined
        );
        setIsReadingCompleted(true);
      }

      setLastSavedContent(reflection);
      console.log('✅ Auto-guardado exitoso');
    } catch (err) {
      console.error('Error en auto-guardado:', err);
      // No mostrar alert en auto-guardado para no interrumpir al usuario
    } finally {
      setIsAutoSaving(false);
    }
  };

  // =====================================================
  // ✅ CONECTADO A API - Cargar lectura del día o fecha específica
  // =====================================================
  useEffect(() => {
    if (targetDate) {
      loadReadingByDate(targetDate);
    } else {
      loadTodayReading();
    }
  }, [targetDate]);

  const loadTodayReading = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const reading = await dailyReadingService.getTodayReading();
      setDailyReading(reading);

      // Verificar si ya está marcada como completada
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const completed = await readingProgressService.isDateCompleted(today);
      setIsReadingCompleted(completed);

      // Cargar reflexión existente si hay
      await loadExistingReflection(reading);
    } catch (err: any) {
      console.error('Error cargando lectura del día:', err);
      setError('No se pudo cargar la lectura del día. Por favor, intenta de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadReadingByDate = async (date: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const reading = await dailyReadingService.getReadingByDate(date);
      setDailyReading(reading);

      // Verificar si ya está marcada como completada
      const completed = await readingProgressService.isDateCompleted(date);
      setIsReadingCompleted(completed);

      // Cargar reflexión existente si hay
      await loadExistingReflection(reading);
    } catch (err: any) {
      console.error('Error cargando lectura:', err);
      setError('No se pudo cargar la lectura. Por favor, intenta de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================
  // ✅ NUEVO - Cargar reflexión existente
  // =====================================================
  const loadExistingReflection = async (reading: DailyReading) => {
    try {
      const writings = await writingsService.getWritings({
        bookId: reading.bookId,
      });

      const existingReflection = writings.writings.find(w =>
        w.bookId === reading.bookId &&
        w.chapter === reading.chapterNumber &&
        w.verse === reading.verseNumbers[0] &&
        w.tags.includes('lectura-diaria')
      );

      if (existingReflection) {
        setReflectionTitle(existingReflection.title || '');
        setReflection(existingReflection.content);
        setLastSavedContent(existingReflection.content); // Para que el botón muestre "GUARDADO"
      } else {
        // Limpiar si no hay reflexión
        setReflectionTitle('');
        setReflection('');
        setLastSavedContent('');
      }
    } catch (err) {
      console.error('Error cargando reflexión:', err);
      // No mostrar error al usuario, solo no cargar reflexión
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // =====================================================
  // ✅ CONECTADO - Abrir calendario de constancia
  // =====================================================
  const handleCalendar = () => {
    navigation.navigate('ReadingCalendar');
  };

  // =====================================================
  // 🔴 MOCKEADO - Reproducir audio de la lectura
  // =====================================================
  const handlePlayAudio = () => {
    Alert.alert(
      '🎧 Reproducir Audio',
      'Funcionalidad en desarrollo.\n\nPróximamente podrás escuchar la lectura.',
      [{text: 'Entendido'}]
    );
  };

  // =====================================================
  // ✅ CONECTADO - Compartir lectura
  // =====================================================
  const handleShare = async () => {
    if (!dailyReading) return;

    try {
      const message = `📖 Lectura del día - ${formatDate(dailyReading.date)}\n\n${dailyReading.biblicalReference}\n\n"${dailyReading.readingText}"\n\n🙏 Compartido desde Biblia App`;

      const result = await Share.share({
        message: message,
        title: `Lectura del día - ${dailyReading.biblicalReference}`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Compartido con actividad específica (iOS)
          console.log('Compartido con:', result.activityType);
        } else {
          // Compartido (Android)
          console.log('Contenido compartido');
        }
      } else if (result.action === Share.dismissedAction) {
        // Usuario canceló
        console.log('Compartir cancelado');
      }
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo compartir. Intenta de nuevo.');
      console.error('Error compartiendo:', error);
    }
  };

  // =====================================================
  // ✅ CONECTADO A API - Marcar/Desmarcar como completada
  // =====================================================
  const handleBookmark = async () => {
    if (!dailyReading) return;

    // Usar targetDate si viene del calendario, sino usar hoy
    const dateToMark = targetDate || new Date().toISOString().split('T')[0];

    try {
      if (isReadingCompleted) {
        // Desmarcar
        await readingProgressService.unmarkAsComplete(dateToMark);
        setIsReadingCompleted(false);
        Alert.alert('✅ Lectura desmarcada', 'Se ha quitado del registro.');
      } else {
        // Marcar como completada
        await readingProgressService.markAsComplete(
          dateToMark,
          dailyReading.id !== 'fallback' ? dailyReading.id : undefined
        );
        setIsReadingCompleted(true);
        Alert.alert('✅ Lectura completada', 'Se ha registrado en tu calendario de constancia.');
      }
    } catch (err) {
      console.error('Error marcando lectura:', err);
      // Intentar marcar localmente de todos modos
      setIsReadingCompleted(!isReadingCompleted);
    }
  };

  // =====================================================
  // ✅ CONECTADO A API - Guardar reflexión personal
  // =====================================================
  const handleSaveReflection = async () => {
    if (!reflection.trim()) {
      Alert.alert('⚠️ Campo vacío', 'Escribe tu reflexión antes de guardar.');
      return;
    }
    if (!dailyReading) return;

    try {
      setIsSavingReflection(true);

      // Verificar si ya existe una reflexión para este día
      const existingWritings = await writingsService.getWritings({
        bookId: dailyReading.bookId,
      });

      // Buscar si hay alguna reflexión del mismo capítulo y versículo
      const existingReflection = existingWritings.writings.find(w =>
        w.bookId === dailyReading.bookId &&
        w.chapter === dailyReading.chapterNumber &&
        w.verse === dailyReading.verseNumbers[0] &&
        w.tags.includes('lectura-diaria')
      );

      if (existingReflection) {
        // Ya existe una reflexión para este día - Actualizar
        await writingsService.updateWriting(existingReflection.id, {
          title: reflectionTitle.trim() || '',
          content: reflection,
        });
        Alert.alert('✅ Reflexión Actualizada', 'Tu reflexión se ha actualizado correctamente.');
      } else {
        // No existe reflexión previa, crear nueva
        const title = reflectionTitle.trim() || '';

        await writingsService.createWriting({
          title: title,
          content: reflection,
          bookId: dailyReading.bookId,
          chapter: dailyReading.chapterNumber,
          verse: dailyReading.verseNumbers[0],
          tags: ['reflexión', 'lectura-diaria'],
        });

        Alert.alert('✅ Reflexión Guardada', 'Tu reflexión se ha guardado en tus escritos.');
      }

      // ✅ NUEVO: Marcar automáticamente como completado
      if (!isReadingCompleted) {
        const dateToMark = targetDate || new Date().toISOString().split('T')[0];
        try {
          await readingProgressService.markAsComplete(
            dateToMark,
            dailyReading.id !== 'fallback' ? dailyReading.id : undefined
          );
          setIsReadingCompleted(true);
          console.log('✅ Lectura marcada automáticamente como completada');
        } catch (err) {
          console.error('Error marcando lectura:', err);
          // No mostrar error al usuario, la reflexión sí se guardó
        }
      }

      // Limpiar campos después de guardar nueva reflexión
      if (!existingReflection) {
        setReflection('');
        setReflectionTitle('');
      }
    } catch (err: any) {
      console.error('Error guardando reflexión:', err);
      const message = err.message || 'No se pudo guardar la reflexión.';
      Alert.alert('Error', message);
    } finally {
      setIsSavingReflection(false);
    }
  };

  // Estado de carga
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        <Text style={styles.loadingText}>Cargando lectura del día...</Text>
      </View>
    );
  }

  // Estado de error
  if (error || !dailyReading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <MaterialIcons name="error-outline" size={48} color={colors.burgundy.DEFAULT} />
        <Text style={styles.errorText}>{error || 'Error desconocido'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadTodayReading}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  return (
    <View style={styles.container}>
      {/* Header Sticky */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {targetDate && (
            <TouchableOpacity
              onPress={handleBack}
              activeOpacity={0.7}
              style={styles.headerButton}>
              <MaterialIcons name="arrow-back" size={24} color={colors.ink.light} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.headerSubtitle}>LITURGIA DE HOY</Text>
          <Text style={styles.headerTitle}>{formatDate(dailyReading.date)}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => setShowTextSettings(true)}
            activeOpacity={0.7}
            style={styles.headerButton}>
            <MaterialIcons name="text-fields" size={22} color={colors.charcoal.muted} />
          </TouchableOpacity>
          {!targetDate && (
            <TouchableOpacity
              onPress={handleCalendar}
              activeOpacity={0.7}
              style={styles.headerButton}>
              <MaterialIcons name="calendar-today" size={22} color={colors.ink.light} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ScrollView */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        onScroll={(event) => {
          const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
          const isNearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 400;
          setShowFab(!isNearBottom);
        }}>

        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLcwLMBOBEu02HwpQ_FxcSgNX8lkdl2CMw0GNmehfCUWKQgEz-FLZLvWKvFrFhd5LtE9XtmyIgwNV-U1GI8YLA1QUFSG6vGibTBaaWWIRGMXQYBqV5c-1W6C1H3HxqdSo29JCCloTzHLPSbsLR2S0l-ZR6roDjT77Et5Pog9uK-IdmTewGGxEtzvQTE6mvoUZCVspGNTbrshaItwXzKyfSGXMXe0tEZs4ylDADOmTtAx1DoWHuIZv6utdWfnNf35jowc_Mvf6Uj9NO',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(250, 250, 245, 0)', 'rgba(250, 250, 245, 1)']}
            style={styles.heroGradient}
          />
          <View style={styles.heroContent}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{dailyReading.badge}</Text>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <Text style={styles.readingTitle}>
            {dailyReading.biblicalReference}
          </Text>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handlePlayAudio}
              activeOpacity={0.7}>
              <MaterialIcons name="play-circle-outline" size={20} color={colors.sky} />
              <Text style={styles.actionButtonText}>Escuchar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleShare}
              activeOpacity={0.7}>
              <MaterialIcons name="share" size={20} color={colors.ink.light} />
              <Text style={styles.actionButtonText}>Compartir</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonLast]}
              onPress={handleBookmark}
              activeOpacity={0.7}>
              <MaterialIcons
                name={isReadingCompleted ? "check-circle" : "check-circle-outline"}
                size={24}
                color={isReadingCompleted ? colors.primary.DEFAULT : colors.ink.light}
              />
            </TouchableOpacity>
          </View>

          {/* Reading Text */}
          <View style={styles.readingContent}>
            <Text
              style={[
                styles.readingParagraph,
                {
                  fontSize: 18 * (settings.fontSize / 100),
                  // lineHeight fijo - solo crece el texto, no el espaciado
                  fontFamily: settings.fontFamily,
                },
              ]}>
              <Text style={[
                styles.firstLetter,
                {
                    lineHeight: 34 * (settings.fontSize / 100),
                  fontSize: 35 * (settings.fontSize / 100),
                  fontFamily: settings.fontFamily,
                },
              ]}>
                {dailyReading.readingText.charAt(0)}
              </Text>
              {dailyReading.readingText.slice(1)}
            </Text>
          </View>

          {/* Reflection Card */}
          <View style={styles.reflectionCard}>
            <View style={styles.reflectionHeader}>
              <View style={styles.reflectionTitleContainer}>
                <MaterialIcons name="edit-note" size={20} color={colors.primary.DEFAULT} />
                <Text style={styles.reflectionTitle}>REFLEXIÓN PERSONAL</Text>
              </View>
              <Text style={styles.reflectionPrivate}>PRIVADO</Text>
            </View>

            {/* Título de la reflexión */}
            <View style={styles.reflectionTitleInputContainer}>
              <TextInput
                ref={reflectionTitleRef}
                style={styles.reflectionTitleInput}
                placeholder="Título de tu reflexión..."
                placeholderTextColor={`${colors.charcoal.muted}60`}
                value={reflectionTitle}
                onChangeText={setReflectionTitle}
                returnKeyType="next"
                onSubmitEditing={() => reflectionContentRef.current?.focus()}
              />
            </View>

            {/* Divisor */}
            <View style={styles.reflectionDivider} />

            {/* Contenido de la reflexión */}
            <View style={styles.reflectionContentContainer}>
              <TextInput
                ref={reflectionContentRef}
                style={styles.reflectionInput}
                placeholder="Escribe aquí lo que el Señor te inspira hoy..."
                placeholderTextColor={`${colors.charcoal.muted}60`}
                value={reflection}
                onChangeText={setReflection}
                multiline
                textAlignVertical="top"
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
              />
            </View>

            <View style={styles.reflectionFooter}>
              <View style={styles.autoSaveContainer}>
                <MaterialIcons
                  name={isAutoSaving ? "cloud-upload" : "cloud-done"}
                  size={14}
                  color={isAutoSaving ? colors.primary.DEFAULT : colors.charcoal.muted}
                />
                <Text style={[
                  styles.autoSaveText,
                  isAutoSaving && {color: colors.primary.DEFAULT}
                ]}>
                  {isAutoSaving ? 'Guardando...' : 'Guardado automático'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* FAB - Botón circular para hacer scroll a Reflexión */}
      {showFab && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }}
          activeOpacity={0.8}>
          <MaterialIcons name="edit-note" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Modal de Configuración de Texto */}
      <TextSettingsModal
        visible={showTextSettings}
        onClose={() => setShowTextSettings(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },

  // Header Sticky
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48, // Para notch
    backgroundColor: `${colors.cream}F2`, // 95% opacity
    borderBottomWidth: 1,
    borderBottomColor: colors.ivory.border,
  },
  headerLeft: {
    width: 40,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
    color: colors.burgundy.accent,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.charcoal.dark,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16, // Mínimo espacio para separación visual, no para scroll
  },

  // Hero Image
  heroContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
   // ✅ Más suave y transparente como en el diseño
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80, // ✅ Degradado en la parte inferior para suavizar el corte
  },
  heroContent: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: `${colors.burgundy.accent}E6`, // 90% opacity - Rojo más clarito
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#FFFFFF',
  },

  // Content Section
  contentSection: {
    paddingHorizontal: 24,
    marginTop: -24, // Overlap con hero
    position: 'relative',
    zIndex: 10,
  },
  readingTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary.DEFAULT,
    lineHeight: 36,
    marginBottom: 8,
    letterSpacing: -0.5,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.ivory.border,
    marginBottom: 24,
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonLast: {
    marginLeft: 'auto',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    color: colors.ink.light,
    textTransform: 'uppercase',
  },

  // Reading Content
  readingContent: {
    marginBottom: 32,
    flexShrink: 0, // ✅ No se encoge - permite scroll completo
  },
  readingParagraph: {
    fontSize: 18,
    color: colors.charcoal.DEFAULT,
    marginBottom: 16,
    flexWrap: 'wrap', // Permite que el texto se envuelva
    overflow: 'visible', // Asegura que el texto no se corte
  },
  firstLetter: {
    color: colors.gold.accent,
    fontWeight: '700',
  },

  // Reflection Card
  reflectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.ivory.border,
    borderLeftWidth: 4,
    borderLeftColor: `${colors.gold.accent}80`,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reflectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: `${colors.paper}30`,
    borderBottomWidth: 1,
    borderBottomColor: colors.ivory.border,
  },
  reflectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reflectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.primary.DEFAULT,
  },
  reflectionPrivate: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1.5,
    color: colors.ink.light,
  },
  reflectionTitleInputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 8,
  },
  reflectionTitleInput: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.charcoal.DEFAULT,
    padding: 0,
  },
  reflectionDivider: {
    height: 1,
    backgroundColor: colors.ivory.border,
    marginHorizontal: 20,
  },
  reflectionContentContainer: {
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexGrow: 1,
    minHeight: 140,
  },
  reflectionInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: colors.charcoal.DEFAULT,
    fontStyle: 'italic',
    minHeight: 140,
  },
  reflectionFooter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: `${colors.paper}50`,
  },
  autoSaveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  autoSaveText: {
    fontSize: 10,
    color: colors.charcoal.muted,
  },

  // Save Reflection Button (Dentro del scroll)
  saveReflectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.primary.DEFAULT,
    height: 56,
    borderRadius: 12,
    marginTop: 16, // Reducido de 24 para estar más pegado
    marginBottom: 16, // Añadido para separación del borde inferior
    marginHorizontal: 0, // Sin márgenes para que sea igual de ancho que la card
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  saveReflectionButtonSaved: {
    backgroundColor: colors.charcoal.muted, // Color más suave cuando ya está guardado
    shadowOpacity: 0.1,
  },
  saveReflectionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#FFFFFF',
  },

  // FAB (Floating Action Button) - Botón circular
  fab: {
    position: 'absolute',
    bottom: 26,
    right: 20, // 20px = right-5 en Tailwind
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Loading & Error states
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.charcoal.muted,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.burgundy.DEFAULT,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

});

export default DailyReadingScreen;

