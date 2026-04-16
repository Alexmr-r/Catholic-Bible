import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {ThemeColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';
import {BookChaptersScreenProps} from '../navigation/AppNavigator';
import {bibleService, Book} from '../services/bible.service';
import {useOfflineBible} from '../hooks/useOfflineBible';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_PADDING = 16;
const GAP = 12;
const COLUMNS = 5;
const BUTTON_SIZE = (SCREEN_WIDTH - (HORIZONTAL_PADDING * 2) - (GAP * (COLUMNS - 1))) / COLUMNS;

const BookChaptersScreen: React.FC<BookChaptersScreenProps> = ({navigation, route}) => {
  const { bookId, bookName, totalChapters, testament } = route.params;

  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { isOnline, isBibleDownloaded } = useOfflineBible();
  const styles = React.useMemo(() => getStyles(colors, isDarkMode, insets.top), [colors, isDarkMode, insets.top]);

  const [bookInfo, setBookInfo] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBookInfo();
  }, []);

  const loadBookInfo = async () => {
    try {
      setIsLoading(true);
      if (isOnline) {
        try {
          const book = await bibleService.getBook(bookId);
          setBookInfo(book);
        } catch (apiError) {
          console.warn('[BookChapters] Error API, usando info básica:', apiError);
          // Fallback a info básica si ya tenemos capítulos por props
          setBookInfo({
            id: bookId,
            name: bookName,
            abbreviation: bookName.substring(0, 3),
            testament: testament as any,
            category: 'PENTATEUCH',
            totalChapters: totalChapters,
            description: '',
          });
        }
      } else {
        // Modo offline
        setBookInfo({
          id: bookId,
          name: bookName,
          abbreviation: bookName.substring(0, 3),
          testament: testament as any,
          category: 'PENTATEUCH',
          totalChapters: totalChapters,
          description: '',
        });
      }
    } catch (err) {
      console.error('Error cargando info del libro:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChapterPress = (chapter: number) => {
    navigation.navigate('ChapterReading', {
      bookId,
      bookName,
      chapter,
      testament, // Añadir testament para el historial
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleInfo = () => {
    // TODO: Mostrar modal con info del libro
  };

  const getCategoryName = (category: string): string => {
    const categoryMap: Record<string, string> = {
      'PENTATEUCH': 'Pentateuch',
      'HISTORICAL': 'Historical Books',
      'WISDOM': 'Wisdom Books',
      'PROPHETS': 'Prophets',
      'MAJOR_PROPHETS': 'Major Prophets',
      'MINOR_PROPHETS': 'Minor Prophets',
      'GOSPELS': 'Gospels',
      'ACTS': 'History',
      'PAULINE_EPISTLES': 'Pauline Epistles',
      'CATHOLIC_EPISTLES': 'Catholic Epistles',
      'REVELATION': 'Revelation',
    };
    return categoryMap[category] || category;
  };

  const renderChapterButton = (chapter: number, index: number) => {
    const isLastInRow = (index + 1) % COLUMNS === 0;
    const isLastRow = index >= totalChapters - COLUMNS;

    return (
      <TouchableOpacity
        key={chapter}
        style={[
          styles.chapterButton,
          !isLastInRow && {marginRight: GAP},
          !isLastRow && {marginBottom: GAP},
        ]}
        onPress={() => handleChapterPress(chapter)}
        activeOpacity={0.7}>
        <Text style={styles.chapterText}>{chapter}</Text>
      </TouchableOpacity>
    );
  };

  const chapters = Array.from({length: totalChapters}, (_, i) => i + 1);

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
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{bookName}</Text>
          <Text style={styles.headerSubtitle}>
            {testament === 'old' ? 'OLD TESTAMENT' : 'NEW TESTAMENT'}
          </Text>
        </View>
        <View style={styles.infoButton} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>

          {/* Info Card */}
          <View style={styles.infoCard}>
            {bookInfo?.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>
                  {getCategoryName(bookInfo.category)}
                </Text>
              </View>
            )}
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>{bookName}</Text>
              {bookInfo?.description && (
                <Text style={styles.infoDescription}>{bookInfo.description}</Text>
              )}
            </View>
            <View style={styles.infoIconContainer}>
              <MaterialIcons
                name="menu-book"
                size={140}
                color={isDarkMode ? colors.charcoal.muted : colors.charcoal.DEFAULT}
                style={styles.infoIcon}
              />
            </View>
          </View>

          {/* Chapters Header */}
          <View style={styles.chaptersHeader}>
            <Text style={styles.chaptersTitle}>Chapters</Text>
            <Text style={styles.chaptersCount}>{totalChapters} Chapters</Text>
          </View>

          {/* Chapters Grid */}
          <View style={styles.chaptersGrid}>
            {chapters.map((chapter, index) => renderChapterButton(chapter, index))}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.charcoal.dark,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.charcoal.muted,
    letterSpacing: 1,
    marginTop: 2,
  },
  infoButton: {
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
    padding: HORIZONTAL_PADDING,
  },

  // Info Card
  infoCard: {
    backgroundColor: isDarkMode ? colors.paper : colors.ivory.DEFAULT,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.ivory.border,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${colors.burgundy.DEFAULT}15`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.burgundy.DEFAULT,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoContent: {
    flex: 1,
    zIndex: 1,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.charcoal.dark,
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.charcoal.muted,
    maxWidth: '70%',
  },
  infoIconContainer: {
    position: 'absolute',
    right: -20,
    bottom: -30,
    opacity: 0.08,
  },
  infoIcon: {
    transform: [{rotate: '-15deg'}],
  },

  // Chapters Header
  chaptersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chaptersTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.charcoal.dark,
  },
  chaptersCount: {
    fontSize: 14,
    color: colors.charcoal.muted,
  },

  // Chapters Grid
  chaptersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chapterButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    backgroundColor: isDarkMode ? colors.paper : '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.ivory.border,
  },
  chapterText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.charcoal.dark,
  },

  bottomSpacer: {
    height: 40,
  },
});

export default BookChaptersScreen;

