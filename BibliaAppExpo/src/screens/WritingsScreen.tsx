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
  TouchableWithoutFeedback,
  Alert,
  Platform
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import OfflineBanner from '../components/OfflineBanner';
import {ThemeColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';
import {WritingsScreenProps} from '../navigation/AppNavigator';
import {writingsService, Writing} from '../services/writings.service';
import {useIsOnline} from '../contexts/NetworkContext';

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

const WritingsScreen: React.FC<WritingsScreenProps> = ({navigation}) => {
  const isOnline = useIsOnline();
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => getStyles(colors, isDarkMode, insets.top), [colors, isDarkMode, insets.top]);

  const [activeFilter, setActiveFilter] = useState<'todos' | 'antiguo' | 'nuevo'>('todos');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [writings, setWritings] = useState<Writing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isOfflineEmpty, setIsOfflineEmpty] = useState(false);

  const normalize = (text: string) =>
    text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const loadWritings = async (showLoader = true) => {
    try {
      if (showLoader) setIsLoading(true);
      setError(null);
      setIsOfflineEmpty(false);

      // 1. SIEMPRE intentar leer caché primero (instantáneo)
      const cachedData = await writingsService.loadFromCache();
      if (cachedData && cachedData.length > 0) {
        setWritings(cachedData);
        setIsLoading(false);
      }

      // 2. Solo intentar API si hay conexión
      if (isOnline) {
        try {
          const response = await writingsService.getWritings({ sortBy: 'recent' });
          setWritings(response.writings);
        } catch (apiErr) {
          // Si ya tenemos datos de caché, no mostrar error
          console.warn('[WritingsScreen] Error API, usando caché si hay:', apiErr);
        }
      } else {
        // Sin conexión y sin caché → mostrar mensaje amable
        if (!cachedData || cachedData.length === 0) {
          setIsOfflineEmpty(true);
        }
      }
    } catch (err: any) {
      console.error('Error cargando escritos:', err);
      setError('Error inesperado al cargar escritos.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { loadWritings(); }, []);
  useFocusEffect(useCallback(() => { loadWritings(false); }, []));

  // ✅ Auto-recargar cuando CAMBIE el estado de internet (subida o bajada)
  useEffect(() => {
    loadWritings(false);
  }, [isOnline]);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadWritings(false);
  };

  const filteredWritings = writings.filter(writing => {
    if (activeFilter === 'antiguo') {
      if (!writing.bookId || !oldTestamentIds.includes(writing.bookId.toLowerCase())) return false;
    } else if (activeFilter === 'nuevo') {
      if (!writing.bookId || !newTestamentIds.includes(writing.bookId.toLowerCase())) return false;
    }
    if (!searchQuery.trim()) return true;
    const queryWords = normalize(searchQuery).split(/\s+/).filter(w => w.length > 0);
    const searchableFields = [
      normalize(writing.title),
      normalize(writing.content),
      ...(writing.tags || []).map(t => normalize(t)),
      normalize(writing.bookName || ''),
      writing.chapter?.toString() || '',
      writing.verse?.toString() || '',
      writing.bookId?.toLowerCase() || '',
    ];
    const bookIdLower = writing.bookId?.toLowerCase() || '';
    const spanishNames = Object.entries(bookNameMap)
      .filter(([, ids]) => ids.includes(bookIdLower))
      .map(([name]) => name);
    searchableFields.push(...spanishNames);
    const allText = searchableFields.join(' ');
    return queryWords.every(word => allText.includes(word));
  });

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

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) { newSelected.delete(id); }
    else { newSelected.add(id); }
    setSelectedIds(newSelected);
    if (newSelected.size === 0) setIsSelectionMode(false);
  };

  const startSelectionMode = (id: string) => {
    setIsSelectionMode(true);
    setSelectedIds(new Set([id]));
  };

  const handleWritingPress = (writing: Writing) => {
    if (isSelectionMode) { toggleSelection(writing.id); }
    else { handleViewWriting(writing); }
  };

  const handleLongPress = (id: string) => {
    if (!isSelectionMode) { startSelectionMode(id); }
    else { toggleSelection(id); }
  };

  const cancelSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    Alert.alert('Delete writings', `Delete ${selectedIds.size} ${selectedIds.size === 1 ? 'writing' : 'writings'}?`, [
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          for (const id of selectedIds) { await writingsService.deleteWriting(id); }
          cancelSelectionMode();
          loadWritings(false);
        } catch (err) { Alert.alert('Error', 'Could not delete writings'); }
      }},
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  const renderWritingCard = ({item}: {item: Writing}) => {
    const isSelected = selectedIds.has(item.id);
    return (
      <TouchableOpacity
        style={[styles.writingCard, isSelected && { borderColor: colors.primary.DEFAULT, backgroundColor: isDarkMode ? `${colors.primary.DEFAULT}1A` : `${colors.primary.DEFAULT}0D` }]}
        onPress={() => handleWritingPress(item)}
        onLongPress={() => handleLongPress(item.id)}
        activeOpacity={0.7}>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.verseTitle} numberOfLines={1}>
              {item.bookName && item.chapter && item.verse ? `${item.bookName} ${item.chapter}:${item.verse}` : item.title}
            </Text>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
              <View style={styles.dateChip}><Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</Text></View>
              {isSelectionMode && <MaterialIcons name={isSelected ? "check-circle" : "radio-button-unchecked"} size={24} color={isSelected ? colors.primary.DEFAULT : colors.charcoal.muted} />}
            </View>
          </View>
          <View style={styles.textContainer}>
            <View style={styles.quoteLine} />
            <View style={styles.reflexionContent}>
              {item.title && !(item.bookName && item.chapter && item.verse && item.title === `${item.bookName} ${item.chapter}:${item.verse}`) && <Text style={styles.writingTitle} numberOfLines={1}>{item.title}</Text>}
              <Text style={styles.contentText} numberOfLines={2}>{item.content}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <OfflineBanner />
        <View style={styles.header}>
          {isSelectionMode ? (
            <>
              <TouchableOpacity onPress={cancelSelectionMode} style={styles.headerAction}><Text style={styles.headerActionText}>Cancel</Text></TouchableOpacity>
              <Text style={styles.headerTitle}>{selectedIds.size} selected</Text>
              <TouchableOpacity onPress={handleDeleteSelected} style={styles.headerActionRight}><MaterialIcons name="delete" size={24} color={colors.burgundy.DEFAULT} /></TouchableOpacity>
            </>
          ) : (
            <><View style={styles.headerSpacer} /><Text style={styles.headerTitle}>Personal Writings</Text><View style={styles.headerSpacer} /></>
          )}
        </View>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color={colors.charcoal.muted} style={styles.searchIcon} />
            <TextInput style={styles.searchInput} placeholder="Search your writings..." placeholderTextColor={`${colors.charcoal.muted}80`} value={searchQuery} onChangeText={setSearchQuery} returnKeyType="search" onSubmitEditing={Keyboard.dismiss} />
          </View>
        </View>
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
            {['todos', 'antiguo', 'nuevo'].map((f: any) => (
              <TouchableOpacity key={f} style={[styles.filterChip, activeFilter === f && styles.filterChipActive]} onPress={() => setActiveFilter(f)} activeOpacity={0.7}>
                <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f === 'todos' ? 'All' : f === 'antiguo' ? 'Old Testament' : 'New Testament'}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {isLoading ? (
          <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary.DEFAULT} /><Text style={styles.loadingText}>Loading writings...</Text></View>
        ) : !isOnline && writings.length === 0 ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="cloud-off" size={48} color={colors.charcoal.muted} />
            <Text style={styles.errorText}>
              No synced writings yet.{'\n'}They will appear here when you are online.
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color={colors.burgundy.DEFAULT} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => loadWritings()}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList data={filteredWritings} renderItem={renderWritingCard} keyExtractor={(item) => item.id} contentContainerStyle={[styles.listContent, {flexGrow: 1}]} showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary.DEFAULT} />} ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name={searchQuery ? "search-off" : "edit-note"} size={48} color={colors.charcoal.muted} />
              <Text style={styles.emptyText}>
                {searchQuery.trim() 
                  ? `No results found for "${searchQuery}"` 
                  : activeFilter !== 'todos' 
                    ? 'You have no writings in this section' 
                    : "You don't have any personal writings yet."}
              </Text>
            </View>
          } />
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const getStyles = (colors: ThemeColors, isDarkMode: boolean, safeTop: number) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDarkMode ? colors.background.dark : colors.cream },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: colors.charcoal.muted },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  errorText: { marginTop: 16, fontSize: 16, color: colors.charcoal.muted, textAlign: 'center' },
  retryButton: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: colors.burgundy.DEFAULT, borderRadius: 8 },
  retryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? Math.max(safeTop, 45) + 20 : Math.max(safeTop, 20) + 16, paddingBottom: 16, backgroundColor: isDarkMode ? colors.background.dark : colors.cream, borderBottomWidth: 1, borderBottomColor: colors.ivory.border },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.charcoal.dark, textAlign: 'center' },
  headerSpacer: { width: 60, height: 36 },
  headerAction: { width: 80, justifyContent: 'center' },
  headerActionRight: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },
  headerActionText: { fontSize: 16, color: colors.primary.DEFAULT, fontWeight: '500' },
  searchContainer: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: isDarkMode ? colors.background.dark : colors.cream },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: isDarkMode ? colors.ivory.shade : '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: colors.ivory.border, paddingHorizontal: 14, height: 44, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: '100%', fontSize: 16, color: colors.charcoal.DEFAULT, paddingVertical: 0, includeFontPadding: false, textAlignVertical: 'center' },
  filtersContainer: { paddingVertical: 8, flexGrow: 0, minHeight: 60 },
  filtersContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16, gap: 12, alignItems: 'flex-start' },
  filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, backgroundColor: isDarkMode ? colors.primary.light : '#FFFFFF', borderWidth: 1, borderColor: isDarkMode ? colors.primary.light : colors.ivory.border, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1, minHeight: 42 },
  filterChipActive: { backgroundColor: colors.primary.DEFAULT, borderColor: colors.primary.DEFAULT },
  filterText: { fontSize: 15, fontWeight: '600', color: isDarkMode ? colors.charcoal.DEFAULT : colors.charcoal.muted },
  filterTextActive: { color: '#FFFFFF', fontWeight: '700' },
  listContent: { padding: 20, paddingBottom: 20, gap: 16 },
  writingCard: { backgroundColor: isDarkMode ? colors.paper : '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.ivory.border, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardContent: {},
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 },
  verseTitle: { fontSize: 16, fontWeight: '700', color: colors.burgundy.accent, flex: 1, marginRight: 8 },
  dateChip: { backgroundColor: `${colors.charcoal.muted}08`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: colors.ivory.border },
  dateText: { fontSize: 12, fontWeight: '600', color: colors.charcoal.muted },
  textContainer: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  quoteLine: { width: 3, backgroundColor: `${colors.primary.DEFAULT}66`, borderRadius: 2 },
  reflexionContent: { flex: 1 },
  writingTitle: { fontSize: 16, fontWeight: '700', color: colors.charcoal.DEFAULT, marginBottom: 8 },
  contentText: { fontSize: 18, lineHeight: 28, color: colors.charcoal.DEFAULT },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyText: { marginTop: 16, fontSize: 16, textAlign: 'center', color: colors.charcoal.muted, lineHeight: 24 },
  emptySubtitle: { marginTop: 8, fontSize: 14, color: colors.charcoal.muted, textAlign: 'center' },
});

export default WritingsScreen;
