import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import {MaterialIcons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {ThemeColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';
import {DailyReadingScreenProps} from '../navigation/AppNavigator';
import {dailyReadingService, DailyReading} from '../services/daily-reading.service';
import {writingsService} from '../services/writings.service';
import {shareService} from '../services/share.service';
import {readingProgressService} from '../services/reading-progress.service';
import {useTextSettings} from '../contexts/TextSettingsContext';
import {useIsOnline} from '../contexts/NetworkContext';
import {cacheService} from '../services/cache.service';
import {audioService} from '../services/audio.service';
import TextSettingsModal from '../components/TextSettingsModal';
import OfflineBanner from '../components/OfflineBanner';
import TrialWelcomeModal from '../components/TrialWelcomeModal';
import {useAuth} from '../contexts/AuthContext';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const DailyReadingScreen: React.FC<DailyReadingScreenProps> = ({navigation, route}) => {
  const { colors, isDarkMode } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => getStyles(colors, isDarkMode, insets.top), [colors, isDarkMode, insets.top]);

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

  // ✅ Estado de conexión
  const isOnline = useIsOnline();
  const [isUsingCache, setIsUsingCache] = useState(false);

  // ✅ CONECTADO A API - Estados de datos
  const [dailyReading, setDailyReading] = useState<DailyReading | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSavingReflection, setIsSavingReflection] = useState(false);
  const [isMarkedAsRead, setIsMarkedAsRead] = useState(false);
  const [isReadingCompleted, setIsReadingCompleted] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);

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
  }, [reflection, dailyReading, lastSavedContent]);

  // ✅ Alerta de bienvenida Trial (una sola vez por usuario)
  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        if (!user) return;
        const key = `@cv_trial_shown_${user.id}`;
        const shown = await AsyncStorage.getItem(key);
        if (!shown) setShowTrialModal(true);
      } catch (e) {
        console.warn('Trial check error', e);
      }
    };
    if (user) checkFirstTime();
  }, [user]);

  const handleCloseTrialModal = async () => {
    setShowTrialModal(false);
    if (user) await AsyncStorage.setItem(`@cv_trial_shown_${user.id}`, 'true');
  };

  const handleViewPlans = async () => {
    setShowTrialModal(false);
    if (user) await AsyncStorage.setItem(`@cv_trial_shown_${user.id}`, 'true');
    navigation.navigate('Paywall');
  };

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
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    try {
      setError(null);
      
      // 1. INTENTO CARGAR CACHÉ PRIMERO (Súper rápido)
      const cachedReading = await cacheService.getDailyReading(today);
      if (cachedReading) {
        setDailyReading(cachedReading);
        setIsUsingCache(true);
        setIsLoading(false); // Ya mostramos algo, no necesitamos spinner bloqueante
        console.log('[DailyReading] ⚡ Mostrando caché instantáneo');
        
        // Cargar progreso y reflexiones para el caché
        const completed = await readingProgressService.isDateCompleted(today);
        setIsReadingCompleted(completed);
        await loadExistingReflection(cachedReading);
      } else {
        setIsLoading(true);
      }

      // 2. INTENTO ACTUALIZAR EN SEGUNDO PLANO SI ESTAMOS ONLINE
      if (isOnline) {
        try {
          // Timeout rápido para no quedar colgados
          const freshReading = await dailyReadingService.getTodayReading();
          
          // Actualizamos si no había nada o si es diferente (opcional: comparar IDs)
          setDailyReading(freshReading);
          setIsUsingCache(false);
          await cacheService.setDailyReading(today, freshReading);
          
          // Actualizar estado relacionado
          const completed = await readingProgressService.isDateCompleted(today);
          setIsReadingCompleted(completed);
          await loadExistingReflection(freshReading);
          
          console.log('[DailyReading] ✅ Datos actualizados desde servidor');
        } catch (apiError) {
          console.warn('[DailyReading] No se pudo actualizar desde el servidor:', apiError);
          if (!cachedReading) {
            setError('Restore connection to read today\'s reading.');
          }
        }
      } else if (!cachedReading) {
        setError('Restore connection to read today\'s reading.');
      }
    } catch (err: any) {
      console.error('Error cargando lectura del día:', err);
      if (!dailyReading) {
        setError('Could not load today\'s reading.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadReadingByDate = async (date: string) => {
    try {
      setError(null);
      
      // 1. INTENTO CARGAR CACHÉ
      const cachedReading = await cacheService.getDailyReading(date);
      if (cachedReading) {
        setDailyReading(cachedReading);
        setIsUsingCache(true);
        setIsLoading(false);
        await loadExistingReflection(cachedReading);
      } else {
        setIsLoading(true);
      }

      // 2. ACTUALIZAR ONLINE
      if (isOnline) {
        try {
          const freshReading = await dailyReadingService.getReadingByDate(date);
          setDailyReading(freshReading);
          setIsUsingCache(false);
          await cacheService.setDailyReading(date, freshReading);
          await loadExistingReflection(freshReading);
        } catch (apiError) {
          console.warn('[DailyReading] Error actualización fecha:', date, apiError);
          if (!cachedReading) {
            setError('Restore connection to view this date.');
          }
        }
      } else if (!cachedReading) {
        setError('Restore connection to view this date.');
      }
    } catch (err) {
      console.error('Error cargando lectura por fecha:', err);
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
  // Reproducir audio de la lectura
  const handlePlayAudio = async () => {
    if (!dailyReading) return;

    try {
      const modelExists = await audioService.checkModelExists();
      
      const startSpeaking = async () => {
        await audioService.speak(dailyReading.readingText, dailyReading.biblicalReference);
      };

      if (!modelExists) {
        Alert.alert(
          'Premium AI Narrator',
          'To listen to the reading with a natural voice, you need to download the AI engine (50MB).',
          [
            {
              text: 'Download Now',
              onPress: () => {
                // Iniciar descarga y el overlay mostrará el progreso
                audioService.downloadModel();
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
      } else {
        await startSpeaking();
      }
    } catch (error) {
      console.error('[DailyReading] Error al reproducir audio:', error);
      Alert.alert('Error', 'Could not start audio reading.');
    }
  };

  // =====================================================
  // ✅ CONECTADO - Compartir lectura del día
  // =====================================================
  const handleShare = async () => {
    if (!dailyReading) return;

    try {
      const result = await shareService.shareDailyReading({
        date: dailyReading.date,
        reference: dailyReading.biblicalReference,
        text: dailyReading.readingText,
        reflection: reflection.trim() || undefined,
      });

      if (result.action === 'error') {
        Alert.alert('Error', 'Could not share. Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Could not share. Please try again.');
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
        Alert.alert('✅ Reading unmarked', 'It has been removed from the record.');
      } else {
        // Marcar como completada
        await readingProgressService.markAsComplete(
          dateToMark,
          dailyReading.id !== 'fallback' ? dailyReading.id : undefined
        );
        setIsReadingCompleted(true);
        Alert.alert('✅ Reading completed', 'It has been registered in your writing calendar.');
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
      Alert.alert(`⚠️ ${t('share.emptyField')}`, t('share.writeReflection'));
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
        Alert.alert('✅ Reflection Updated', 'Your reflection has been updated successfully.');
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

        Alert.alert('✅ Reflection Saved', 'Your reflection has been saved to your writings.');
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
      const message = err.message || t('share.errorSaving');
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
        <Text style={styles.loadingText}>Loading today's reading...</Text>
      </View>
    );
  }

  // Estado de error
  if (error || !dailyReading) {
    const isOfflineError = !isOnline || error?.includes('Restore connection');
    return (
      <View style={[styles.container, styles.centerContent]}>
        <OfflineBanner />
        <MaterialIcons 
          name={isOfflineError ? "cloud-off" : "error-outline"} 
          size={48} 
          color={isOfflineError ? colors.charcoal.muted : colors.burgundy.DEFAULT} 
        />
        <Text style={[
          styles.errorText, 
          isOfflineError && {color: colors.charcoal.muted}
        ]}>
          {isOfflineError 
            ? 'Restore connection to read today\'s reading.' 
            : (error || 'Unknown error')}
        </Text>
        {isOnline && (
          <TouchableOpacity style={styles.retryButton} onPress={loadTodayReading}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  return (
    <View style={styles.container}>
      {/* Banner de Red - Prominente si está offline */}
      <OfflineBanner />

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
          <Text style={styles.headerSubtitle}>TODAY'S READING</Text>
          <Text style={styles.headerTitle}>{formatDate(dailyReading.date)}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => setShowTextSettings(true)}
            activeOpacity={0.7}
            style={styles.headerButton}>
            <MaterialIcons name="text-fields" size={22} color={colors.charcoal.muted} />
          </TouchableOpacity>
          {isOnline && !targetDate && (
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={(event) => {
            const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
            // Solo ocultar cuando ya estamos al final o viendo casi toda la card
            const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 80;
            setShowFab(!isAtBottom);
          }}>

        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLcwLMBOBEu02HwpQ_FxcSgNX8lkdl2CMw0GNmehfCUWKQgEz-FLZLvWKvFrFhd5LtE9XtmyIgwNV-U1GI8YLA1QUFSG6vGibTBaaWWIRGMXQYBqV5c-1W6C1H3HxqdSo29JCCloTzHLPSbsLR2S0l-ZR6roDjT77Et5Pog9uK-IdmTewGGxEtzvQTE6mvoUZCVspGNTbrshaItwXzKyfSGXMXe0tEZs4ylDADOmTtAx1DoWHuIZv6utdWfnNf35jowc_Mvf6Uj9NO',
            }}
            style={styles.heroImage}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
          <LinearGradient
            colors={['transparent', isDarkMode ? colors.background.dark : colors.ivory.DEFAULT]}
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
              <Text style={styles.actionButtonText}>Listen</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleShare}
              activeOpacity={0.7}>
              <MaterialIcons name="share" size={20} color={colors.ink.light} />
              <Text style={styles.actionButtonText}>Share</Text>
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
                  fontFamily: settings.fontFamily === 'sans' ? undefined : ('Lora_400Regular'),
                },
              ]}>
              <Text style={[
                styles.firstLetter,
                {
                    lineHeight: 34 * (settings.fontSize / 100),
                  fontSize: 35 * (settings.fontSize / 100),
                  fontFamily: settings.fontFamily === 'sans' ? undefined : ('Lora_400Regular'),
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
                <Text style={styles.reflectionTitle}>PERSONAL REFLECTION</Text>
              </View>
              <Text style={styles.reflectionPrivate}>PRIVATE</Text>
            </View>

            {/* Título de la reflexión */}
            <View style={styles.reflectionTitleInputContainer}>
              <TextInput
                ref={reflectionTitleRef}
                style={styles.reflectionTitleInput}
                placeholder="Reflection title..."
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
                placeholder="Write what the Lord inspires you today..."
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
                  {isAutoSaving ? 'Saving...' : 'Auto-saved'}
                </Text>
              </View>
            </View>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>

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

      <TrialWelcomeModal
        isVisible={showTrialModal}
        onClose={handleCloseTrialModal}
        onViewPlans={handleViewPlans}
      />
    </View>
  );
};

const getStyles = (colors: ThemeColors, isDarkMode: boolean, safeTop: number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? colors.background.dark : colors.cream,
  },

  // Header Sticky
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? Math.max(safeTop, 45) + 20 : Math.max(safeTop, 20) + 16, // Dinámico para Dynamic Island o Notch
    backgroundColor: isDarkMode ? colors.background.dark : colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: colors.ivory.border,
  },
  headerLeft: {
    width: 80,
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
    color: isDarkMode ? colors.primary.DEFAULT : colors.burgundy.accent,
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
    backgroundColor: isDarkMode ? `${colors.burgundy.DEFAULT}E6` : `${colors.burgundy.accent}E6`, 
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
    backgroundColor: isDarkMode ? colors.paper : '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.ivory.border,
    borderLeftWidth: 4,
    borderLeftColor: isDarkMode ? colors.primary.DEFAULT : `${colors.gold.accent}80`,
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
    backgroundColor: isDarkMode ? colors.surface.highlight : `${colors.paper}30`,
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
    backgroundColor: isDarkMode ? colors.surface.highlight : `${colors.paper}50`,
  },
  autoSaveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  autoSaveText: {
    fontSize: 10,
    color: colors.charcoal.muted,
    fontWeight: '500',
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
    color: isDarkMode ? colors.charcoal.dark : '#FFFFFF',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 26,
    right: 20,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDarkMode ? colors.background.dark : colors.cream,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.charcoal.muted,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: isDarkMode ? colors.primary.DEFAULT : colors.burgundy.DEFAULT,
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
    color: isDarkMode ? colors.charcoal.dark : '#FFFFFF',
    fontWeight: '600',
  },
});

export default DailyReadingScreen;

