import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {useFocusEffect} from '@react-navigation/native';
import {ThemeColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';
import {OldTestamentScreenProps} from '../navigation/AppNavigator';
import {bibleService, Book as ApiBook} from '../services/bible.service';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useIsOnline, useNetwork} from '../contexts/NetworkContext';
import {BibleOfflineService, BibleOfflineDownloadService} from '../services/english-bible-download.service';

type BookCategory = 'Pentateuco' | 'Históricos' | 'Sapienciales' | 'Profetas Mayores' | 'Profetas Menores';

type Book = {
  id: string;
  abbreviation: string;
  name: string;
  chapters: number;
  category: BookCategory;
  enabled: boolean;
  color: string;
};

// Mapeo de categorías de la API a nuestras categorías locales
const getOfflineOldTestamentCategory = (bookId: string): BookCategory => {
  const id = bookId.toLowerCase();
  if (['genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy'].includes(id)) {
    return 'Pentateuco';
  }
  if ([
    'joshua', 'judges', 'ruth', '1samuel', '2samuel', '1kings', '2kings',
    '1chronicles', '2chronicles', 'ezra', 'nehemiah', 'tobit', 'judith',
    'esther', '1maccabees', '2maccabees'
  ].includes(id)) {
    return 'Históricos';
  }
  if ([
    'job', 'psalms', 'proverbs', 'ecclesiastes', 'song', 'songofsolomon',
    'wisdom', 'sirach'
  ].includes(id)) {
    return 'Sapienciales';
  }
  if ([
    'isaiah', 'jeremiah', 'lamentations', 'baruch', 'ezekiel', 'daniel'
  ].includes(id)) {
    return 'Profetas Mayores';
  }
  return 'Profetas Menores';
};

const mapCategory = (apiCategory: string): BookCategory => {
  if (!apiCategory) return 'Pentateuco';
  const normalized = apiCategory.toUpperCase().trim().replace(/[\s_]+/g, '_');
  const categoryMap: Record<string, BookCategory> = {
    'PENTATEUCO': 'Pentateuco',
    'PENTATEUCH': 'Pentateuco',
    'HISTORICOS': 'Históricos',
    'HISTÓRICOS': 'Históricos',
    'HISTORICAL': 'Históricos',
    'SAPIENCIALES': 'Sapienciales',
    'WISDOM': 'Sapienciales',
    'PROFETAS_MAYORES': 'Profetas Mayores',
    'PROPHETS_MAJOR': 'Profetas Mayores',
    'MAJOR_PROPHETS': 'Profetas Mayores',
    'PROFETAS_MENORES': 'Profetas Menores',
    'PROPHETS_MINOR': 'Profetas Menores',
    'MINOR_PROPHETS': 'Profetas Menores',
  };
  return categoryMap[normalized] || 'Pentateuco';
};

// Mapeo de colores por categoría
const getCategoryColor = (category: BookCategory, colors: ThemeColors): string => {
  const colorMap: Record<BookCategory, string> = {
    'Pentateuco': colors.secondary,
    'Históricos': colors.gold.accent,
    'Sapienciales': colors.primary.DEFAULT,
    'Profetas Mayores': colors.burgundy.DEFAULT,
    'Profetas Menores': colors.burgundy.accent,
  };
  return colorMap[category];
};

const loadOldTestamentOffline = async (): Promise<ApiBook[]> => {
  try {
    const offlineData = await BibleOfflineService.loadData();

    if (!offlineData || !offlineData.books) {
      console.error('[OldTestament] Offline data is empty or invalid');
      return [];
    }

    const oldTestamentIds = [
      'genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy',
      'joshua', 'judges', 'ruth', '1samuel', '2samuel', '1kings', '2kings',
      '1chronicles', '2chronicles', 'ezra', 'nehemiah', 'tobit', 'judith',
      'esther', '1maccabees', '2maccabees', 'job', 'psalms', 'proverbs',
      'ecclesiastes', 'songofsolomon', 'wisdom', 'sirach',
      'isaiah', 'jeremiah', 'lamentations', 'baruch', 'ezekiel', 'daniel',
      'hosea', 'joel', 'amos', 'obadiah', 'jonah', 'micah', 'nahum',
      'habakkuk', 'zephaniah', 'haggai', 'zechariah', 'malachi'
    ];

    return offlineData.books
      .filter(book => oldTestamentIds.includes(book.id.toLowerCase()))
      .map(book => ({
        id: book.id,
        name: book.name || book.id,
        abbreviation: (book.name || book.id).substring(0, 3).toUpperCase(),
        testament: 'old' as const,
        category: getOfflineOldTestamentCategory(book.id),
        totalChapters: book.chapters?.length || 0,
        description: '',
      }));
  } catch (error) {
    console.error('[OldTestament] Error loading offline books:', error);
    throw error;
  }
};

