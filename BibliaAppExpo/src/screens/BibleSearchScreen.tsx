import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {colors} from '../theme/colors';
import {BibleSearchScreenProps} from '../navigation/AppNavigator';
import {bibleService, SearchResult} from '../services/bible.service';
import {useOfflineBible} from '../hooks/useOfflineBible';
import {useIsOnline} from '../contexts/NetworkContext';

type RecentSearch = {
  id: string;
  text: string;
  category: string;
  iconColor: string;
};

const BibleSearchScreen: React.FC<BibleSearchScreenProps> = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // ✅ Hook para modo offline
  const {isBibleDownloaded, needsDownload} = useOfflineBible();
  const isOnline = useIsOnline();

  // Mostrar alerta si está offline y no tiene Biblia descargada
  useEffect(() => {
    if (needsDownload) {
      Alert.alert(
        'Sin conexión',
        'No tienes conexión a internet. ¿Deseas descargar la Biblia para usarla sin conexión?',
        [
          {text: 'Más tarde', style: 'cancel'},
          {
            text: 'Descargar',
            onPress: () => navigation.navigate('ManageDownloads'),
          },
        ]
      );
    }
  }, [needsDownload]);

  // =====================================================
  // 🔴 MOCKEADO - Búsquedas recientes
  // TODO: Reemplazar con datos del usuario desde API
  // GET /api/user/recent-searches
  // =====================================================
  const recentSearches: RecentSearch[] = [
    {
      id: '1',
      text: 'Juan 3:16',
      category: 'Nuevo Testamento',
      iconColor: colors.primary.DEFAULT,
    },
    {
      id: '2',
      text: 'Salmo 23',
      category: 'Salmos',
      iconColor: colors.primary.DEFAULT,
    },
    {
      id: '3',
      text: '"Amor y paciencia"',
      category: 'Búsqueda de texto',
      iconColor: colors.burgundy.accent,
    },
  ];

  // =====================================================
  // ✅ NAVEGACIÓN IMPLEMENTADA - Perfil de usuario
  // Navega a la pantalla de perfil del usuario
  // =====================================================
  const handleProfile = () => {
    navigation.navigate('Profile');
  };

  // =====================================================
  // ✅ CONECTADO A API / OFFLINE - Búsqueda de versículos
  // =====================================================
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    // Si está offline y no tiene Biblia descargada, mostrar error
    if (needsDownload) {
      Alert.alert(
        'Sin conexión',
        'Necesitas conexión a internet o descargar la Biblia para realizar búsquedas.',
        [
          {text: 'Cancelar', style: 'cancel'},
          {text: 'Descargar Biblia', onPress: () => navigation.navigate('ManageDownloads')},
        ]
      );
      return;
    }

    try {
      setIsSearching(true);
      setHasSearched(true);

      if (isOnline) {
        // ✅ CON CONEXIÓN: Buscar en API
        const response = await bibleService.searchVerses(searchQuery.trim(), { pageSize: 20 });
        setSearchResults(response.results);
      } else if (isBibleDownloaded) {
        // ✅ SIN CONEXIÓN + BIBLIA DESCARGADA: Buscar offline
        const {BibleOfflineService} = await import('../services/english-bible-download.service');
        const offlineResults = await BibleOfflineService.searchVerses(searchQuery.trim(), 20);

        // Convertir al formato de SearchResult
        const formattedResults: SearchResult[] = offlineResults.map(r => ({
          bookId: r.bookId,
          bookName: r.bookName,
          chapter: r.chapter,
          verse: r.verse,
          text: r.text,
          highlightedText: r.text,
        }));
        setSearchResults(formattedResults);
      }
    } catch (err: any) {
      console.error('Error en búsqueda:', err);
      Alert.alert('Error', 'No se pudo realizar la búsqueda. Verifica tu conexión.');
    } finally {
      setIsSearching(false);
    }
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
  };

  // Navegar a un resultado de búsqueda
  const handleSearchResultPress = (result: SearchResult) => {
    navigation.navigate('ChapterReading', {
      bookId: result.bookId,
      bookName: result.bookName,
      chapter: result.chapter,
    });
  };

  // =====================================================
  // 🔴 MOCKEADO - Búsqueda por voz
  // TODO: Implementar reconocimiento de voz
  // =====================================================
  const handleVoiceSearch = () => {
    Alert.alert(
      '🎤 Búsqueda por voz',
      'Funcionalidad mockeada para demo.\n\nEn producción, aquí podrás buscar versículos usando tu voz.',
      [{text: 'Entendido'}]
    );
  };

  // =====================================================
  // ✅ NAVEGACIÓN IMPLEMENTADA - Continuar lectura
  // Navega a la pantalla de lectura diaria
  // =====================================================
  const handleContinueReading = () => {
    navigation.navigate('DailyReading', {});
  };

  // =====================================================
  // ✅ NAVEGACIÓN IMPLEMENTADA - Antiguo Testamento
  // Navega a la pantalla de libros del Antiguo Testamento
  // =====================================================
  const handleOldTestament = () => {
    navigation.navigate('OldTestament');
  };

  // =====================================================
  // ✅ NAVEGACIÓN IMPLEMENTADA - Nuevo Testamento
  // Navega a la pantalla de libros del Nuevo Testamento
  // =====================================================
  const handleNewTestament = () => {
    navigation.navigate('NewTestament');
  };

  // =====================================================
  // 🔴 MOCKEADO - Búsqueda reciente seleccionada
  // TODO: Navegar a resultado específico
  // =====================================================
  const handleRecentSearch = (search: RecentSearch) => {
    Alert.alert(
      '🔍 Búsqueda reciente',
      `Funcionalidad mockeada para demo.\n\nSeleccionaste: ${search.text}\nCategoría: ${search.category}\n\nEn producción, aquí verás directamente el versículo o resultados.`,
      [{text: 'Entendido'}]
    );
  };

  // =====================================================
  // 🔴 MOCKEADO - Borrar búsquedas recientes
  // TODO: Implementar borrado de historial
  // DELETE /api/user/recent-searches
  // =====================================================
  const handleClearSearches = () => {
    Alert.alert(
      '🗑️ Borrar búsquedas',
      'Funcionalidad en desarrollo.\n\n¿Deseas borrar todas las búsquedas recientes?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {text: 'Borrar', style: 'destructive'},
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header - Fixed */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Buscador</Text>
        <TouchableOpacity
          onPress={handleProfile}
          style={styles.profileButton}
          activeOpacity={0.7}>
          <MaterialIcons name="account-circle" size={28} color={colors.charcoal.dark} />
        </TouchableOpacity>
      </View>

      {/* Search Bar - Fixed */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <MaterialIcons
            name="search"
            size={24}
            color={colors.charcoal.muted}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar versículo, palabra clave..."
            placeholderTextColor={`${colors.charcoal.muted}80`}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 ? (
            <>
              <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
                <MaterialIcons name="search" size={24} color={colors.primary.DEFAULT} />
              </TouchableOpacity>
              <TouchableOpacity onPress={clearSearch} style={styles.clearSearchButton}>
                <MaterialIcons name="close" size={20} color={colors.charcoal.muted} />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={handleVoiceSearch}
              style={styles.micButton}
              activeOpacity={0.7}>
              <MaterialIcons name="mic" size={26} color={colors.primary.DEFAULT} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Resultados de búsqueda */}
      {isSearching && (
        <View style={styles.searchingContainer}>
          <ActivityIndicator size="large" color={colors.burgundy.DEFAULT} />
          <Text style={styles.searchingText}>Buscando...</Text>
        </View>
      )}

      {!isSearching && hasSearched && searchResults.length === 0 && (
        <View style={styles.noResultsContainer}>
          <MaterialIcons name="search-off" size={48} color={colors.charcoal.muted} />
          <Text style={styles.noResultsText}>No se encontraron resultados</Text>
          <Text style={styles.noResultsSubtext}>Intenta con otras palabras</Text>
        </View>
      )}

      {!isSearching && searchResults.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>
            {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}
          </Text>
          <ScrollView style={styles.resultsList}>
            {searchResults.map((result, index) => (
              <TouchableOpacity
                key={index}
                style={styles.resultCard}
                onPress={() => handleSearchResultPress(result)}
                activeOpacity={0.7}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultReference}>
                    {result.bookName} {result.chapter}:{result.verse}
                  </Text>
                </View>
                <Text style={styles.resultText} numberOfLines={3}>
                  {result.text}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Contenido normal cuando no hay búsqueda activa */}
      {!isSearching && !hasSearched && (
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Testament Cards */}
        <View style={styles.cardsContainer}>
          {/* Antiguo Testamento */}
          <TouchableOpacity
            style={styles.testamentCard}
            onPress={handleOldTestament}
            activeOpacity={0.9}>
            {isOnline ? (
              <ImageBackground
                source={{uri: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=800'}}
                style={styles.cardBackground}
                imageStyle={styles.cardBackgroundImage}>
                <LinearGradient
                  colors={['rgba(54, 69, 79, 0.85)', 'rgba(54, 69, 79, 0.55)', 'rgba(54, 69, 79, 0.15)']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.cardOverlay}>
                  <View style={styles.cardContent}>
                    <View style={styles.cardBadge}>
                      <View style={[styles.badgeDot, {backgroundColor: colors.gold.accent}]} />
                      <Text style={[styles.badgeText, {color: colors.gold.accent}]}>
                        46 LIBROS
                      </Text>
                    </View>
                    <Text style={styles.cardTitle}>Antiguo{'\n'}Testamento</Text>
                  </View>
                  <View style={styles.cardArrowContainer}>
                    <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
                  </View>
                </LinearGradient>
              </ImageBackground>
            ) : (
              <LinearGradient
                colors={['#36454F', '#4A5568', '#718096']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={[styles.cardBackground, styles.cardOverlay]}>
                <View style={styles.cardContent}>
                  <View style={styles.cardBadge}>
                    <View style={[styles.badgeDot, {backgroundColor: colors.gold.accent}]} />
                    <Text style={[styles.badgeText, {color: colors.gold.accent}]}>
                      46 LIBROS
                    </Text>
                  </View>
                  <Text style={styles.cardTitle}>Antiguo{'\n'}Testamento</Text>
                </View>
                <View style={styles.cardArrowContainer}>
                  <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
                </View>
              </LinearGradient>
            )}
          </TouchableOpacity>

          {/* Nuevo Testamento */}
          <TouchableOpacity
            style={styles.testamentCard}
            onPress={handleNewTestament}
            activeOpacity={0.9}>
            {isOnline ? (
              <ImageBackground
                source={{uri: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=800'}}
                style={styles.cardBackground}
                imageStyle={styles.cardBackgroundImage}>
                <LinearGradient
                  colors={['rgba(166, 94, 110, 0.80)', 'rgba(166, 94, 110, 0.50)', 'rgba(166, 94, 110, 0.12)']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.cardOverlay}>
                  <View style={styles.cardContent}>
                    <View style={styles.cardBadge}>
                      <View style={[styles.badgeDot, {backgroundColor: '#FFFFFF'}]} />
                      <Text style={[styles.badgeText, {color: 'rgba(255, 255, 255, 0.9)'}]}>
                        27 LIBROS
                      </Text>
                    </View>
                    <Text style={styles.cardTitle}>Nuevo{'\n'}Testamento</Text>
                  </View>
                  <View style={styles.cardArrowContainer}>
                    <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
                  </View>
                </LinearGradient>
              </ImageBackground>
            ) : (
              <LinearGradient
                colors={['#A65E6E', '#B87584', '#CA8C9A']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={[styles.cardBackground, styles.cardOverlay]}>
                <View style={styles.cardContent}>
                  <View style={styles.cardBadge}>
                    <View style={[styles.badgeDot, {backgroundColor: '#FFFFFF'}]} />
                    <Text style={[styles.badgeText, {color: 'rgba(255, 255, 255, 0.9)'}]}>
                      27 LIBROS
                    </Text>
                  </View>
                  <Text style={styles.cardTitle}>Nuevo{'\n'}Testamento</Text>
                </View>
                <View style={styles.cardArrowContainer}>
                  <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
                </View>
              </LinearGradient>
            )}
          </TouchableOpacity>

          {/* Continuar Lectura */}
          <TouchableOpacity
            style={styles.testamentCard}
            onPress={handleContinueReading}
            activeOpacity={0.9}>
            {isOnline ? (
              <ImageBackground
                source={{uri: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=800'}}
                style={styles.cardBackground}
                imageStyle={styles.cardBackgroundImage}>
                <LinearGradient
                  colors={['rgba(107, 154, 196, 0.85)', 'rgba(107, 154, 196, 0.55)', 'rgba(107, 154, 196, 0.15)']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.cardOverlay}>
                  <View style={styles.cardContent}>
                    <View style={styles.cardBadge}>
                      <MaterialIcons name="bookmark" size={16} color="rgba(255, 255, 255, 0.9)" />
                      <Text style={[styles.badgeText, {color: 'rgba(255, 255, 255, 0.9)'}]}>
                        SALMO 23
                      </Text>
                    </View>
                    <Text style={styles.cardTitle}>Continuar{'\n'}lectura</Text>
                  </View>
                  <View style={styles.cardArrowContainer}>
                    <MaterialIcons name="play-arrow" size={28} color="#FFFFFF" />
                  </View>
                </LinearGradient>
              </ImageBackground>
            ) : (
              <LinearGradient
                colors={['#6B9AC4', '#7FAFD4', '#93C4E4']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={[styles.cardBackground, styles.cardOverlay]}>
                <View style={styles.cardContent}>
                  <View style={styles.cardBadge}>
                    <MaterialIcons name="bookmark" size={16} color="rgba(255, 255, 255, 0.9)" />
                    <Text style={[styles.badgeText, {color: 'rgba(255, 255, 255, 0.9)'}]}>
                      SALMO 23
                    </Text>
                  </View>
                  <Text style={styles.cardTitle}>Continuar{'\n'}lectura</Text>
                </View>
                <View style={styles.cardArrowContainer}>
                  <MaterialIcons name="play-arrow" size={28} color="#FFFFFF" />
                </View>
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>

        {/* Recent Searches */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Búsquedas recientes</Text>
            <TouchableOpacity
              onPress={handleClearSearches}
              activeOpacity={0.7}>
              <Text style={styles.clearButton}>Borrar</Text>
            </TouchableOpacity>
          </View>

          {recentSearches.map((search) => (
            <TouchableOpacity
              key={search.id}
              style={styles.recentItem}
              onPress={() => handleRecentSearch(search)}
              activeOpacity={0.7}>
              <View style={styles.recentItemContent}>
                <View style={[styles.recentIcon, {borderColor: `${search.iconColor}33`}]}>
                  <MaterialIcons name="history" size={20} color={search.iconColor} />
                </View>
                <View style={styles.recentTextContainer}>
                  <Text style={styles.recentText}>{search.text}</Text>
                  <Text style={styles.recentCategory}>{search.category}</Text>
                </View>
              </View>
              <MaterialIcons
                name="arrow-forward"
                size={20}
                color={colors.charcoal.muted}
                style={{transform: [{rotate: '-45deg'}]}}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },

  // Búsqueda
  clearSearchButton: {
    padding: 4,
    marginRight: 4,
  },
  searchButton: {
    padding: 4,
    marginRight: 8,
  },
  searchingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  searchingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.charcoal.muted,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: colors.charcoal.DEFAULT,
  },
  noResultsSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: colors.charcoal.muted,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.charcoal.muted,
    marginBottom: 12,
  },
  resultsList: {
    flex: 1,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.ivory.border,
  },
  resultHeader: {
    marginBottom: 8,
  },
  resultReference: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.burgundy.DEFAULT,
  },
  resultText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.charcoal.DEFAULT,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: colors.ivory.border,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.charcoal.dark,
  },
  profileButton: {
    padding: 4,
    borderRadius: 20,
  },

  // Search
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.cream,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.ivory.border,
    paddingLeft: 16,
    paddingRight: 10,
    paddingVertical: 10,
    height: 50,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.charcoal.DEFAULT,
  },
  micDivider: {
    width: 1,
    height: 26,
    backgroundColor: colors.ivory.border,
    marginHorizontal: 12,
  },
  micButton: {
    padding: 2,
  },

  // Testament Cards
  cardsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  testamentCard: {
    height: 176,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardBackground: {
    flex: 1,
  },
  cardBackgroundImage: {
    opacity: 0.9,
  },
  cardOverlay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  cardTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 36,
  },
  cardArrowContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Recent Searches
  recentSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.charcoal.dark,
  },
  clearButton: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.DEFAULT,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.ivory.border,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  recentItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  recentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.ivory.shade,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentTextContainer: {
    flex: 1,
  },
  recentText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.charcoal.dark,
    marginBottom: 2,
  },
  recentCategory: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.charcoal.muted,
  },

  bottomSpacer: {
    height: 20,
  },
});

export default BibleSearchScreen;

