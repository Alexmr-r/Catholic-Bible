import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {useFocusEffect} from '@react-navigation/native';
import {ThemeColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';
import {NewTestamentScreenProps} from '../navigation/AppNavigator';
import {bibleService, Book as ApiBook} from '../services/bible.service';
import {EnglishBibleDownloadService, BibleOfflineService} from '../services/english-bible-download.service';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useIsOnline, useNetwork} from '../contexts/NetworkContext';

type BookCategory = 'Evangelios' | 'Hechos' | 'Cartas de Pablo' | 'Cartas Católicas' | 'Apocalipsis';

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
const mapCategory = (apiCategory: string): BookCategory => {
  const categoryMap: Record<string, BookCategory> = {
    'Evangelios': 'Evangelios',
    'GOSPELS': 'Evangelios',
    'Hechos': 'Hechos',
    'ACTS': 'Hechos',
    'HISTORY': 'Hechos', // ✅ Añadido - del backend
    'HISTORICAL': 'Hechos',
    'Historia': 'Hechos', // ✅ Añadido - display name del backend
    'Cartas de Pablo': 'Cartas de Pablo',
    'PAULINE_EPISTLES': 'Cartas de Pablo',
    'PAULINE_LETTERS': 'Cartas de Pablo', // ✅ Añadido - del backend
    'Cartas de San Pablo': 'Cartas de Pablo', // ✅ Añadido - display name del backend
    'Cartas Católicas': 'Cartas Católicas',
    'CATHOLIC_EPISTLES': 'Cartas Católicas',
    'CATHOLIC_LETTERS': 'Cartas Católicas', // ✅ Añadido - del backend
    'Apocalipsis': 'Apocalipsis',
    'REVELATION': 'Apocalipsis',
    'PROPHETIC': 'Apocalipsis', // ✅ Añadido - del backend
    'Profético': 'Apocalipsis', // ✅ Añadido - display name del backend
  };
  return categoryMap[apiCategory] || 'Cartas de Pablo';
};

// Mapeo de colores por categoría
const getCategoryColor = (category: BookCategory, colors: ThemeColors): string => {
  const colorMap: Record<BookCategory, string> = {
    'Evangelios': colors.secondary,
    'Hechos': colors.gold.accent,
    'Cartas de Pablo': colors.primary.DEFAULT,
    'Cartas Católicas': colors.primary.dark,
    'Apocalipsis': colors.burgundy.DEFAULT,
  };
  return colorMap[category];
};

const loadNewTestamentOffline = async (): Promise<ApiBook[]> => {
  try {
    const offlineData = await BibleOfflineService.loadData();

    if (!offlineData || !offlineData.books) {
      console.error('[NewTestament] Offline data is empty or invalid');
      return [];
    }

    const newTestamentIds = [
      'matthew', 'mark', 'luke', 'john', 'acts', 'romans', '1corinthians', '2corinthians',
      'galatians', 'ephesians', 'philippians', 'colossians', '1thessalonians', '2thessalonians',
      '1timothy', '2timothy', 'titus', 'philemon', 'hebrews', 'james', '1peter', '2peter',
      '1john', '2john', '3john', 'jude', 'revelation'
    ];

    return offlineData.books
      .filter(book => newTestamentIds.includes(book.id.toLowerCase()))
      .map(book => ({
        id: book.id,
        name: book.name || book.id,
        abbreviation: (book.name || book.id).substring(0, 3).toUpperCase(),
        testament: 'new' as const,
        category: 'Evangelios',
        totalChapters: book.chapters?.length || 0,
        description: '',
      }));
  } catch (error) {
    console.error('[NewTestament] Error loading offline books:', error);
    throw error;
  }
};

const NewTestamentScreen: React.FC<NewTestamentScreenProps> = ({navigation}) => {
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

      const actuallyDownloaded = await EnglishBibleDownloadService.isDownloaded();

      if (isOnline) {
        // ✅ CON INTERNET: Siempre usar API
        try {
          apiBooks = await bibleService.getNewTestamentBooks();
        } catch (apiError) {
          console.warn('[NewTestament] Error API, reintentando offline si es posible:', apiError);
          try {
            apiBooks = await loadNewTestamentOffline();
          } catch (offlineError) {
            throw apiError;
          }
        }
      } else {
        // ✅ SIN INTERNET: usar datos offline si existen
        try {
          apiBooks = await loadNewTestamentOffline();
        } catch (offlineError) {
          throw new Error('NO_DOWNLOAD');
        }
      }

      // Transformar los libros al formato local
      const transformedBooks: Book[] = apiBooks.map((apiBook: ApiBook) => ({
        id: apiBook.id,
        abbreviation: apiBook.abbreviation,
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
      if (err.message === 'NO_DOWNLOAD' || (!isOnline && !isBibleDownloaded)) {
        setError('NO_DOWNLOAD');
      } else {
        setError('No se pudieron cargar los libros. Verifica tu conexión.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['Todo', 'Evangelios', 'Hechos', 'Cartas de Pablo', 'Cartas Católicas', 'Apocalipsis'];

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
      testament: 'new',
    });
  };

  const getCategoryTitle = (category: BookCategory): string => {
    const titles: Record<BookCategory, string> = {
      Evangelios: 'Los Evangelios',
      Hechos: 'Hechos de los Apóstoles',
      'Cartas de Pablo': 'Cartas de San Pablo',
      'Cartas Católicas': 'Cartas Católicas',
      Apocalipsis: 'Apocalipsis',
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
        <Text style={styles.headerTitle}>Nuevo Testamento</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Estado de carga */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
          <Text style={styles.loadingText}>Cargando libros...</Text>
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
              ? 'No tienes conexión'
              : 'Error de conexión'
            }
          </Text>
          <Text style={styles.errorSubtext}>
            {error === 'NO_DOWNLOAD'
              ? 'Tienes que descargar la Biblia para leerla sin conexión'
              : 'Verifica tu conexión a internet para continuar'
            }
          </Text>

          {(error === 'NO_DOWNLOAD' || retryCount >= 2) && !isBibleDownloaded ? (
            <View style={styles.errorButtons}>
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => navigation.navigate('ManageDownloads')}
              >
                <MaterialIcons name="cloud-download" size={18} color="#FFFFFF" />
                <Text style={styles.downloadButtonText}>Descargar Biblia</Text>
              </TouchableOpacity>
              {retryCount >= 2 && (
                <TouchableOpacity style={styles.retryButtonSecondary} onPress={loadBooks}>
                  <Text style={styles.retryButtonSecondaryText}>Reintentar conexión</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <TouchableOpacity style={styles.retryButton} onPress={loadBooks}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
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
              placeholder="Buscar libro..."
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
          {categories.map((category) => (
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
                {category}
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
                        {book.chapters} Capítulos
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
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.charcoal.DEFAULT,
  },

  // Category Chips (exactamente igual que FavoritesScreen)
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
    paddingTop: 8,
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

export default NewTestamentScreen;

