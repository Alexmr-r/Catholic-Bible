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
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {colors} from '../theme/colors';
import {FavoritesScreenProps, RootStackParamList} from '../navigation/AppNavigator';
import {favoritesService, Favorite as ApiFavorite} from '../services/favorites.service';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

type Favorite = {
  id: string;
  verse: string;
  date: string;
  text: string;
  tags: string[];
  bookId: string;
  chapter: number;
  verseNumber: number;
};

const FavoritesScreen: React.FC<FavoritesScreenProps> = () => {
  // Usar el navigation del RootStack para poder navegar a ChapterReading
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [activeFilter, setActiveFilter] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =====================================================
  // ✅ CONECTADO A API - Cargar favoritos
  // =====================================================
  const loadFavorites = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      const testament = activeFilter === 'antiguo' ? 'old' :
                       activeFilter === 'nuevo' ? 'new' : undefined;

      const response = await favoritesService.getFavorites({ testament });

      // Transformar al formato local
      const transformedFavorites: Favorite[] = response.favorites.map((fav: ApiFavorite) => ({
        id: fav.id,
        verse: fav.reference, // El backend ya devuelve la referencia correcta
        date: new Date(fav.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        text: fav.verseText,
        tags: fav.tags || [],
        bookId: fav.bookId,
        chapter: fav.chapterNumber,
        verseNumber: fav.verseNumber,
      }));

      setFavorites(transformedFavorites);
    } catch (err: any) {
      console.error('Error cargando favoritos:', err);
      setError('No se pudieron cargar los favoritos.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Recargar al cambiar filtro
  useEffect(() => {
    loadFavorites();
  }, [activeFilter]);

  // Recargar cuando la pantalla obtiene foco
  useFocusEffect(
    useCallback(() => {
      loadFavorites(false);
    }, [activeFilter])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    loadFavorites(false);
  };

  // =====================================================
  // ✅ BÚSQUEDA LOCAL - Filtra en tiempo real
  // =====================================================
  const filteredFavorites = favorites.filter((favorite) => {
    if (searchQuery.trim() === '') return true;

    return favorite.verse.toLowerCase().includes(searchQuery.toLowerCase()) ||
      favorite.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      favorite.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  // =====================================================
  // 🔴 MOCKEADO - Editar favoritos
  // TODO: Implementar modo edición
  // =====================================================
  const handleEdit = () => {
    Alert.alert('En desarrollo', 'Modo edición próximamente');
  };

  // =====================================================
  // 🔴 MOCKEADO - Filtrar favoritos
  // TODO: Implementar filtros avanzados
  // =====================================================
  const handleFilter = () => {
    Alert.alert('En desarrollo', 'Filtros avanzados próximamente');
  };

  // =====================================================
  // ✅ CONECTADO A API - Eliminar favorito
  // =====================================================
  const handleFavoriteOptions = (id: string) => {
    Alert.alert(
      '⚙️ Opciones',
      '¿Qué quieres hacer con este versículo?',
      [
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await favoritesService.removeFavorite(id);
              Alert.alert('✓', 'Favorito eliminado');
              loadFavorites(false);
            } catch (err) {
              Alert.alert('Error', 'No se pudo eliminar el favorito');
            }
          },
        },
        {text: 'Cancelar', style: 'cancel'},
      ]
    );
  };

  // =====================================================
  // ✅ NAVEGACIÓN - Ver favorito en contexto
  // =====================================================
  const handleViewFavorite = (favorite: Favorite) => {
    navigation.navigate('ChapterReading', {
      bookId: favorite.bookId,
      bookName: favorite.verse.split(' ')[0],
      chapter: favorite.chapter,
    });
  };

  const renderFavoriteCard = ({item}: {item: Favorite}) => (
    <TouchableOpacity
      style={styles.favoriteCard}
      onPress={() => handleViewFavorite(item)}
      activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.verseInfo}>
          <Text style={styles.verseTitle}>{item.verse}</Text>
          <View style={styles.dot} />
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleFavoriteOptions(item.id)}
          style={styles.optionsButton}
          activeOpacity={0.7}>
          <MaterialIcons name="more-vert" size={20} color={colors.charcoal.muted} />
        </TouchableOpacity>
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

  return (
    <View style={styles.container}>
      {/* Header Sticky */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favoritos</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleEdit}
            style={styles.headerButton}
            activeOpacity={0.7}>
            <MaterialIcons name="edit" size={22} color={colors.charcoal.muted} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleFilter}
            style={styles.headerButton}
            activeOpacity={0.7}>
            <MaterialIcons name="filter-list" size={22} color={colors.charcoal.muted} />
          </TouchableOpacity>
        </View>
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

        <TouchableOpacity
          style={[
            styles.filterChip,
            activeFilter === 'salmos' && styles.filterChipActive,
          ]}
          onPress={() => setActiveFilter('salmos')}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.filterText,
              activeFilter === 'salmos' && styles.filterTextActive,
            ]}>
            Salmos
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
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: `${colors.cream}F2`,
    borderBottomWidth: 1,
    borderBottomColor: colors.ivory.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.charcoal.dark,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },

  // Search
  searchContainer: {
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

  // Filters
  filtersContainer: {
    paddingVertical: 8,
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
  filterChipActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  filterText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.charcoal.muted,
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
    backgroundColor: '#FFFFFF',
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