const OldTestamentScreen: React.FC<OldTestamentScreenProps> = ({navigation}) => {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => getStyles(colors, isDarkMode, insets.top), [colors, isDarkMode, insets.top]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BookCategory | 'Todo'>('Todo');
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Hook para modo offline global
  const {isBibleDownloaded, refreshDownloadStatus} = useNetwork();
  const isOnline = useIsOnline();

  // =====================================================
  // ✅ CONECTADO A API / OFFLINE - Cargar libros cada vez que la pantalla gana foco
  // =====================================================
  useFocusEffect(
    React.useCallback(() => {
      const init = async () => {
        await refreshDownloadStatus();
        loadBooks();
      };
      init();
    }, [isOnline, isBibleDownloaded])
  );

  const loadBooks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let apiBooks: ApiBook[] = [];

      // LÓGICA CORRECTA:
      // - Con internet → SIEMPRE usar API (más actualizado)
      // - Sin internet + Biblia descargada → usar datos offline
      // - Sin internet + sin descarga → error

      const actuallyDownloaded = await BibleOfflineDownloadService.isDownloaded();

      if (isOnline) {
        // ✅ CON INTERNET: Siempre usar API
        try {
          apiBooks = await bibleService.getOldTestamentBooks();
        } catch (apiError) {
          console.warn('[OldTestament] Error API, reintentando offline si es posible:', apiError);
          try {
            apiBooks = await loadOldTestamentOffline();
          } catch (offlineError) {
            throw apiError;
          }
        }
      } else {
        // ✅ SIN INTERNET: usar datos offline si existen
        try {
          apiBooks = await loadOldTestamentOffline();
        } catch (offlineError) {
          throw new Error('NO_DOWNLOAD');
        }
      }

      // Transformar los libros al formato local
      const transformedBooks: Book[] = apiBooks.map((apiBook: ApiBook) => ({
        id: apiBook.id,
        // Estandarización a 3 letras para máxima consistencia visual (Apple Style)
        abbreviation: apiBook.abbreviation.length > 3 
          ? apiBook.abbreviation.substring(0, 3).toUpperCase() 
          : apiBook.abbreviation.toUpperCase(),
        name: apiBook.name,
        chapters: apiBook.totalChapters,
        category: mapCategory(apiBook.category),
        enabled: true,
        color: getCategoryColor(mapCategory(apiBook.category), colors),
      }));

      setBooks(transformedBooks);
      setRetryCount(0);
    } catch (err: any) {
      console.error('Error cargando libros:', err);
      // Priorizar el aviso de "Descarga Necesaria" si realmente no está descargada
      if (err.message === 'NO_DOWNLOAD' || !isBibleDownloaded) {
        setError('NO_DOWNLOAD');
      } else {
        setError('No se pudieron cargar los libros. Verifica tu conexión.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const activeCategories = React.useMemo(() => {
    if (books.length === 0) return ['Todo'];
    const hasPentateuco = books.some(b => b.category === 'Pentateuco');
    const hasHistoricos = books.some(b => b.category === 'Históricos');
    const hasSapienciales = books.some(b => b.category === 'Sapienciales');
    const hasMayores = books.some(b => b.category === 'Profetas Mayores');
    const hasMenores = books.some(b => b.category === 'Profetas Menores');

    const result = ['Todo'];
    if (hasPentateuco) result.push('Pentateuco');
    if (hasHistoricos) result.push('Históricos');
    if (hasSapienciales) result.push('Sapienciales');
    if (hasMayores) result.push('Profetas Mayores');
    if (hasMenores) result.push('Profetas Menores');
    return result;
  }, [books]);

  React.useEffect(() => {
    if (activeCategories.length > 0 && !activeCategories.includes(selectedCategory)) {
      setSelectedCategory('Todo');
    }
  }, [activeCategories, selectedCategory]);

  const filteredBooks = books.filter(book => {
    const matchesCategory = selectedCategory === 'Todo' || book.category === selectedCategory;
    const matchesSearch = book.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const groupedBooks = filteredBooks.reduce((acc, book) => {
    if (!acc[book.category]) {
      acc[book.category] = [];
    }
    acc[book.category].push(book);
    return acc;
  }, {} as Record<BookCategory, Book[]>);

  const handleBack = () => {
    navigation.goBack();
  };

  // =====================================================
  // ✅ NAVEGACIÓN DINÁMICA - Navega a la pantalla de capítulos
  // =====================================================
  const handleBookPress = (book: Book) => {
    // Navegar a la pantalla de selección de capítulos
    navigation.navigate('BookChapters', {
      bookId: book.id,
      bookName: book.name,
      totalChapters: book.chapters,
      testament: 'old',
    });
  };

  const getCategoryTitle = (category: BookCategory): string => {
    const titles: Record<BookCategory, string> = {
      Pentateuco: 'Pentateuch',
      Históricos: 'Historical Books',
      Sapienciales: 'Wisdom Books',
      'Profetas Mayores': 'Major Prophets',
      'Profetas Menores': 'Minor Prophets',
    };
    return titles[category] || category;
  };

  return (
    <View style={styles.container}>
      {/* Header Sticky */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color={colors.charcoal.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Old Testament</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Estado de carga */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
          <Text style={styles.loadingText}>Loading books...</Text>
        </View>
      )}

      {/* Estado de error */}
      {error && !isLoading && (
        <View style={styles.errorContainer}>
          <MaterialIcons
            name={error === 'NO_DOWNLOAD' ? 'cloud-off' : 'error-outline'}
            size={48}
            color={error === 'NO_DOWNLOAD' ? colors.charcoal.muted : colors.burgundy.DEFAULT}
          />
          <Text style={styles.errorText}>
            {error === 'NO_DOWNLOAD'
              ? 'No connection'
              : 'Connection error'
            }
          </Text>
          <Text style={styles.errorSubtext}>
            {error === 'NO_DOWNLOAD'
              ? 'You must download the Bible to read it offline'
              : 'Check your internet connection to continue'
            }
          </Text>

          {/* Mostrar opción de descargar si está offline sin descarga o si falló 2+ veces */}
          {(error === 'NO_DOWNLOAD' || retryCount >= 2) && !isBibleDownloaded ? (
            <View style={styles.errorButtons}>
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => navigation.navigate('ManageDownloads')}
              >
                <MaterialIcons name="cloud-download" size={18} color="#FFFFFF" />
                <Text style={styles.downloadButtonText}>Download Bible</Text>
              </TouchableOpacity>
              {retryCount >= 2 && (
                <TouchableOpacity style={styles.retryButtonSecondary} onPress={loadBooks}>
                  <Text style={styles.retryButtonSecondaryText}>Retry connection</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <TouchableOpacity style={styles.retryButton} onPress={loadBooks}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Contenido cuando hay datos */}
      {!isLoading && !error && (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <MaterialIcons
              name="search"
              size={22}
              color={colors.charcoal.muted}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search book..."
              placeholderTextColor={`${colors.charcoal.muted}80`}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
          </View>
        </View>

        {/* Category Chips - Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContainer}>
          {activeCategories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.chip,
                selectedCategory === category && styles.chipActive,
              ]}
              onPress={() => setSelectedCategory(category as BookCategory | 'Todo')}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.chipText,
                  selectedCategory === category && styles.chipTextActive,
                ]}>
                {category === 'Todo' ? 'All' : getCategoryTitle(category as BookCategory)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Books by Category */}
        <View style={styles.booksContainer}>
          {Object.entries(groupedBooks).map(([category, categoryBooks]) => (
            <View key={category} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryDot} />
                <Text style={styles.categoryTitle}>
                  {getCategoryTitle(category as BookCategory)}
                </Text>
              </View>

              <View style={styles.booksList}>
                {categoryBooks.map((book) => (
                  <TouchableOpacity
                    key={book.id}
                    style={[
                      styles.bookCard,
                      !book.enabled && styles.bookCardDisabled,
                    ]}
                    onPress={() => handleBookPress(book)}
                    activeOpacity={book.enabled ? 0.7 : 0.9}>
                    <View
                      style={[
                        styles.bookIcon,
                        !book.enabled && styles.bookIconDisabled,
                        {backgroundColor: book.enabled ? `${book.color}15` : `${colors.charcoal.muted}10`},
                      ]}>
                      <Text
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.7}
                        style={[
                          styles.bookIconText,
                          !book.enabled && styles.bookIconTextDisabled,
                          {color: book.enabled ? book.color : colors.charcoal.muted},
                        ]}>
                        {book.abbreviation}
                      </Text>
                    </View>

                    <View style={styles.bookInfo}>
                      <Text
                        style={[
                          styles.bookName,
                          !book.enabled && styles.bookNameDisabled,
                        ]}>
                        {book.name}
                      </Text>
                      <Text style={styles.bookChapters}>
                        {book.chapters} Chapters
                      </Text>
                    </View>

                    <MaterialIcons
                      name="arrow-forward"
                      size={24}
                      color={book.enabled ? colors.charcoal.muted : `${colors.charcoal.muted}40`}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
      )}
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
    paddingTop: Platform.OS === 'android' ? Math.max(safeTop, 45) + 20 : Math.max(safeTop, 20) + 16,
    paddingBottom: 12,
    backgroundColor: isDarkMode ? colors.background.dark : colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: colors.ivory.border,
  },

  // Loading y Error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.charcoal.muted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.charcoal.muted,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.burgundy.DEFAULT,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: colors.charcoal.dark,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerSpacer: {
    width: 40,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },

  // Search Section
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: isDarkMode ? colors.background.dark : colors.cream,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    backgroundColor: isDarkMode ? colors.ivory.shade : '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.ivory.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
    alignSelf: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.charcoal.DEFAULT,
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },

  // Category Chips (como en FavoritesScreen)
  chipsScroll: {
    paddingVertical: 8,
  },
  chipsContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
    alignItems: 'flex-start',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: isDarkMode ? colors.primary.light : '#FFFFFF',
    borderWidth: 1,
    borderColor: isDarkMode ? colors.primary.light : colors.ivory.border,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minHeight: 42,
  },
  chipActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
    color: isDarkMode ? colors.charcoal.DEFAULT : colors.charcoal.muted,
    flexShrink: 1,
    flexGrow: 0,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Books Container
  booksContainer: {
    paddingHorizontal: 16,
    gap: 24,
  },
  categorySection: {
    gap: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  categoryDot: {
    width: 4,
    height: 12,
    backgroundColor: colors.burgundy.accent,
    borderRadius: 2,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.burgundy.accent,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  // Books List
  booksList: {
    gap: 12,
  },
  bookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? colors.paper : '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.ivory.border,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  bookCardDisabled: {
    opacity: 0.5,
    backgroundColor: `${colors.ivory.shade}50`,
  },
  bookIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookIconDisabled: {
    backgroundColor: `${colors.charcoal.muted}10`,
  },
  bookIconText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  bookIconTextDisabled: {
    color: colors.charcoal.muted,
  },
  bookInfo: {
    flex: 1,
  },
  bookName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.charcoal.dark,
    marginBottom: 2,
  },
  bookNameDisabled: {
    color: colors.charcoal.muted,
  },
  bookChapters: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.charcoal.muted,
  },

  bottomSpacer: {
    height: 20,
  },
  // Estilos adicionales para error mejorado
  errorSubtext: {
    fontSize: 13,
    color: colors.charcoal.muted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  errorButtons: {
    alignItems: 'center',
    gap: 12,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.gold.DEFAULT,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  retryButtonSecondary: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryButtonSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.charcoal.muted,
    textDecorationLine: 'underline',
  },
});

export default OldTestamentScreen;

