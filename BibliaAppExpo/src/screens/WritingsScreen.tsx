import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {useFocusEffect} from '@react-navigation/native';
import {colors} from '../theme/colors';
import {WritingsScreenProps} from '../navigation/AppNavigator';
import {writingsService, Writing} from '../services/writings.service';

const WritingsScreen: React.FC<WritingsScreenProps> = ({navigation}) => {
  const [activeFilter, setActiveFilter] = useState<'recent' | 'oldest' | 'title'>('recent');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [writings, setWritings] = useState<Writing[]>([]);

  // =====================================================
  // ✅ CONECTADO A API - Cargar escritos
  // =====================================================
  const loadWritings = async (showLoader = true) => {
    try {
      if (showLoader) setIsLoading(true);
      setError(null);

      const response = await writingsService.getWritings({
        sortBy: activeFilter,
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

  // Cargar al cambiar filtro
  useEffect(() => {
    loadWritings();
  }, [activeFilter]);

  // Recargar al volver a la pantalla
  useFocusEffect(
    useCallback(() => {
      loadWritings(false);
    }, [activeFilter])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    loadWritings(false);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // =====================================================
  // 🔴 MOCKEADO - Búsqueda de escritos (pendiente UI)
  // =====================================================
  const handleSearch = () => {
    Alert.alert(
      '🔍 Búsqueda',
      'Funcionalidad en desarrollo.\n\nPróximamente podrás buscar entre tus escritos.',
      [{text: 'Entendido'}]
    );
  };

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

        {/* Contenido de la reflexión */}
        <Text style={styles.contentText} numberOfLines={2}>
          {item.content}
        </Text>
      </View>

      {/* Footer con botón Ver */}
      <View style={styles.cardFooter}>
        <View style={styles.viewButton}>
          <MaterialIcons name="visibility" size={18} color={colors.primary.DEFAULT} />
          <Text style={styles.viewButtonText}>Ver Escrito y Versículo</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Estado de carga
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        <Text style={styles.loadingText}>Cargando escritos...</Text>
      </View>
    );
  }

  // Estado de error
  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <MaterialIcons name="error-outline" size={48} color={colors.burgundy.DEFAULT} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadWritings()}>
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Sticky */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.7}
          style={styles.headerButton}>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Escritos Personales</Text>
        <TouchableOpacity
          onPress={handleSearch}
          activeOpacity={0.7}
          style={styles.headerButton}>
          <MaterialIcons name="search" size={24} color={colors.primary.DEFAULT} />
        </TouchableOpacity>
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
            activeFilter === 'recent' && styles.filterChipActive,
          ]}
          onPress={() => setActiveFilter('recent')}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.filterText,
              activeFilter === 'recent' && styles.filterTextActive,
            ]}>
            Más recientes
          </Text>
          <MaterialIcons
            name="expand-more"
            size={18}
            color={activeFilter === 'recent' ? '#FFFFFF' : colors.ink.light}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            activeFilter === 'oldest' && styles.filterChipActive,
          ]}
          onPress={() => setActiveFilter('oldest')}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.filterText,
              activeFilter === 'oldest' && styles.filterTextActive,
            ]}>
            Más antiguos
          </Text>
          <MaterialIcons
            name="expand-more"
            size={18}
            color={activeFilter === 'oldest' ? '#FFFFFF' : colors.ink.light}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            activeFilter === 'title' && styles.filterChipActive,
          ]}
          onPress={() => setActiveFilter('title')}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.filterText,
              activeFilter === 'title' && styles.filterTextActive,
            ]}>
            Por título
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Empty State */}
      {writings.length === 0 && (
        <View style={styles.emptyState}>
          <MaterialIcons name="edit-note" size={64} color={colors.charcoal.muted} />
          <Text style={styles.emptyTitle}>Sin escritos aún</Text>
          <Text style={styles.emptySubtitle}>
            Tus reflexiones y notas de la Biblia aparecerán aquí
          </Text>
        </View>
      )}

      {/* Writings List */}
      <FlatList
        data={writings}
        renderItem={renderWritingCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary.DEFAULT]}
            tintColor={colors.primary.DEFAULT}
          />
        }
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },

  // Loading & Error states
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.charcoal.muted,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.burgundy.DEFAULT,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: colors.charcoal.DEFAULT,
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: colors.charcoal.muted,
    textAlign: 'center',
  },

  // Verse Reference in cards
  verseReference: {
    marginTop: 4,
    fontSize: 12,
    color: colors.primary.DEFAULT,
    fontWeight: '500',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
    backgroundColor: `${colors.cream}F2`,
    borderBottomWidth: 1,
    borderBottomColor: colors.ivory.border,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.charcoal.dark,
    flex: 1,
    textAlign: 'center',
  },

  // Filters
  filtersContainer: {
    maxHeight: 80,
  },
  filtersContent: {
    paddingHorizontal: 16,
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
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // List
  listContent: {
    padding: 16,
    paddingBottom: 20,
    gap: 16,
  },

  // Writing Card (basado en HTML)
  writingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.ivory.border,
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  cardContent: {
    // Contenedor del contenido principal
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  verseTitle: {
    fontSize: 18,
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
  contentText: {
    fontSize: 14,
    lineHeight: 22,
    color: `${colors.charcoal.DEFAULT}CC`,
    marginBottom: 0,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.ivory.border,
    paddingTop: 12,
    marginTop: 16,
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

});

export default WritingsScreen;

