import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Keyboard,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ThemeColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';
import {WritingsScreenProps} from '../navigation/AppNavigator';
import {writingsService, Writing} from '../services/writings.service';

// Listas de libros para filtrado
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

const WritingsScreen: React.FC<WritingsScreenProps> = ({navigation}) => {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => getStyles(colors, isDarkMode, insets.top), [colors, isDarkMode, insets.top]);

  // Estado de filtro actualizado: todos, antiguo, nuevo (como en Favoritos)
  const [activeFilter, setActiveFilter] = useState<'todos' | 'antiguo' | 'nuevo'>('todos');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [writings, setWritings] = useState<Writing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // =====================================================
  // ✅ CONECTADO A API - Cargar escritos
  // =====================================================
  const loadWritings = async (showLoader = true) => {
    try {
      if (showLoader) setIsLoading(true);
      setError(null);

      // Cargar todos los escritos (ordenados por recientes) y filtrar en cliente
      // para evitar lógica compleja en backend por ahora
      const response = await writingsService.getWritings({
        sortBy: 'recent',
      });
      setWritings(response.writings);
    } catch (err: any) {
      console.error('Error cargando escritos:', err);
      setError('No se pudieron cargar los escritos.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Cargar al iniciar
  useEffect(() => {
    loadWritings();
  }, []);

  // Recargar al volver a la pantalla
  useFocusEffect(
    useCallback(() => {
      loadWritings(false);
    }, [])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    loadWritings(false);
  };

  // =====================================================
  // ✅ FILTRADO Y BÚSQUEDA INTELIGENTE
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

  const filteredWritings = writings.filter(writing => {
    // 1. Filtrar por testamento (Tab)
    if (activeFilter === 'antiguo') {
      if (!writing.bookId || !oldTestamentIds.includes(writing.bookId.toLowerCase())) return false;
    } else if (activeFilter === 'nuevo') {
      if (!writing.bookId || !newTestamentIds.includes(writing.bookId.toLowerCase())) return false;
    }

    // 2. Filtrar por búsqueda inteligente
    if (!searchQuery.trim()) return true;

    // Dividir la búsqueda en palabras individuales
    const queryWords = normalize(searchQuery).split(/\s+/).filter(w => w.length > 0);

    // Campos en los que buscar
    const searchableFields = [
      normalize(writing.title),
      normalize(writing.content),
      ...(writing.tags || []).map(t => normalize(t)),
      normalize(writing.bookName || ''),
      writing.chapter?.toString() || '',
      writing.verse?.toString() || '',
      writing.bookId?.toLowerCase() || '',
    ];

    // Añadir nombres en español del libro
    const bookIdLower = writing.bookId?.toLowerCase() || '';
    const spanishNames = Object.entries(bookNameMap)
      .filter(([, ids]) => ids.includes(bookIdLower))
      .map(([name]) => name);
    searchableFields.push(...spanishNames);

    // Crear un solo string de todos los campos
    const allText = searchableFields.join(' ');

    // TODAS las palabras de la búsqueda deben coincidir
    return queryWords.every(word => allText.includes(word));
  });

  // =====================================================
  // ✅ CONECTADO A API - Ver detalle/Editar escrito
  // =====================================================
  const handleViewWriting = (writing: Writing) => {
    navigation.navigate('WritingDetail', {
      writingId: writing.id,
      title: writing.title,
      content: writing.content,
      bookId: writing.bookId,
      bookName: writing.bookName,
      chapter: writing.chapter,
      verse: writing.verse,
      tags: writing.tags,
      createdAt: writing.createdAt,
      isFavorite: writing.isFavorite,
    } as any);
  };

  const renderWritingCard = ({item}: {item: Writing}) => (
    <TouchableOpacity
      style={styles.writingCard}
      onPress={() => handleViewWriting(item)}
      activeOpacity={0.7}>
      {/* Contenido principal */}
      <View style={styles.cardContent}>
        {/* Header con título y fecha */}
        <View style={styles.cardHeader}>
          <Text style={styles.verseTitle}>
            {item.bookName && item.chapter && item.verse
              ? `${item.bookName} ${item.chapter}:${item.verse}`
              : item.title}
          </Text>
          <View style={styles.dateChip}>
            <Text style={styles.dateText}>
              {new Date(item.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
            </Text>
          </View>
        </View>

        {/* Reflexión con barra a la izquierda (título + contenido) */}
        <View style={styles.textContainer}>
          <View style={styles.quoteLine} />
          <View style={styles.reflexionContent}>
            {/* Título del escrito - solo si existe y es diferente al versículo */}
            {item.title && !(item.bookName && item.chapter && item.verse && item.title === `${item.bookName} ${item.chapter}:${item.verse}`) && (
              <Text style={styles.writingTitle} numberOfLines={1}>
                {item.title}
              </Text>
            )}
            {/* Contenido de la reflexión */}
            <Text style={styles.contentText} numberOfLines={2}>
              {item.content}
            </Text>
          </View>
        </View>

        {/* Footer con botón Ver */}
        <View style={styles.cardFooter}>
          <View style={styles.viewButton}>
            <MaterialIcons name="visibility" size={18} color={colors.primary.DEFAULT} />
            <Text style={styles.viewButtonText}>Ver Escrito y Versículo</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container} onStartShouldSetResponder={() => { Keyboard.dismiss(); return false; }}>
      {/* Header Sticky */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Escritos Personales</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar - Estilo igual a Favoritos */}
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
            placeholder="Buscar en tus escritos..."
            placeholderTextColor={`${colors.charcoal.muted}80`}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filters - Estilo igual a Favoritos */}
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

      {/* Estado de carga */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.burgundy.DEFAULT} />
          <Text style={styles.loadingText}>Cargando escritos...</Text>
        </View>
      )}

      {/* Estado de error */}
      {error && !isLoading && (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={colors.burgundy.DEFAULT} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadWritings()}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Writings List */}
      {!isLoading && !error && (
        <FlatList
          data={filteredWritings}
          renderItem={renderWritingCard}
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
              <MaterialIcons name={searchQuery ? "search-off" : "edit-note"} size={48} color={colors.charcoal.muted} />
              <Text style={styles.emptyText}>
                {searchQuery.trim()
                  ? `No se encontraron resultados para "${searchQuery}"`
                  : activeFilter !== 'todos' 
                    ? 'No tienes escritos en esta sección'
                    : 'Aún no tienes escritos personales'}
              </Text>
              {!searchQuery && activeFilter === 'todos' && (
                <Text style={styles.emptySubtitle}>
                  Tus reflexiones aparecerán aquí
                </Text>
              )}
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
    marginTop: 40,
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
    marginTop: 40,
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
    width: 40,
    height: 36,
  },

  // Search Bar (IGUAL A FAVORITOS)
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

  // Filters (IGUAL A FAVORITOS)
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
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  filterText: {
    fontSize: 15,
    fontWeight: '600',
    color: isDarkMode ? colors.charcoal.DEFAULT : colors.charcoal.muted,
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

  // Writing Card
  writingCard: {
    backgroundColor: isDarkMode ? colors.paper : '#FFFFFF',
    borderRadius: 16, // Igual a Favoritos (antes era 12)
    padding: 20,
    borderWidth: 1,
    borderColor: colors.ivory.border,
    shadowColor: '#000', // Sombra más sutil como en Favoritos
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    // Contenedor del contenido principal
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  verseTitle: {
    fontSize: 16, // Igual a Favoritos
    fontWeight: '700',
    color: colors.burgundy.accent,
    flex: 1,
    marginRight: 8,
  },
  dateChip: {
    backgroundColor: `${colors.charcoal.muted}08`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.ivory.border,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.charcoal.muted,
  },
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
  reflexionContent: {
    flex: 1,
  },
  writingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.charcoal.DEFAULT,
    marginBottom: 8,
  },
  contentText: {
    fontSize: 18, // Igual a Favoritos (verseText es 18)
    lineHeight: 28,
    color: colors.charcoal.DEFAULT,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.ivory.border,
    paddingTop: 12,
    marginTop: 8,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary.DEFAULT,
  },

  // Empty State (Ajustado para que parezca al de Favoritos)
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
  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: colors.charcoal.muted,
    textAlign: 'center',
  },
});

export default WritingsScreen;

