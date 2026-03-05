import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Keyboard,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {ThemeColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';
import {FavoritesScreenProps, RootStackParamList} from '../navigation/AppNavigator';
import {favoritesService, Favorite as ApiFavorite} from '../services/favorites.service';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

// Listas de libros para filtrado client-side (igual que WritingsScreen)
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

const newTestamentIds = [
  'matthew', 'mark', 'luke', 'john', 'acts',
  'romans', '1corinthians', '2corinthians', 'galatians', 'ephesians',
  'philippians', 'colossians', '1thessalonians', '2thessalonians',
  '1timothy', '2timothy', 'titus', 'philemon', 'hebrews',
  'james', '1peter', '2peter', '1john', '2john', '3john', 'jude', 'revelation'
];

type Favorite = {
  id: string;
  verse: string;
  date: string;
  text: string;
  tags: string[];
  bookId: string;
  chapter: number;
  verseNumber: number;
  verseEnd?: number; // Versículo final si es un rango
};

const FavoritesScreen: React.FC<FavoritesScreenProps> = () => {
  // Usar el navigation del RootStack para poder navegar a ChapterReading
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { colors, isDarkMode, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => getStyles(colors, isDarkMode, insets.top), [colors, isDarkMode, insets.top]);

  const [activeFilter, setActiveFilter] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selection state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // =====================================================
  // ✅ CONECTADO A API - Cargar favoritos
  // =====================================================
  const loadFavorites = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      // Cargar TODOS los favoritos y filtrar client-side (igual que WritingsScreen)
      const response = await favoritesService.getFavorites();

      // Transformar al formato local
      const transformedFavorites: Favorite[] = response.favorites.map((fav: ApiFavorite) => {
        // Extraer verseEnd del tag "Versículos X-Y" si existe
        let verseEnd: number | undefined;
        const rangeTag = fav.tags?.find(tag => tag.startsWith('Versículos '));
        if (rangeTag) {
          const range = rangeTag.replace('Versículos ', '');
          const parts = range.split('-');
          if (parts.length === 2) {
            verseEnd = parseInt(parts[1], 10);
          }
        }
        // Si es "Capítulo completo", marcar con un número muy alto para cargar todo
        const isFullChapter = fav.tags?.includes('Capítulo completo');

        return {
          id: fav.id,
          verse: fav.reference,
          date: new Date(fav.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
          text: fav.verseText,
          tags: fav.tags || [],
          bookId: fav.bookId,
          chapter: fav.chapterNumber,
          verseNumber: fav.verseNumber,
          verseEnd: isFullChapter ? 999 : verseEnd, // 999 = cargar todo el capítulo
        };
      });

      setFavorites(transformedFavorites);
    } catch (err: any) {
      console.error('Error cargando favoritos:', err);
      setError('No se pudieron cargar los favoritos.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Cargar al iniciar
  useEffect(() => {
    loadFavorites();
  }, []);

  // Recargar cuando la pantalla obtiene foco
  useFocusEffect(
    useCallback(() => {
      loadFavorites(false);
    }, [])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    loadFavorites(false);
  };

  // =====================================================
  // ✅ BÚSQUEDA INTELIGENTE - Filtra en tiempo real
  // =====================================================

  // Normalizar texto: quitar acentos y convertir a minúsculas
  const normalize = (text: string) =>
    text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Mapa de nombres de libros en español → bookId en inglés
  const bookNameMap: Record<string, string[]> = {
    genesis: ['genesis'], exodo: ['exodus'], levitico: ['leviticus'],
    numeros: ['numbers'], deuteronomio: ['deuteronomy'], josue: ['joshua'],
    jueces: ['judges'], rut: ['ruth'], samuel: ['1samuel', '2samuel'],
    reyes: ['1kings', '2kings'], cronicas: ['1chronicles', '2chronicles'],
    esdras: ['ezra'], nehemias: ['nehemiah'], tobias: ['tobit'],
    judit: ['judith'], ester: ['esther'], macabeos: ['1maccabees', '2maccabees'],
    job: ['job'], salmo: ['psalms'], salmos: ['psalms'],
    proverbios: ['proverbs'], eclesiastes: ['ecclesiastes'],
    cantar: ['songofsolomon'], cantares: ['songofsolomon'],
    sabiduria: ['wisdom'], siracida: ['sirach'], siracides: ['sirach'],
    isaias: ['isaiah'], jeremias: ['jeremiah'], lamentaciones: ['lamentations'],
    baruc: ['baruch'], ezequiel: ['ezekiel'], daniel: ['daniel'],
    oseas: ['hosea'], joel: ['joel'], amos: ['amos'], abdias: ['obadiah'],
    jonas: ['jonah'], miqueas: ['micah'], nahum: ['nahum'],
    habacuc: ['habakkuk'], sofonias: ['zephaniah'], ageo: ['haggai'],
    zacarias: ['zechariah'], malaquias: ['malachi'],
    mateo: ['matthew'], marcos: ['mark'], lucas: ['luke'], juan: ['john'],
    hechos: ['acts'], romanos: ['romans'],
    corintios: ['1corinthians', '2corinthians'],
    galatas: ['galatians'], efesios: ['ephesians'],
    filipenses: ['philippians'], colosenses: ['colossians'],
    tesalonicenses: ['1thessalonians', '2thessalonians'],
    timoteo: ['1timothy', '2timothy'], tito: ['titus'],
    filemon: ['philemon'], hebreos: ['hebrews'],
    santiago: ['james'], pedro: ['1peter', '2peter'],
    judas: ['jude'], apocalipsis: ['revelation'],
  };

  const filteredFavorites = favorites.filter((favorite) => {
    // 1. Filtrar por testamento (client-side)
    if (activeFilter === 'antiguo') {
      if (!favorite.bookId || !oldTestamentIds.includes(favorite.bookId.toLowerCase())) return false;
    } else if (activeFilter === 'nuevo') {
      if (!favorite.bookId || !newTestamentIds.includes(favorite.bookId.toLowerCase())) return false;
    }

    // 2. Filtrar por búsqueda inteligente
    if (searchQuery.trim() === '') return true;

    // Dividir la búsqueda en palabras individuales
    const queryWords = normalize(searchQuery).split(/\s+/).filter(w => w.length > 0);

    // Campos en los que buscar
    const searchableFields = [
      normalize(favorite.verse),
      normalize(favorite.text),
      ...favorite.tags.map(t => normalize(t)),
      favorite.chapter.toString(),
      favorite.bookId?.toLowerCase() || '',
    ];

    // Verificar si el bookId coincide con algún nombre en español
    const bookIdLower = favorite.bookId?.toLowerCase() || '';
    const spanishNames = Object.entries(bookNameMap)
      .filter(([, ids]) => ids.includes(bookIdLower))
      .map(([name]) => name);
    searchableFields.push(...spanishNames);

    // Crear un solo string de todos los campos para buscar
    const allText = searchableFields.join(' ');

    // TODAS las palabras de la búsqueda deben coincidir en algún campo
    return queryWords.every(word => allText.includes(word));
  });

  // =====================================================
  // ✅ SELECCIÓN MÚLTIPLE
  // =====================================================
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    if (newSelected.size === 0) setIsSelectionMode(false);
  };

  const startSelectionMode = (id: string) => {
    setIsSelectionMode(true);
    setSelectedIds(new Set([id]));
  };

  const handleFavoritePress = (favorite: Favorite) => {
    if (isSelectionMode) {
      toggleSelection(favorite.id);
    } else {
      handleViewFavorite(favorite);
    }
  };

  const handleLongPress = (id: string) => {
    if (!isSelectionMode) {
      startSelectionMode(id);
    } else {
      toggleSelection(id);
    }
  };

  const cancelSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    Alert.alert(
      'Eliminar favoritos',
      `¿Eliminar ${selectedIds.size} ${selectedIds.size === 1 ? 'favorito' : 'favoritos'}?`,
      [
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              for (const id of selectedIds) {
                await favoritesService.removeFavorite(id);
              }
              cancelSelectionMode();
              loadFavorites(false);
            } catch (err) {
              Alert.alert('Error', 'No se pudieron eliminar los favoritos');
            }
          },
        },
        {text: 'Cancelar', style: 'cancel'},
      ]
    );
  };

  // =====================================================
  // ✅ NAVEGACIÓN - Ver favorito (solo versículos guardados)
  // =====================================================
  const handleViewFavorite = (favorite: Favorite) => {
    // Si verseEnd es 999, significa "capítulo completo" - mostrar todo pero sin navegación
    const isFullChapter = favorite.verseEnd === 999;

    navigation.navigate('ChapterReading', {
      bookId: favorite.bookId,
      bookName: favorite.verse.split(' ')[0],
      chapter: favorite.chapter,
      // Siempre indicar que viene de favoritos (para ocultar navegación)
      fromFavorite: true,
      // Si es capítulo completo, no filtrar versículos (undefined)
      // Si no, pasar el rango para filtrar
      favoriteVerseNumber: isFullChapter ? undefined : favorite.verseNumber,
      favoriteVerseEnd: isFullChapter ? undefined : (favorite.verseEnd || favorite.verseNumber),
    });
  };

  const renderFavoriteCard = ({item}: {item: Favorite}) => {
    const isSelected = selectedIds.has(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.favoriteCard,
          isSelected && {
            borderColor: colors.primary.DEFAULT,
            backgroundColor: isDarkMode ? `${colors.primary.DEFAULT}1A` : `${colors.primary.DEFAULT}0D`,
          }
        ]}
        onPress={() => handleFavoritePress(item)}
        onLongPress={() => handleLongPress(item.id)}
        activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <View style={styles.verseInfo}>
            <Text style={styles.verseTitle}>{item.verse}</Text>
            <View style={styles.dot} />
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
          {isSelectionMode && (
            <MaterialIcons
              name={isSelected ? "check-circle" : "radio-button-unchecked"}
              size={24}
              color={isSelected ? colors.primary.DEFAULT : colors.charcoal.muted}
            />
          )}
        </View>

        <View style={styles.textContainer}>
          <View style={styles.quoteLine} />
          <Text style={styles.verseText}>{item.text}</Text>
        </View>

        {item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container} onStartShouldSetResponder={() => { Keyboard.dismiss(); return false; }}>
      {/* Header Sticky */}
      <View style={styles.header}>
        {isSelectionMode ? (
          <>
            <TouchableOpacity onPress={cancelSelectionMode} style={styles.headerAction}>
              <Text style={styles.headerActionText}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{selectedIds.size} seleccionados</Text>
            <TouchableOpacity onPress={handleDeleteSelected} style={styles.headerActionRight}>
              <MaterialIcons name="delete" size={24} color={colors.burgundy.DEFAULT} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.headerSpacer} />
            <Text style={styles.headerTitle}>Favoritos</Text>
            <View style={styles.headerSpacer} />
          </>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons
            name="search"
            size={20}
            color={colors.charcoal.muted}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar en tus favoritos..."
            placeholderTextColor={`${colors.charcoal.muted}80`}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            activeFilter === 'todos' && styles.filterChipActive,
          ]}
          onPress={() => setActiveFilter('todos')}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.filterText,
              activeFilter === 'todos' && styles.filterTextActive,
            ]}>
            Todos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            activeFilter === 'antiguo' && styles.filterChipActive,
          ]}
          onPress={() => setActiveFilter('antiguo')}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.filterText,
              activeFilter === 'antiguo' && styles.filterTextActive,
            ]}>
            Antiguo Testamento
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            activeFilter === 'nuevo' && styles.filterChipActive,
          ]}
          onPress={() => setActiveFilter('nuevo')}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.filterText,
              activeFilter === 'nuevo' && styles.filterTextActive,
            ]}>
            Nuevo Testamento
          </Text>
        </TouchableOpacity>
      </ScrollView>


      {/* Estado de carga inicial */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.burgundy.DEFAULT} />
          <Text style={styles.loadingText}>Cargando favoritos...</Text>
        </View>
      )}

      {/* Estado de error */}
      {error && !isLoading && (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={colors.burgundy.DEFAULT} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadFavorites()}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Favorites List */}
      {!isLoading && !error && (
        <FlatList
          data={filteredFavorites}
          renderItem={renderFavoriteCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, {flexGrow: 1}]}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.burgundy.DEFAULT}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="favorite-border" size={48} color={colors.charcoal.muted} />
              <Text style={styles.emptyText}>
                {searchQuery.trim()
                  ? `No se encontraron resultados para "${searchQuery}"`
                  : 'No tienes favoritos en esta categoría'}
              </Text>
            </View>
          }
        />
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
    paddingHorizontal: 20,
    paddingTop: Math.max(safeTop, 20) + 16,
    paddingBottom: 16,
    backgroundColor: isDarkMode ? colors.background.dark : colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: colors.ivory.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.charcoal.dark,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 60,
    height: 36,
  },
  headerAction: {
    width: 80,
    justifyContent: 'center',
  },
  headerActionRight: {
    width: 80,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerActionText: {
    fontSize: 16,
    color: colors.primary.DEFAULT,
    fontWeight: '500',
  },

  // Search
  searchContainer: {
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
    height: 44,
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
    height: '100%',
    fontSize: 16,
    color: colors.charcoal.DEFAULT,
    paddingVertical: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  // Filters
  filtersContainer: {
    paddingVertical: 8,
    flexGrow: 0,
    minHeight: 60,
  },
  filtersContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
    alignItems: 'flex-start',
  },
  filterChip: {
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
  filterChipActive: {
    backgroundColor: isDarkMode ? colors.primary.DEFAULT : colors.primary.DEFAULT,
    borderColor: isDarkMode ? colors.primary.DEFAULT : colors.primary.DEFAULT,
  },
  filterText: {
    fontSize: 15,
    fontWeight: '600',
    color: isDarkMode ? colors.charcoal.DEFAULT : colors.charcoal.muted,
    flexShrink: 1,
    flexGrow: 0,
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },


  // List
  listContent: {
    padding: 20,
    paddingBottom: 20,
    gap: 16,
  },

  // Favorite Card
  favoriteCard: {
    backgroundColor: isDarkMode ? colors.paper : '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.ivory.border,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  verseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  verseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.burgundy.accent,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.charcoal.muted,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.charcoal.muted,
  },
  optionsButton: {
    padding: 4,
    marginRight: -8,
    marginTop: -8,
    borderRadius: 12,
  },

  // Text
  textContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  quoteLine: {
    width: 3,
    backgroundColor: `${colors.primary.DEFAULT}66`,
    borderRadius: 2,
  },
  verseText: {
    flex: 1,
    fontSize: 18,
    lineHeight: 28,
    color: colors.charcoal.DEFAULT,
  },

  // Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  tag: {
    backgroundColor: colors.primary.light,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.primary.DEFAULT,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    color: colors.charcoal.muted,
    lineHeight: 24,
  },
});

export default FavoritesScreen;

