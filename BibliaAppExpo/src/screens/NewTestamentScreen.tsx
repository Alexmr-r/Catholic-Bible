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
import {NewTestamentScreenProps} from '../navigation/AppNavigator';
import {bibleService, Book as ApiBook} from '../services/bible.service';

type BookCategory = 'Evangelios' | 'Historia' | 'Cartas' | 'Profetico';

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
    'Historia': 'Historia',
    'ACTS': 'Historia',
    'HISTORICAL': 'Historia',
    'Cartas': 'Cartas',
    'PAULINE_EPISTLES': 'Cartas',
    'CATHOLIC_EPISTLES': 'Cartas',
    'LETTERS': 'Cartas',
    'Profetico': 'Profetico',
    'REVELATION': 'Profetico',
    'PROPHETIC': 'Profetico',
  };
  return categoryMap[apiCategory] || 'Cartas';
};

// Mapeo de colores por categoría
const getCategoryColor = (category: BookCategory): string => {
  const colorMap: Record<BookCategory, string> = {
    'Evangelios': colors.secondary,
    'Historia': colors.gold.accent,
    'Cartas': colors.primary.DEFAULT,
    'Profetico': colors.charcoal.muted,
  };
  return colorMap[category];
};

const NewTestamentScreen: React.FC<NewTestamentScreenProps> = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BookCategory | 'Todo'>('Todo');
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =====================================================
  // ✅ CONECTADO A API - Cargar libros del Nuevo Testamento
  // =====================================================
  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const apiBooks = await bibleService.getNewTestamentBooks();

      // Transformar los libros de la API al formato local
      const transformedBooks: Book[] = apiBooks.map((apiBook: ApiBook) => ({
        id: apiBook.id,
        abbreviation: apiBook.abbreviation,
        name: apiBook.name,
        chapters: apiBook.totalChapters,
        category: mapCategory(apiBook.category),
        enabled: true, // Todos los libros están habilitados
        color: getCategoryColor(mapCategory(apiBook.category)),
      }));

      setBooks(transformedBooks);
    } catch (err: any) {
      console.error('Error cargando libros:', err);
      setError('No se pudieron cargar los libros. Verifica tu conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['Todo', 'Evangelios', 'Historia', 'Cartas', 'Profetico'];

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
      testament: 'new',
    });
  };

  const getCategoryTitle = (category: BookCategory): string => {
    const titles: Record<BookCategory, string> = {
      Evangelios: 'Los Evangelios',
      Historia: 'Historia',
      Cartas: 'Cartas de San Pablo',
      Profetico: 'Profético',
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
          <MaterialIcons name="error-outline" size={48} color={colors.burgundy.DEFAULT} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadBooks}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
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
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: `${colors.cream}F2`,
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
});

export default NewTestamentScreen;

