/**
 * ==========================================
 * ACTIVIDAD ESPIRITUAL - CALENDARIO
 * ==========================================
 * Muestra calendario mensual con lecturas completadas,
 * tarjeta del día seleccionado y reflexión personal editable
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {ThemeColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';
import {readingProgressService, CalendarMonth} from '../services/reading-progress.service';
import {dailyReadingService} from '../services/daily-reading.service';
import {writingsService} from '../services/writings.service';
import {useIsOnline} from '../contexts/NetworkContext';
import type {DailyReading} from '../services/daily-reading.service';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CALENDAR_PADDING = 24;
const GAP = 8;
const CELL_SIZE = (SCREEN_WIDTH - (CALENDAR_PADDING * 2) - (GAP * 6)) / 7;

type ReadingCalendarScreenProps = {
  navigation: any;
};

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_NAMES_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const ReadingCalendarScreen: React.FC<ReadingCalendarScreenProps> = ({navigation}) => {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => getStyles(colors, isDarkMode, insets.top), [colors, isDarkMode, insets.top]);

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [monthData, setMonthData] = useState<CalendarMonth | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estado para día seleccionado y su lectura
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedReading, setSelectedReading] = useState<DailyReading | null>(null);
  const [hasReflection, setHasReflection] = useState(false);
  const [reflectionWriting, setReflectionWriting] = useState<any | null>(null);
  const [readingLoadError, setReadingLoadError] = useState(false); // Error al cargar lectura

  // Estado de conexión
  const isOnline = useIsOnline();

  useEffect(() => {
    loadMonthData();
  }, [currentYear, currentMonth]);

  // ✅ Recargar cuando vuelve a la pantalla (por si guardó reflexión)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      await reloadAndSelectToday();
    });
    return unsubscribe;
  }, [navigation, currentYear, currentMonth]);

  // Función para recargar datos y seleccionar HOY si corresponde
  const reloadAndSelectToday = async () => {
    try {
      const data = await readingProgressService.getMonthProgress(currentYear, currentMonth);
      setMonthData(data);

      // Auto-seleccionar HOY si está completado
      const today = new Date();
      const todayStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      if (today.getFullYear() === currentYear && today.getMonth() + 1 === currentMonth) {
        if (data.completedDates.includes(todayStr)) {
          setSelectedDate(todayStr);
          await loadReadingForDate(todayStr);
        }
      }
    } catch (error) {
      console.error('Error recargando datos:', error);
    }
  };

  // Función auxiliar para cargar lectura de una fecha
  const loadReadingForDate = async (date: string) => {
    setReadingLoadError(false);
    try {
      const reading = await dailyReadingService.getReadingByDate(date);
      setSelectedReading(reading);

      // Verificar reflexión
      try {
        const writings = await writingsService.getWritings({ bookId: reading.bookId });
        const reflection = writings.writings.find(w =>
          w.bookId === reading.bookId &&
          w.chapter === reading.chapterNumber &&
          w.verse === reading.verseNumbers[0] &&
          w.tags.includes('lectura-diaria')
        );
        setHasReflection(!!reflection);
        setReflectionWriting(reflection || null);
      } catch {
        setHasReflection(false);
        setReflectionWriting(null);
      }
    } catch (error) {
      console.error('Error cargando lectura:', error);
      setSelectedReading(null);
      setReadingLoadError(true); // Marcar que hubo error (probablemente offline)
    }
  };

  useEffect(() => {
    // Auto-seleccionar el día HOY si está completado (al cargar por primera vez)
    const today = new Date();
    if (monthData && today.getFullYear() === currentYear && today.getMonth() + 1 === currentMonth) {
      const todayStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      if (monthData.completedDates.includes(todayStr) && !selectedDate) {
        setSelectedDate(todayStr);
        loadReadingForDate(todayStr);
      }
    }
  }, [monthData]);

  const loadMonthData = async () => {
    try {
      setIsLoading(true);
      const data = await readingProgressService.getMonthProgress(currentYear, currentMonth);
      setMonthData(data);
    } catch (error) {
      console.error('Error cargando calendario:', error);
      // No mostrar Alert - el servicio ya devuelve datos del caché si hay
      // Si no hay datos, simplemente mostrar calendario vacío
      setMonthData({
        year: currentYear,
        month: currentMonth,
        completedDates: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDayPress = async (date: string) => {
    // Verificar si se puede seleccionar (completado o últimos 7 días)
    if (!canSelectDate(date)) {
      return;
    }

    setSelectedDate(date);
    await loadReadingForDate(date);
  };

  const goToPreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
    setSelectedReading(null);
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
    setSelectedReading(null);
  };

  const getDaysInMonth = () => {
    const date = new Date(currentYear, currentMonth - 1, 1);
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const firstDayOfWeek = date.getDay(); // 0-6 (Dom-Sáb)

    const days: Array<{ day: number; isCurrentMonth: boolean; date: string }> = [];

    // Días del mes anterior
    const prevMonthDays = new Date(currentYear, currentMonth - 1, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      days.push({
        day,
        isCurrentMonth: false,
        date: `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      });
    }

    // Días del siguiente mes
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let day = 1; day <= remainingDays; day++) {
        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
        days.push({
          day,
          isCurrentMonth: false,
          date: `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        });
      }
    }

    return days;
  };

  const isDateCompleted = (date: string) => {
    return monthData?.completedDates.includes(date) || false;
  };

  const isToday = (date: string) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return date === todayStr;
  };

  // Verifica si un día se puede seleccionar
  const canSelectDate = (date: string) => {
    // Si está completado, siempre se puede seleccionar
    if (isDateCompleted(date)) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    // No permitir fechas futuras
    if (dateObj > today) return false;

    const dateYear = dateObj.getFullYear();
    const dateMonth = dateObj.getMonth() + 1;
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1;

    // Si estamos viendo el mes ACTUAL
    if (currentYear === todayYear && currentMonth === todayMonth) {
      // Permitir todos los días pasados del mes actual + últimos 7 días del mes anterior
      const diffTime = today.getTime() - dateObj.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // Días del mes actual (todos los pasados)
      if (dateYear === todayYear && dateMonth === todayMonth) {
        return true; // Todos los días pasados del mes actual
      }

      // Últimos 7 días del mes anterior
      if (diffDays <= 7) {
        return true;
      }

      return false;
    }

    // Si estamos viendo un mes PASADO
    if (currentYear < todayYear || (currentYear === todayYear && currentMonth < todayMonth)) {
      // Obtener el último día del mes que estamos viendo
      const lastDayOfViewedMonth = new Date(currentYear, currentMonth, 0).getDate();
      const dateDay = dateObj.getDate();

      // Solo permitir los últimos 7 días de ese mes pasado
      if (dateYear === currentYear && dateMonth === currentMonth) {
        return dateDay > lastDayOfViewedMonth - 7;
      }

      return false;
    }

    // Si estamos viendo un mes FUTURO, no permitir nada
    return false;
  };

  const formatDate = (date: string) => {
    const [, month, day] = date.split('-').map(Number);
    return `${day} de ${MONTH_NAMES[month - 1]}`;
  };

  const days = getDaysInMonth();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color={colors.ink.light} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Actividad Espiritual</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Month Header */}
        <View style={styles.monthHeader}>
          <Text style={styles.monthTitle}>
            {MONTH_NAMES[currentMonth - 1]} {currentYear}
          </Text>
          <View style={styles.monthNavigation}>
            <TouchableOpacity
              onPress={goToPreviousMonth}
              style={styles.navButton}
              activeOpacity={0.7}>
              <MaterialIcons name="chevron-left" size={24} color={colors.ink.light} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={goToNextMonth}
              style={styles.navButton}
              activeOpacity={0.7}>
              <MaterialIcons name="chevron-right" size={24} color={colors.ink.light} />
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
          </View>
        ) : (
          <>
            {/* Calendar */}
            <View style={styles.calendarContainer}>
              {/* Day names */}
              <View style={styles.calendarGrid}>
                {DAY_NAMES_SHORT.map((name) => (
                  <View key={name} style={styles.dayNameCell}>
                    <Text style={styles.dayNameText}>{name}</Text>
                  </View>
                ))}
              </View>

              {/* Days grid */}
              <View style={styles.calendarGrid}>
                {days.map((item, index) => {
                  const completed = isDateCompleted(item.date);
                  const selected = selectedDate === item.date;
                  const today = isToday(item.date);
                  const canSelect = canSelectDate(item.date); // Nuevo: puede seleccionar si es de los últimos 7 días

                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => canSelect && handleDayPress(item.date)}
                      disabled={!canSelect}
                      activeOpacity={0.7}
                      style={[
                        styles.dayCell,
                        !item.isCurrentMonth && styles.dayCellInactive,
                        (selected || (today && !selectedDate)) && styles.dayCellSelected,
                      ]}>
                      {completed && !selected && !(today && !selectedDate) && <View style={styles.dayCompletedBg} />}
                      <Text
                        style={[
                          styles.dayNumber,
                          !item.isCurrentMonth && styles.dayNumberInactive,
                          completed && !selected && !(today && !selectedDate) && styles.dayNumberCompleted,
                          (selected || (today && !selectedDate)) && styles.dayNumberSelected,
                        ]}>
                        {item.day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Mensaje de error offline */}
            {selectedDate && readingLoadError && !selectedReading && (
              <View style={styles.offlineCard}>
                <View style={styles.offlineIconContainer}>
                  <MaterialIcons name="cloud-off" size={32} color={colors.charcoal.muted} />
                </View>
                <Text style={styles.offlineTitle}>Lectura no disponible</Text>
                <Text style={styles.offlineMessage}>
                  {isOnline
                    ? 'No se pudo cargar la lectura de este día.'
                    : 'Sin conexión a internet. Esta lectura no está guardada en tu dispositivo.'
                  }
                </Text>
                {!isOnline && (
                  <Text style={styles.offlineHint}>
                    Conéctate a internet para ver el contenido de este día.
                  </Text>
                )}
              </View>
            )}

            {/* Reading Card - Solo mostrar si hay día seleccionado */}
            {selectedDate && selectedReading && (
              <View style={styles.readingCard}>
                <View style={styles.readingCardHeader}>
                  <View style={styles.readingCardStatus}>
                    <MaterialIcons
                      name={isDateCompleted(selectedDate) ? "bookmark" : "bookmark-outline"}
                      size={20}
                      color={isDateCompleted(selectedDate) ? colors.gold.DEFAULT : colors.charcoal.muted}
                    />
                    <Text style={[
                      styles.readingCardStatusText,
                      !isDateCompleted(selectedDate) && styles.readingCardStatusPending
                    ]}>
                      {isDateCompleted(selectedDate) ? 'COMPLETADO' : 'PENDIENTE'}
                    </Text>
                  </View>
                  <Text style={styles.readingCardDate}>{formatDate(selectedDate)}</Text>
                </View>

                <Text style={styles.readingCardTitle}>{selectedReading.biblicalReference}</Text>

                <Text style={styles.readingCardExcerpt} numberOfLines={2}>
                  "{selectedReading.readingText.substring(0, 150)}..."
                </Text>

                <View style={styles.readingCardDivider} />

                <View style={styles.readingCardFooter}>
                  {isDateCompleted(selectedDate) ? (
                    // Día completado: mostrar estado de reflexión
                    <>
                      <View style={styles.readingCardReflection}>
                        <MaterialIcons name="edit-note" size={18} color={colors.primary.DEFAULT} />
                        <Text style={styles.readingCardReflectionText}>
                          {hasReflection ? 'Contiene reflexión' : 'Sin reflexión'}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          if (hasReflection && reflectionWriting) {
                            navigation.navigate('WritingDetail', {
                              writingId: reflectionWriting.id,
                              title: reflectionWriting.title,
                              content: reflectionWriting.content,
                              bookId: reflectionWriting.bookId,
                              bookName: reflectionWriting.bookName,
                              chapter: reflectionWriting.chapter,
                              verse: reflectionWriting.verse,
                              tags: reflectionWriting.tags,
                              createdAt: reflectionWriting.createdAt,
                              isFavorite: reflectionWriting.isFavorite,
                            });
                          } else {
                            navigation.navigate('EditWriting', {
                              writingId: 'new',
                              initialTitle: '',
                              initialContent: '',
                              bookId: selectedReading.bookId,
                              bookName: selectedReading.bookName,
                              chapter: selectedReading.chapterNumber,
                              verse: selectedReading.verseNumbers[0],
                              verseText: selectedReading.readingText.substring(0, 200),
                              createdAt: new Date().toISOString(),
                            });
                          }
                        }}
                        style={styles.readingCardButton}>
                        <Text style={styles.readingCardButtonText}>
                          {hasReflection ? 'VER REFLEXIÓN' : 'ESCRIBIR'}
                        </Text>
                        <MaterialIcons name="arrow-forward" size={14} color={colors.burgundy.DEFAULT} />
                      </TouchableOpacity>
                    </>
                  ) : (
                    // Día pendiente: mostrar botón para completar
                    <>
                      <View style={styles.readingCardReflection}>
                        <MaterialIcons name="schedule" size={18} color={colors.charcoal.muted} />
                        <Text style={styles.readingCardReflectionText}>
                          Lectura pendiente
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => navigation.navigate('DailyReading', { date: selectedDate })}
                        style={[styles.readingCardButton, styles.readingCardButtonPrimary]}>
                        <Text style={styles.readingCardButtonTextPrimary}>LEER</Text>
                        <MaterialIcons name="arrow-forward" size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const getStyles = (colors: ThemeColors, isDarkMode: boolean, safeTop: number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? colors.background.dark : colors.cream,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Math.max(safeTop, 20) + 16,
    paddingBottom: 12,
    backgroundColor: isDarkMode ? colors.background.dark : colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: colors.ivory.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.charcoal.dark,
    fontFamily: 'serif',
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Month Header
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: isDarkMode ? colors.primary.DEFAULT : colors.burgundy.DEFAULT,
    fontFamily: 'serif',
  },
  monthNavigation: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },

  // Calendar Container
  calendarContainer: {
    paddingHorizontal: CALENDAR_PADDING,
    marginBottom: 32,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },

  // Day Names
  dayNameCell: {
    width: CELL_SIZE,
    height: CELL_SIZE * 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNameText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.ink.light,
    textTransform: 'uppercase',
    opacity: 0.6,
  },

  // Day Cells
  dayCell: {
    width: CELL_SIZE,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayCellInactive: {
    opacity: 0.3,
  },
  dayCellSelected: {
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 9999,
  },
  dayCompletedBg: {
    position: 'absolute',
    inset: 4,
    backgroundColor: isDarkMode ? `${colors.primary.DEFAULT}33` : `${colors.gold.DEFAULT}26`,
    borderRadius: 9999,
    zIndex: 0,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.ink.DEFAULT,
    zIndex: 1,
  },
  dayNumberInactive: {
    color: colors.ink.light,
  },
  dayNumberCompleted: {
    fontWeight: '600',
  },
  dayNumberSelected: {
    color: isDarkMode ? colors.charcoal.dark : '#FFFFFF',
    fontWeight: '700',
  },

  // Reading Card
  readingCard: {
    backgroundColor: isDarkMode ? colors.paper : '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 24,
    marginBottom: 32,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.ivory.border,
  },
  readingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  readingCardStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  readingCardStatusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.ink.light,
    textTransform: 'uppercase',
  },
  readingCardStatusPending: {
    color: colors.charcoal.muted,
  },
  readingCardDate: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.ink.light,
  },
  readingCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.charcoal.dark,
    fontFamily: 'serif',
    marginBottom: 8,
  },
  readingCardExcerpt: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.ink.light,
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: 'serif',
  },
  readingCardDivider: {
    height: 1,
    backgroundColor: isDarkMode ? `${colors.charcoal.muted}30` : `${colors.charcoal.muted}20`,
    marginBottom: 16,
  },
  readingCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readingCardReflection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  readingCardReflectionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary.DEFAULT,
  },
  readingCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readingCardButtonText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: isDarkMode ? colors.primary.DEFAULT : colors.burgundy.DEFAULT,
    textTransform: 'uppercase',
  },
  readingCardButtonPrimary: {
    backgroundColor: colors.primary.DEFAULT,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  readingCardButtonTextPrimary: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: isDarkMode ? colors.charcoal.dark : '#FFFFFF',
    textTransform: 'uppercase',
  },
  // Estilos para tarjeta offline (mismo tamaño que readingCard)
  offlineCard: {
    backgroundColor: isDarkMode ? colors.paper : '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 24,
    marginBottom: 32,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: isDarkMode ? colors.ivory.border : '#E2E8F0',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  offlineIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: isDarkMode ? `${colors.charcoal.muted}20` : '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  offlineTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.charcoal.DEFAULT,
    marginBottom: 6,
  },
  offlineMessage: {
    fontSize: 13,
    color: colors.charcoal.muted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  offlineHint: {
    fontSize: 12,
    color: colors.gold.DEFAULT,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default ReadingCalendarScreen;
