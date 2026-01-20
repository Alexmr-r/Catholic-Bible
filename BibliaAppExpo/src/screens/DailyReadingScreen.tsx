import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {colors} from '../theme/colors';
import {DailyReadingScreenProps} from '../navigation/AppNavigator';
const DailyReadingScreen: React.FC<DailyReadingScreenProps> = ({navigation}) => {
  const [reflection, setReflection] = useState('');
  const [showFab, setShowFab] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  // =====================================================
  // 🔴 MOCKEADO - Datos de lectura del día
  // TODO: Cargar desde API
  // GET /api/daily-reading?date={selectedDate}
  // =====================================================
  // const [readingData, setReadingData] = useState({
  //   title: 'Según San Lucas 1:26-38',
  //   date: 'Martes, 24 de Octubre',
  //   imageUrl: 'https://...',
  //   badge: 'EVANGELIO',
  //   paragraphs: ['En aquel tiempo...', '...']
  // });

  // =====================================================
  // TODO: Implementar carga de lectura desde API
  // =====================================================
  // useEffect(() => {
  //   const loadDailyReading = async () => {
  //     setIsLoading(true);
  //     try {
  //       const response = await fetch(`/api/daily-reading?date=${new Date().toISOString()}`);
  //       const data = await response.json();
  //       setReadingData(data);
  //     } catch (error) {
  //       console.error('Error loading daily reading:', error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   loadDailyReading();
  // }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  // =====================================================
  // 🔴 MOCKEADO - Seleccionar fecha de lectura
  // TODO: Implementar selector de calendario
  // Abrir modal con calendario para seleccionar fecha
  // =====================================================
  const handleCalendar = () => {
    Alert.alert(
      '📅 Calendario',
      'Funcionalidad mockeada para demo.\n\nEn producción, aquí se abrirá un selector de calendario para elegir otra fecha de lectura.',
      [{text: 'Entendido'}]
    );
  };

  // =====================================================
  // 🔴 MOCKEADO - Reproducir audio de la lectura
  // TODO: Implementar reproductor de audio
  // POST /api/daily-reading/audio
  // =====================================================
  const handlePlayAudio = () => {
    Alert.alert(
      '🎧 Reproducir Audio',
      'Funcionalidad mockeada para demo.\n\nEn producción, aquí se reproducirá el audio de la lectura del día.',
      [{text: 'Entendido'}]
    );
  };

  // =====================================================
  // 🔴 MOCKEADO - Compartir lectura
  // TODO: Implementar compartir en redes sociales
  // Usar React Native Share API
  // =====================================================
  const handleShare = () => {
    Alert.alert(
      '🔗 Compartir',
      'Funcionalidad mockeada para demo.\n\nEn producción, aquí podrás compartir la lectura en redes sociales o por mensaje.',
      [{text: 'Entendido'}]
    );
  };

  // =====================================================
  // 🔴 MOCKEADO - Guardar lectura en favoritos
  // TODO: Implementar bookmark
  // POST /api/bookmarks { readingId, userId }
  // =====================================================
  const handleBookmark = () => {
    Alert.alert(
      '⭐ Favoritos',
      'Funcionalidad mockeada para demo.\n\nEn producción, aquí guardarás la lectura en tus favoritos para acceder más tarde.',
      [{text: 'Entendido'}]
    );
  };

  // =====================================================
  // 🔴 MOCKEADO - Guardar reflexión personal
  // TODO: Implementar guardar reflexión en BD
  // POST /api/reflections { readingId, userId, text }
  // =====================================================
  const handleSaveReflection = () => {
    if (!reflection.trim()) {
      Alert.alert('⚠️ Campo vacío', 'Escribe tu reflexión antes de guardar.');
      return;
    }
    Alert.alert(
      '✅ Reflexión Guardada',
      'Funcionalidad en desarrollo.\n\nPróximamente tus reflexiones se guardarán automáticamente.\n\nTexto: "' + reflection.substring(0, 50) + '..."',
      [{text: 'Entendido'}]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Sticky */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.7}
            style={styles.headerButton}>
          </TouchableOpacity>
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.headerSubtitle}>LITURGIA DE HOY</Text>
          <Text style={styles.headerTitle}>Martes, 24 de Octubre</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={handleCalendar}
            activeOpacity={0.7}
            style={styles.headerButton}>
            <MaterialIcons name="calendar-today" size={22} color={colors.ink.light} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ScrollView - ✅ Con scroll según RESPONSIVE_PATTERN.md */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
          const isNearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 400;
          setShowFab(!isNearBottom);
        }}
        scrollEventThrottle={16}>

        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLcwLMBOBEu02HwpQ_FxcSgNX8lkdl2CMw0GNmehfCUWKQgEz-FLZLvWKvFrFhd5LtE9XtmyIgwNV-U1GI8YLA1QUFSG6vGibTBaaWWIRGMXQYBqV5c-1W6C1H3HxqdSo29JCCloTzHLPSbsLR2S0l-ZR6roDjT77Et5Pog9uK-IdmTewGGxEtzvQTE6mvoUZCVspGNTbrshaItwXzKyfSGXMXe0tEZs4ylDADOmTtAx1DoWHuIZv6utdWfnNf35jowc_Mvf6Uj9NO',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          {/* Degradado inferior para suavizar el corte */}
          <LinearGradient
            colors={['rgba(250, 250, 245, 0)', 'rgba(250, 250, 245, 1)']}
            style={styles.heroGradient}
          />
          <View style={styles.heroContent}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>EVANGELIO</Text>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <Text style={styles.readingTitle}>Según San Lucas 1:26-38</Text>

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
              <MaterialIcons name="bookmark-border" size={22} color={colors.ink.light} />
            </TouchableOpacity>
          </View>

          {/* Reading Text */}
          <View style={styles.readingContent}>
            <Text style={styles.readingParagraph}>
              <Text style={styles.firstLetter}>E</Text>n aquel tiempo, el ángel Gabriel fue enviado por Dios a una ciudad de Galilea llamada Nazaret, a una virgen desposada con un hombre llamado José, de la casa de David; el nombre de la virgen era María.
            </Text>

            <Text style={styles.readingParagraph}>
              Y entrando el ángel en donde ella estaba, dijo: «¡Salve, muy favorecida! El Señor es contigo; bendita tú entre las mujeres».
            </Text>

            <Text style={styles.readingParagraph}>
              Mas ella, cuando le vio, se turbó por sus palabras, y pensaba qué salutación sería esta. Entonces el ángel le dijo: «María, no temas, porque has hallado gracia delante de Dios. Y ahora, concebirás en tu vientre, y darás a luz un hijo, y llamarás su nombre JESÚS».
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

            <TextInput
              style={styles.reflectionInput}
              placeholder="¿Qué te dice el Señor hoy? Escribe tu reflexión aquí..."
              placeholderTextColor={`${colors.charcoal.muted}60`}
              value={reflection}
              onChangeText={setReflection}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.reflectionFooter}>
              <View style={styles.autoSaveContainer}>
                <MaterialIcons name="cloud-done" size={14} color={colors.charcoal.muted} />
                <Text style={styles.autoSaveText}>Guardado automático</Text>
              </View>
            </View>
          </View>

          {/* Botón Guardar Reflexión - Ahora dentro del ScrollView */}
          <TouchableOpacity
            style={styles.saveReflectionButton}
            onPress={handleSaveReflection}
            activeOpacity={0.8}>
            <MaterialIcons name="save" size={20} color="#FFFFFF" />
            <Text style={styles.saveReflectionButtonText}>GUARDAR REFLEXIÓN</Text>
          </TouchableOpacity>

          {/* Spacer para el tab bar */}
          <View style={{height: 40}} />
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
    width: 40,
    alignItems: 'flex-end',
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
    paddingBottom: 20, // Espacio mínimo para tab bar
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
    backgroundColor: `${colors.burgundy.accent}E6`, // 90% opacity
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
  },
  readingParagraph: {
    fontSize: 18,
    lineHeight: 32,
    color: colors.charcoal.DEFAULT,
    marginBottom: 16,
  },
  firstLetter: {
    fontSize: 34,
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
  reflectionInput: {
    minHeight: 140,
    paddingHorizontal: 20,
    paddingVertical: 20,
    fontSize: 16,
    lineHeight: 24,
    color: colors.charcoal.DEFAULT,
    fontStyle: 'italic',
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
    marginTop: 24,
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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

});

export default DailyReadingScreen;

