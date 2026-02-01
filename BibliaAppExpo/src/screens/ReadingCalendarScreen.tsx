/**
 * ==========================================
 * CALENDARIO DE CONSTANCIA VISUAL
 * ==========================================
 * Diseño basado exactamente en el HTML de referencia
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
import {colors} from '../theme/colors';
import {readingProgressService, CalendarMonth} from '../services/reading-progress.service';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CALENDAR_PADDING = 24; // Más padding para calendario más pequeño
const GAP = 4;
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
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [monthData, setMonthData] = useState<CalendarMonth | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMonthData();
  }, [currentYear, currentMonth]);

  const loadMonthData = async () => {
    try {
      setIsLoading(true);
      const data = await readingProgressService.getMonthProgress(currentYear, currentMonth);
      setMonthData(data);
    } catch (error) {
      console.error('Error cargando calendario:', error);
      Alert.alert('Error', 'No se pudo cargar el calendario');
    } finally {
      setIsLoading(false);
    }
  };

  const goToPreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getDaysInMonth = () => {
    const date = new Date(currentYear, currentMonth - 1, 1);
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const firstDayOfWeek = date.getDay(); // 0-6 (Dom-Sáb)

    const days: Array<{ day: number; isCurrentMonth: boolean; date: string }> = [];

    // Días del mes anterior (para completar primera semana)
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

    // Días del siguiente mes (para completar última semana)
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
          <Text style={styles.headerTitle}>Calendario de Lecturas Diarias</Text>
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
          <View style={styles.calendarContainer}>
            {/* Day names - Igual que el HTML */}
            <View style={styles.calendarGrid}>
              {DAY_NAMES_SHORT.map((name) => (
                <View key={name} style={styles.dayNameCell}>
                  <Text style={styles.dayNameText}>{name}</Text>
                </View>
              ))}
            </View>

            {/* Days grid - Igual que el HTML */}
            <View style={styles.calendarGrid}>
              {days.map((item, index) => {
                const completed = isDateCompleted(item.date);
                return (
                  <View
                    key={index}
                    style={[
                      styles.dayCell,
                      !item.isCurrentMonth && styles.dayCellInactive,
                    ]}>
                    {completed && <View style={styles.dayCompletedCircle} />}
                    <Text
                      style={[
                        styles.dayNumber,
                        !item.isCurrentMonth && styles.dayNumberInactive,
                        completed && styles.dayNumberCompleted,
                      ]}>
                      {item.day}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>LECTURA COMPLETADA</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream, // Fondo sepia/cream de la app
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: colors.cream,
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

  // Month Header - Igual que HTML
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  monthTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.ink.DEFAULT,
    fontFamily: 'serif',
  },
  monthNavigation: {
    flexDirection: 'row',
    gap: 16,
  },
  navButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    backgroundColor: `${colors.paper}80`, // 50% opacity como en HTML
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },

  // Calendar Container - CENTRADO
  calendarContainer: {
    paddingHorizontal: CALENDAR_PADDING,
    paddingBottom: 32,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    // ❌ REMOVIDO: justifyContent: 'center', // Esto hacía que estuviera centrado
  },

  // Day Names
  dayNameCell: {
    width: CELL_SIZE,
    height: CELL_SIZE * 0.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNameText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.ink.light,
    textTransform: 'uppercase',
    opacity: 0.5,
  },

  // Day Cells - MUCHO MÁS GRANDES
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayCellInactive: {
    opacity: 0.3,
  },
  dayCompletedCircle: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    backgroundColor: 'rgba(107, 144, 128, 0.25)', // ✅ Verde fuerte #6B9080 con 25% opacidad
    borderRadius: 9999,
    zIndex: 0,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.ink.DEFAULT, // ✅ Negro exacto del resto de la app (#374151)
    zIndex: 1,
  },
  dayNumberInactive: {
    color: colors.ink.light,
    opacity: 0.3,
  },
  dayNumberCompleted: {
    fontWeight: '700',
    color: colors.primary.DEFAULT, // ✅ Verde fuerte #6B9080 solo cuando está completado
  },

  // Legend - ALINEADA EXACTAMENTE CON EL BORDE IZQUIERDO DEL CALENDARIO
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 35, // Exacto mismo margen que calendarContainer
    marginTop: 32,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 9999,
    backgroundColor: 'rgba(107, 144, 128, 0.25)', // ✅ Verde fuerte con 25% opacidad
    borderWidth: 1.5,
    borderColor: colors.primary.DEFAULT,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.ink.light,
    textTransform: 'uppercase',
  },
});

export default ReadingCalendarScreen;
