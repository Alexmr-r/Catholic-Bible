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
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {colors} from '../theme/colors';
import {OldTestamentScreenProps} from '../navigation/AppNavigator';
import {bibleService, Book as ApiBook} from '../services/bible.service';
import {useOfflineBible} from '../hooks/useOfflineBible';

type BookCategory = 'Pentateuco' | 'Históricos' | 'Sapienciales' | 'Profetas';

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
    'Pentateuco': 'Pentateuco',
    'PENTATEUCH': 'Pentateuco',
    'Históricos': 'Históricos',
    'HISTORICAL': 'Históricos',
    'Sapienciales': 'Sapienciales',
    'WISDOM': 'Sapienciales',
    'Profetas': 'Profetas',
    'PROPHETS': 'Profetas',
    'MAJOR_PROPHETS': 'Profetas',
    'MINOR_PROPHETS': 'Profetas',
  };
  return categoryMap[apiCategory] || 'Pentateuco';
};

// Mapeo de colores por categoría
const getCategoryColor = (category: BookCategory): string => {
  const colorMap: Record<BookCategory, string> = {
    'Pentateuco': colors.secondary,
    'Históricos': colors.gold.accent,
    'Sapienciales': colors.primary.DEFAULT,
    'Profetas': colors.charcoal.muted,
  };
  return colorMap[category];
};

const OldTestamentScreen: React.FC<OldTestamentScreenProps> = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BookCategory | 'Todo'>('Todo');
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Hook para modo offline
  const {isOnline, isBibleDownloaded} = useOfflineBible();

  // =====================================================
  // ✅ CONECTADO A API - Cargar libros del Antiguo Testamento
  // =====================================================
  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let apiBooks: ApiBook[] = [];

      // LÓGICA CORRECTA:
      // - Con internet → SIEMPRE usar API (más actualizado)
      // - Sin internet + Biblia descargada → usar datos offline
      // - Sin internet + sin descarga → error

      if (isOnline) {
        // ✅ CON INTERNET: Siempre usar API
        apiBooks = await bibleService.getOldTestamentBooks();
      } else if (isBibleDownloaded) {
        // ✅ SIN INTERNET + DESCARGADA: usar datos offline
        const {BibleOfflineService} = await import('../services/english-bible-download.service');
        const offlineData = await BibleOfflineService.loadData();

        // Convertir datos offline al formato ApiBook
        // Filtrar solo libros del AT (los primeros 46 son AT en la Biblia Católica)
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

        apiBooks = offlineData.books
          .filter(book => oldTestamentIds.includes(book.id.toLowerCase()) ||
                         offlineData.books.indexOf(book) < 46)
          .map(book => ({
            id: book.id,
            name: book.name,
            abbreviation: book.name.substring(0, 3),
            testament: 'old' as const,
            category: 'Pentateuco',
            totalChapters: book.chapters.length,
            description: '',
          }));
      } else {
        // Sin internet y sin descarga
        throw new Error('NO_CONNECTION_NO_DOWNLOAD');
      }

      // Transformar los libros al formato local
      const transformedBooks: Book[] = apiBooks.map((apiBook: ApiBook) => ({
        id: apiBook.id,
        abbreviation: apiBook.abbreviation,
        name: apiBook.name,
        chapters: apiBook.totalChapters,
        category: mapCategory(apiBook.category),
        enabled: true,
        color: getCategoryColor(mapCategory(apiBook.category)),
      }));

      setBooks(transformedBooks);
      setRetryCount(0); // Reset contador de reintentos
    } catch (err: any) {
      console.error('Error cargando libros:', err);
      setRetryCount(prev => prev + 1);

      if (err.message === 'NO_CONNECTION_NO_DOWNLOAD' || (!isOnline && !isBibleDownloaded)) {
        setError('NO_DOWNLOAD');
      } else {
        setError('No se pudieron cargar los libros. Verifica tu conexión.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['Todo', 'Pentateuco', 'Históricos', 'Sapienciales', 'Profetas'];

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
  // 🔴 MOCKEADO - Filtro de libros
  // TODO: Implementar filtro avanzado
  // =====================================================
  const handleFilter = () => {
    Alert.alert(
      '🔧 Filtros',
      'Funcionalidad en desarrollo.\n\nPróximamente podrás filtrar por tipo de libro, número de capítulos, etc.',
      [{text: 'Entendido'}]
    );
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
      Pentateuco: 'Pentateuco',
      Históricos: 'Libros Históricos',
      Sapienciales: 'Libros Sapienciales',
      Profetas: 'Profetas Mayores',
    };
    return titles[category];
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
        <Text style={styles.headerTitle}>Antiguo Testamento</Text>
        <TouchableOpacity
          onPress={handleFilter}
          style={styles.filterButton}
          activeOpacity={0.7}>
          <MaterialIcons name="filter-list" size={24} color={colors.charcoal.dark} />
        </TouchableOpacity>
      </View>

      {/* Estado de carga */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.burgundy.DEFAULT} />
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
              ? 'Sin conexión a internet'
              : 'No se pudieron cargar los libros'
            }
          </Text>
          <Text style={styles.errorSubtext}>
            {error === 'NO_DOWNLOAD'
              ? 'Descarga la Biblia para leer sin conexión'
              : 'Verifica tu conexión a internet'
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
                      name="chevron-right"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: `${colors.cream}F2`,
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
  filterButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
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
    backgroundColor: colors.cream,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.ivory.border,
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
    color: colors.charcoal.muted,
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
    backgroundColor: '#FFFFFF',
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

export default OldTestamentScreen;

