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
import {readingHistoryService, ReadingHistoryItem} from '../services/reading-history.service';
import {smartSearchService, SmartSearchResult} from '../services/smart-search.service';
import {useFocusEffect} from '@react-navigation/native';

type RecentSearch = {
  id: string;
  text: string;
  category: string;
  iconColor: string;
};

const BibleSearchScreen: React.FC<BibleSearchScreenProps> = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [smartResults, setSmartResults] = useState<SmartSearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SmartSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastReading, setLastReading] = useState<ReadingHistoryItem | null>(null);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  // ✅ Hook para modo offline
  const {isBibleDownloaded, needsDownload} = useOfflineBible();
  const isOnline = useIsOnline();

  // Cargar última lectura y búsquedas recientes cuando la pantalla recibe foco
  useFocusEffect(
    React.useCallback(() => {
      loadLastReading();
      loadRecentSearches();
    }, [])
  );

  const loadLastReading = async () => {
    const reading = await readingHistoryService.getLastReading();
    console.log('[BibleSearch] Última lectura:', reading);
    setLastReading(reading);
  };

  const loadRecentSearches = async () => {
    const history = await readingHistoryService.getSearchHistory();
    // Convertir al formato RecentSearch (tomar solo las primeras 3)
    const formatted: RecentSearch[] = history.slice(0, 3).map((item, index) => ({
      id: index.toString(),
      text: item.query,
      category: item.resultCount ? `${item.resultCount} resultados` : 'Búsqueda',
      iconColor: colors.primary.DEFAULT,
    }));
    setRecentSearches(formatted);
  };

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
      setSuggestions([]); // Limpiar sugerencias

      // ✅ BÚSQUEDA INTELIGENTE
      const smartResultsData = await smartSearchService.search(searchQuery.trim());
      setSmartResults(smartResultsData);

      // Si hay resultados inteligentes (libros, capítulos, categorías), no buscar versículos
      const hasDirectResults = smartResultsData.some(r => r.type === 'book' || r.type === 'chapter' || r.type === 'category');

      if (!hasDirectResults) {
        // Buscar también en versículos
        if (isOnline) {
          const response = await bibleService.searchVerses(searchQuery.trim(), { pageSize: 20 });
          setSearchResults(response.results);
        } else if (isBibleDownloaded) {
          const {BibleOfflineService} = await import('../services/english-bible-download.service');
          const offlineResults = await BibleOfflineService.searchVerses(searchQuery.trim(), 20);
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
      } else {
        setSearchResults([]);
      }

      // Guardar búsqueda en historial
      await readingHistoryService.addSearch(searchQuery.trim(), smartResultsData.length);
      await loadRecentSearches();
    } catch (err: any) {
      console.error('Error en búsqueda:', err);
      Alert.alert('Error', 'No se pudo realizar la búsqueda. Verifica tu conexión.');
    } finally {
      setIsSearching(false);
    }
  };

  // Mostrar sugerencias mientras escribe
  const handleSearchQueryChange = (text: string) => {
    setSearchQuery(text);
    if (text.length >= 2) {
      const sug = smartSearchService.getSuggestions(text);
      setSuggestions(sug);
    } else {
      setSuggestions([]);
    }
    // Limpiar resultados si se borra la búsqueda
    if (text.length === 0) {
      setHasSearched(false);
      setSmartResults([]);
      setSearchResults([]);
    }
  };

  // Manejar selección de resultado inteligente
  const handleSmartResultPress = (result: SmartSearchResult) => {
    setSuggestions([]);

    switch (result.type) {
      case 'book':
        // Navegar a la lista de capítulos del libro
        navigation.navigate('BookChapters', {
          bookId: result.bookId!,
          bookName: result.bookName!,
          totalChapters: 50, // Se obtendrá del API
          testament: result.testament!,
        });
        break;

      case 'chapter':
        // Navegar directamente al capítulo
        navigation.navigate('ChapterReading', {
          bookId: result.bookId!,
          bookName: result.bookName!,
          chapter: result.chapter!,
          testament: result.testament,
        });
        break;

      case 'verse':
        // Navegar al capítulo con el versículo
        navigation.navigate('ChapterReading', {
          bookId: result.bookId!,
          bookName: result.bookName!,
          chapter: result.chapter!,
          testament: result.testament,
          fromFavorite: true, // Para mostrar solo ese versículo
          favoriteVerseNumber: result.verse,
        });
        break;

      case 'category':
        // Navegar al testamento correspondiente
        if (result.testament === 'old') {
          navigation.navigate('OldTestament');
        } else {
          navigation.navigate('NewTestament');
        }
        break;
    }
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSmartResults([]);
    setSuggestions([]);
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
  // ✅ IMPLEMENTADO - Continuar Lectura
  // Navega a la última lectura del usuario
  // =====================================================
  const handleContinueReading = () => {
    if (lastReading) {
      // Navegar a la última lectura guardada
      navigation.navigate('ChapterReading', {
        bookId: lastReading.bookId,
        bookName: lastReading.bookName,
        chapter: lastReading.chapter,
        testament: lastReading.testament,
      });
    } else {
      // Si no hay historial, ir a la lectura del día
      navigation.navigate('DailyReading', {});
    }
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
  // ✅ IMPLEMENTADO - Búsqueda reciente seleccionada
  // Repetir la búsqueda
  // =====================================================
  const handleRecentSearch = (search: RecentSearch) => {
    setSearchQuery(search.text);
    // Ejecutar la búsqueda automáticamente
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  // =====================================================
  // ✅ IMPLEMENTADO - Borrar búsquedas recientes
  // =====================================================
  const handleClearSearches = async () => {
    Alert.alert(
      '🗑️ Borrar búsquedas',
      '¿Deseas borrar todas las búsquedas recientes?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: async () => {
            await readingHistoryService.clearSearchHistory();
            await loadRecentSearches();
          },
        },
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
            placeholder="Buscar libro, capítulo, versículo..."
            placeholderTextColor={`${colors.charcoal.muted}80`}
            value={searchQuery}
            onChangeText={handleSearchQueryChange}
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

      {/* Sugerencias mientras escribe */}
      {suggestions.length > 0 && !hasSearched && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Sugerencias</Text>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={`sug-${index}`}
              style={styles.suggestionItem}
              onPress={() => handleSmartResultPress(suggestion)}
              activeOpacity={0.7}>
              <MaterialIcons
                name={
                  suggestion.type === 'book' ? 'menu-book' :
                  suggestion.type === 'chapter' ? 'article' :
                  suggestion.type === 'category' ? 'folder' : 'format-quote'
                }
                size={20}
                color={colors.gold.DEFAULT}
              />
              <View style={styles.suggestionTextContainer}>
                <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                <Text style={styles.suggestionSubtitle}>{suggestion.subtitle}</Text>
              </View>
              <MaterialIcons name="arrow-forward-ios" size={16} color={colors.charcoal.muted} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Resultados inteligentes (libros, capítulos, categorías) */}
      {!isSearching && smartResults.length > 0 && (
        <View style={styles.smartResultsContainer}>
          <Text style={styles.smartResultsTitle}>Resultados</Text>
          <ScrollView style={styles.smartResultsList} showsVerticalScrollIndicator={false}>
            {smartResults.map((result, index) => (
              <TouchableOpacity
                key={`smart-${index}`}
                style={styles.smartResultCard}
                onPress={() => handleSmartResultPress(result)}
                activeOpacity={0.7}>
                <View style={[
                  styles.smartResultIcon,
                  {backgroundColor:
                    result.type === 'book' ? colors.gold.light :
                    result.type === 'chapter' ? colors.primary.light :
                    result.type === 'category' ? colors.secondary + '30' :
                    colors.burgundy.light
                  }
                ]}>
                  <MaterialIcons
                    name={
                      result.type === 'book' ? 'menu-book' :
                      result.type === 'chapter' ? 'article' :
                      result.type === 'category' ? 'folder' : 'format-quote'
                    }
                    size={24}
                    color={
                      result.type === 'book' ? colors.gold.dark :
                      result.type === 'chapter' ? colors.primary.DEFAULT :
                      result.type === 'category' ? colors.secondary :
                      colors.burgundy.DEFAULT
                    }
                  />
                </View>
                <View style={styles.smartResultContent}>
                  <Text style={styles.smartResultTitle}>{result.title}</Text>
                  <Text style={styles.smartResultSubtitle}>{result.subtitle}</Text>
                  {result.text && (
                    <Text style={styles.smartResultText} numberOfLines={2}>
                      {result.text}
                    </Text>
                  )}
                </View>
                <MaterialIcons name="chevron-right" size={24} color={colors.charcoal.muted} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Resultados de búsqueda */}
      {isSearching && (
        <View style={styles.searchingContainer}>
          <ActivityIndicator size="large" color={colors.burgundy.DEFAULT} />
          <Text style={styles.searchingText}>Buscando...</Text>
        </View>
      )}

      {!isSearching && hasSearched && searchResults.length === 0 && smartResults.length === 0 && (
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
                        {lastReading
                          ? `${lastReading.bookName.toUpperCase()} ${lastReading.chapter}`
                          : 'LECTURA DEL DÍA'
                        }
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
                      {lastReading
                        ? `${lastReading.bookName.toUpperCase()} ${lastReading.chapter}`
                        : 'LECTURA DEL DÍA'
                      }
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

  // Sugerencias
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 300,
  },
  suggestionsTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.charcoal.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.cream,
  },
  suggestionTextContainer: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.charcoal.dark,
  },
  suggestionSubtitle: {
    fontSize: 11,
    color: colors.charcoal.muted,
    marginTop: 2,
  },

  // Resultados inteligentes
  smartResultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 16,
  },
  smartResultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.charcoal.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  smartResultsList: {
    flex: 1,
  },
  smartResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  smartResultIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smartResultContent: {
    flex: 1,
    marginLeft: 14,
  },
  smartResultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.charcoal.dark,
  },
  smartResultSubtitle: {
    fontSize: 13,
    color: colors.charcoal.muted,
    marginTop: 2,
  },
  smartResultText: {
    fontSize: 12,
    color: colors.charcoal.muted,
    fontStyle: 'italic',
    marginTop: 4,
  },
});

export default BibleSearchScreen;

