import React, {useState, useEffect} from 'react';
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
  TouchableWithoutFeedback,
  Platform
} from 'react-native';
import {ImageBackground} from 'expo-image';
import {MaterialIcons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {ThemeColors} from '../theme/colors';
import {BibleSearchScreenProps} from '../navigation/AppNavigator';
import {useTheme} from '../contexts/ThemeContext';
import {bibleService, SearchResult} from '../services/bible.service';
import {useOfflineBible} from '../hooks/useOfflineBible';
import {useIsOnline, useNetwork} from '../contexts/NetworkContext';
import {readingHistoryService, ReadingHistoryItem} from '../services/reading-history.service';
import {smartSearchService, SmartSearchResult} from '../services/smart-search.service';
import {BibleOfflineService} from '../services/english-bible-download.service';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import OfflineBanner from '../components/OfflineBanner';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import Toast from 'react-native-toast-message';
import { t } from '../locales/i18n';
import PremiumAlertModal, { PremiumAlertAction } from '../components/PremiumAlertModal';

type RecentSearch = {
  id: string;
  text: string;
  category: string;
};

const BibleSearchScreen: React.FC<BibleSearchScreenProps> = ({navigation}) => {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => getStyles(colors, isDarkMode, insets.top), [colors, isDarkMode, insets.top]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [smartResults, setSmartResults] = useState<SmartSearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SmartSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastReading, setLastReading] = useState<ReadingHistoryItem | null>(null);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  
  // Modal State
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    icon?: any;
    actions: PremiumAlertAction[];
  }>({
    visible: false,
    title: '',
    message: '',
    actions: []
  });

  const showPremiumAlert = (title: string, message: string, actions: PremiumAlertAction[], icon?: any) => {
    setAlertConfig({ visible: true, title, message, actions, icon });
  };

  const hidePremiumAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  // ✅ Hook para modo offline unificado
  const {isBibleDownloaded, refreshDownloadStatus} = useNetwork();
  const isOnline = useIsOnline();
  const needsDownload = !isOnline && !isBibleDownloaded;

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
      category: item.resultCount ? `${item.resultCount} ${t('search.results')}` : t('search.typeSearch'),
    }));
    setRecentSearches(formatted);
  };

  // Alerta de descarga movida a los manejadores de los testamentos

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
      showPremiumAlert(
        t('general.noConnection'),
        t('general.downloadRequired'),
        [
          { text: t('general.cancel') || 'Cancel', style: 'cancel', onPress: hidePremiumAlert },
          { 
            text: t('general.download'), 
            style: 'default', 
            onPress: () => {
              hidePremiumAlert();
              navigation.navigate('ManageDownloads' as any);
            }
          }
        ],
        'wifi-off'
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
      // ✅ BÚSQUEDA HÍBRIDA (Offline instantánea + Online de refuerzo)
      let offlineDone = false;
      
      const doOfflineSearch = async () => {
        if (isBibleDownloaded) {
          const {BibleOfflineService} = await import('../services/english-bible-download.service');
          const offlineResults = await BibleOfflineService.searchVerses(searchQuery.trim(), 20);
          const formattedResults: SearchResult[] = offlineResults.map((r: any) => ({
            bookId: r.bookId,
            bookName: r.bookName,
            chapter: r.chapter,
            verse: r.verse,
            text: r.text,
            highlightedText: r.text,
          }));
          
          setSearchResults(formattedResults);
          offlineDone = true;
          console.log('[BibleSearch] ⚡ Resultados offline mostrados');
        }
      };

      const doOnlineSearch = async () => {
        if (isOnline) {
          try {
            const response = await bibleService.searchVerses(searchQuery.trim(), { pageSize: 20 });
            // Solo actualizamos si los resultados son más o si no había offline
            setSearchResults(response.results);
            console.log('[BibleSearch] ✅ Resultados online recibidos');
          } catch (apiError: any) {
            console.warn('[BibleSearch] Falló búsqueda online:', apiError.message);
          }
        }
      };

      // Ejecutar ambas en paralelo
      await Promise.all([
        doOfflineSearch(),
        doOnlineSearch(),
      ]);
    } else {
      setSearchResults([]);
    }

    // Guardar búsqueda en historial
    await readingHistoryService.addSearch(searchQuery.trim(), smartResultsData.length);
    await loadRecentSearches();
  } catch (err: any) {
    console.error('Error en búsqueda:', err);
    Alert.alert('Error', 'Could not perform search. Check your connection.');
  } finally {
    setIsSearching(false);
    Keyboard.dismiss();
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
  // ✅ IMPLEMENTADO - Búsqueda por voz
  // =====================================================
  
  useSpeechRecognitionEvent("start", () => setIsListening(true));
  useSpeechRecognitionEvent("end", () => setIsListening(false));
  useSpeechRecognitionEvent("result", (event) => {
    if (event.results && event.results[0]?.transcript) {
      handleSearchQueryChange(event.results[0].transcript);
    }
  });

  const handleVoiceSearch = async () => {
    if (isListening) {
      ExpoSpeechRecognitionModule.stop();
      setIsListening(false);
      return;
    }

    try {
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) {
        Alert.alert("Permissions required", "Please allow microphone and speech recognition access in settings.");
        return;
      }
      
      ExpoSpeechRecognitionModule.start({
        lang: "en-US",
        interimResults: true,
        maxAlternatives: 1,
      });
    } catch (e) {
      console.warn('Error starting speech recognition:', e);
      Alert.alert('Error', 'Could not start voice search. Please try again.');
    }
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
  const handleOldTestament = async () => {
    // Re-checkear estado actual para evitar alertas falsas si acaba de descargar
    const confirmedDownloaded = await refreshDownloadStatus();

    if (!isOnline && !confirmedDownloaded) {
      showPremiumAlert(
        t('general.noConnection'),
        t('general.downloadRequired'),
        [
          { text: t('general.cancel') || 'Cancel', style: 'cancel', onPress: hidePremiumAlert },
          { 
            text: t('general.download'), 
            style: 'default', 
            onPress: () => {
              hidePremiumAlert();
              navigation.navigate('ManageDownloads', { returnTo: 'OldTestament' } as any);
            }
          }
        ],
        'wifi-off'
      );
      return;
    }
    navigation.navigate('OldTestament');
  };

  const handleNewTestament = async () => {
    // Re-checkear estado actual para evitar alertas falsas si acaba de descargar
    const confirmedDownloaded = await refreshDownloadStatus();

    if (!isOnline && !confirmedDownloaded) {
      showPremiumAlert(
        t('general.noConnection'),
        t('general.downloadRequired'),
        [
          { text: t('general.cancel') || 'Cancel', style: 'cancel', onPress: hidePremiumAlert },
          { 
            text: t('general.download'), 
            style: 'default', 
            onPress: () => {
              hidePremiumAlert();
              navigation.navigate('ManageDownloads', { returnTo: 'NewTestament' } as any);
            }
          }
        ],
        'wifi-off'
      );
      return;
    }
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
    showPremiumAlert(
      t('search.deleteSearches'),
      'Do you want to delete all recent searches?',
      [
        {text: t('general.cancel') || 'Cancel', style: 'cancel', onPress: hidePremiumAlert},
        {
          text: t('general.delete') || 'Delete',
          style: 'destructive',
          onPress: async () => {
            hidePremiumAlert();
            await readingHistoryService.clearSearchHistory();
            await loadRecentSearches();
          },
        },
      ],
      'delete-outline'
    );
  };

  return (
    <View style={styles.container}>
      <OfflineBanner />
      {/* Header - Fixed */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
          <TouchableOpacity
            onPress={toggleTheme}
            style={styles.profileButton}
            activeOpacity={0.7}>
            <MaterialIcons name={isDarkMode ? "light-mode" : "dark-mode"} size={26} color={colors.charcoal.dark} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleProfile}
            style={styles.profileButton}
            activeOpacity={0.7}>
            <MaterialIcons name="account-circle" size={28} color={colors.charcoal.dark} />
          </TouchableOpacity>
        </View>
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
            placeholder="Search book, chapter, verse..."
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
              style={[styles.micButton, isListening && { backgroundColor: `${colors.primary.DEFAULT}22`, borderRadius: 20 }]}
              activeOpacity={0.7}>
              <MaterialIcons name={isListening ? "mic-none" : "mic"} size={26} color={isListening ? colors.burgundy.DEFAULT : colors.primary.DEFAULT} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sugerencias mientras escribe */}
      {suggestions.length > 0 && !hasSearched && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Suggestions</Text>
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
          <Text style={styles.smartResultsTitle}>{t('search.smartResultsTitle')}</Text>
          <ScrollView style={styles.smartResultsList} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
                    colors.burgundy.accent
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
                      result.type === 'book' ? colors.gold.DEFAULT :
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
                <MaterialIcons name="arrow-forward" size={24} color={colors.charcoal.muted} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Resultados de búsqueda */}
      {isSearching && (
        <View style={styles.searchingContainer}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
          <Text style={styles.searchingText}>Searching...</Text>
        </View>
      )}

      {!isSearching && hasSearched && searchResults.length === 0 && smartResults.length === 0 && (
        <View style={styles.noResultsContainer}>
          <MaterialIcons name="search-off" size={48} color={colors.charcoal.muted} />
          <Text style={styles.noResultsText}>No results found</Text>
          <Text style={styles.noResultsSubtext}>Try different terms</Text>
        </View>
      )}

      {!isSearching && searchResults.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>
            {searchResults.length} {searchResults.length !== 1 ? t('search.results') : t('search.result')}
          </Text>
          <ScrollView style={styles.resultsList} keyboardShouldPersistTaps="handled">
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
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Testament Cards */}
        <View style={styles.cardsContainer}>
          <TouchableOpacity
            style={styles.testamentCard}
            onPress={handleOldTestament}
            activeOpacity={0.9}>
            <ImageBackground
              source={{ uri: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=800' }}
              style={styles.cardBackground}
              imageStyle={styles.cardBackgroundImage}
              cachePolicy="memory-disk">
              <LinearGradient
                colors={['rgba(54, 69, 79, 0.85)', 'rgba(54, 69, 79, 0.55)', 'rgba(54, 69, 79, 0.15)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cardOverlay}>
                <View style={styles.cardContent}>
                  <View style={styles.cardBadge}>
                    <View style={[styles.badgeDot, { backgroundColor: lastReading?.testament === 'old' ? colors.primary.DEFAULT : '#FFFFFF' }]} />
                    <Text style={[styles.badgeText, { color: '#FFFFFF' }]}>
                      46 BOOKS
                    </Text>
                  </View>
                  <Text style={styles.cardTitle}>Old{'\n'}Testament</Text>
                </View>
                <View style={styles.cardArrowContainer}>
                  <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testamentCard}
            onPress={handleNewTestament}
            activeOpacity={0.9}>
            <ImageBackground
              source={{ uri: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=800' }}
              style={styles.cardBackground}
              imageStyle={styles.cardBackgroundImage}
              cachePolicy="memory-disk">
              <LinearGradient
                colors={['rgba(166, 94, 110, 0.80)', 'rgba(166, 94, 110, 0.50)', 'rgba(166, 94, 110, 0.12)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cardOverlay}>
                <View style={styles.cardContent}>
                  <View style={styles.cardBadge}>
                    <View style={[styles.badgeDot, { backgroundColor: lastReading?.testament === 'new' ? colors.primary.DEFAULT : '#FFFFFF' }]} />
                    <Text style={[styles.badgeText, { color: '#FFFFFF' }]}>
                      27 BOOKS
                    </Text>
                  </View>
                  <Text style={styles.cardTitle}>New{'\n'}Testament</Text>
                </View>
                <View style={styles.cardArrowContainer}>
                  <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testamentCard}
            onPress={handleContinueReading}
            activeOpacity={0.9}>
            <ImageBackground
              source={{ uri: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=800' }}
              style={styles.cardBackground}
              imageStyle={styles.cardBackgroundImage}
              cachePolicy="memory-disk">
              <LinearGradient
                colors={['rgba(107, 154, 196, 0.85)', 'rgba(107, 154, 196, 0.55)', 'rgba(107, 154, 196, 0.15)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.cardOverlay}>
                <View style={styles.cardContent}>
                  <View style={styles.cardBadge}>
                    <MaterialIcons name="bookmark" size={16} color="rgba(255, 255, 255, 0.9)" />
                    <Text style={[styles.badgeText, { color: 'rgba(255, 255, 255, 0.9)' }]}>
                      {lastReading
                        ? `${lastReading.bookName.toUpperCase()} ${lastReading.chapter}`
                        : `TODAY'S READING`}
                    </Text>
                  </View>
                  <Text style={styles.cardTitle}>Continue{'\n'}reading</Text>
                </View>
                <View style={styles.cardArrowContainer}>
                  <MaterialIcons name="play-arrow" size={28} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        {/* Recent Searches */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recent searches</Text>
            <TouchableOpacity
              onPress={handleClearSearches}
              activeOpacity={0.7}>
              <Text style={styles.clearButton}>Clear</Text>
            </TouchableOpacity>
          </View>

          {recentSearches.map((search) => (
            <TouchableOpacity
              key={search.id}
              style={styles.recentItem}
              onPress={() => handleRecentSearch(search)}
              activeOpacity={0.7}>
              <View style={styles.recentItemContent}>
                <View style={[styles.recentIcon, {borderColor: `${colors.primary.DEFAULT}33`}]}>
                  <MaterialIcons name="history" size={20} color={colors.primary.DEFAULT} />
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

      {/* Floating Action Button for AI (solo si hay conexión) */}
      {!isSearching && !hasSearched && isOnline && (
        <TouchableOpacity
          style={styles.fabAI}
          onPress={() => navigation.navigate('AIAssistant')}
          activeOpacity={0.8}
        >
          <MaterialIcons name="auto-awesome" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}
      <PremiumAlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        actions={alertConfig.actions}
        onDismiss={hidePremiumAlert}
      />
    </View>
  );
};

const getStyles = (colors: ThemeColors, isDarkMode: boolean, safeTop: number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? colors.background.dark : colors.ivory.DEFAULT,
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
  suggestionHighlight: {
    color: isDarkMode ? colors.primary.DEFAULT : colors.primary.DEFAULT,
    fontWeight: '700',
  },
  // Results
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: isDarkMode ? colors.background.dark : colors.ivory.DEFAULT,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.charcoal.muted,
    marginBottom: 12,
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
    backgroundColor: isDarkMode ? colors.surface.dark : colors.surface.light,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: isDarkMode ? colors.ivory.border : colors.ivory.border,
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
    paddingTop: Platform.OS === 'android' ? Math.max(safeTop, 45) + 20 : Math.max(safeTop, 20) + 16,
    paddingBottom: 16,
    backgroundColor: isDarkMode ? colors.background.dark : colors.cream,
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
    backgroundColor: isDarkMode ? colors.background.dark : colors.cream,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? colors.paper : colors.surface.light,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.ivory.border,
    paddingLeft: 16,
    paddingRight: 10,
    height: 48,
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
    height: '100%',
    fontSize: 16,
    color: colors.charcoal.DEFAULT,
    textAlign: 'left',
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
    backgroundColor: isDarkMode ? colors.paper : colors.surface.light,
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
    backgroundColor: isDarkMode ? colors.paper : colors.surface.light,
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
    borderWidth: isDarkMode ? 1 : 0,
    borderColor: colors.ivory.border,
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
    borderBottomColor: isDarkMode ? colors.ivory.border : colors.cream,
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
    backgroundColor: isDarkMode ? colors.surface.dark : colors.surface.light,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: isDarkMode ? 1 : 0,
    borderColor: colors.ivory.border,
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
  
  // Floating Action Button AI
  fabAI: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 99,
  },
});

export default BibleSearchScreen;

