import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {colors} from '../theme/colors';
import {WritingsScreenProps} from '../navigation/AppNavigator';

type Writing = {
  id: string;
  verse: string;
  date: string;
  preview: string;
  icon: string;
  iconColor: string;
  iconBg: string;
};

const WritingsScreen: React.FC<WritingsScreenProps> = ({navigation}) => {
  const [activeFilter, setActiveFilter] = useState('recientes');
  const [isLoading, setIsLoading] = useState(false);

  // =====================================================
  // 🔴 MOCKEADO - Datos de ejemplo
  // TODO: Reemplazar con llamada a API
  // GET /api/writings?filter={activeFilter}
  // =====================================================
  const writings: Writing[] = [
    {
      id: '1',
      verse: 'Salmo 23:1',
      date: '12 Oct',
      preview: 'Hoy sentí mucha paz al leer esto. "El Señor es mi pastor, nada me falta". En medio de la ansiedad por el trabajo, esta promesa me tranquiliza...',
      icon: 'auto-stories',
      iconColor: colors.primary.DEFAULT,
      iconBg: `${colors.primary.DEFAULT}20`,
    },
    {
      id: '2',
      verse: 'Juan 3:16',
      date: '10 Oct',
      preview: 'El amor de Dios es inmenso. Debo recordar esto en momentos de duda. No hay sacrificio más grande que este...',
      icon: 'favorite',
      iconColor: colors.burgundy.accent,
      iconBg: `${colors.burgundy.accent}20`,
    },
    {
      id: '3',
      verse: 'Mateo 5:9',
      date: '05 Oct',
      preview: 'Bienaventurados los pacificadores. Una llamada a la acción en mi familia. Necesito ser el puente de paz en la discusión con mi hermano.',
      icon: 'handshake',
      iconColor: colors.gold.accent,
      iconBg: `${colors.gold.accent}20`,
    },
    {
      id: '4',
      verse: 'Proverbios 3:5',
      date: '01 Oct',
      preview: 'Confía en el Señor de todo corazón. A veces intento controlar todo, pero debo soltar y confiar en Su plan perfecto.',
      icon: 'shield',
      iconColor: colors.primary.DEFAULT,
      iconBg: `${colors.primary.DEFAULT}20`,
    },
  ];

  // =====================================================
  // TODO: Implementar carga de datos desde API
  // =====================================================
  // useEffect(() => {
  //   const loadWritings = async () => {
  //     setIsLoading(true);
  //     try {
  //       const response = await fetch(`/api/writings?filter=${activeFilter}`);
  //       const data = await response.json();
  //       setWritings(data);
  //     } catch (error) {
  //       console.error('Error loading writings:', error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   loadWritings();
  // }, [activeFilter]);

  const handleBack = () => {
    navigation.goBack();
  };

  // =====================================================
  // 🔴 MOCKEADO - Búsqueda de escritos
  // TODO: Implementar pantalla de búsqueda
  // navigation.navigate('WritingsSearch')
  // =====================================================
  const handleSearch = () => {
    Alert.alert(
      '🔍 Búsqueda',
      'Funcionalidad en desarrollo.\n\nPróximamente podrás buscar entre todos tus escritos por texto, versículo o fecha.',
      [{text: 'Entendido'}]
    );
  };

  // =====================================================
  // 🔴 MOCKEADO - Ver detalle de escrito
  // TODO: Navegar a pantalla de detalle con el ID del escrito
  // navigation.navigate('WritingDetail', { id })
  // =====================================================
  const handleViewWriting = (id: string) => {
    Alert.alert(
      '📖 Ver Detalle',
      `Funcionalidad en desarrollo.\n\nPróximamente verás el escrito completo y el versículo asociado.\n\nID del escrito: ${id}`,
      [{text: 'Entendido'}]
    );
  };

  const renderWritingCard = ({item}: {item: Writing}) => (
    <View style={styles.writingCard}>
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, {backgroundColor: item.iconBg}]}>
          <MaterialIcons name={item.icon as any} size={24} color={item.iconColor} />
        </View>
        <View style={styles.cardTextContainer}>
          <View style={styles.cardHeader}>
            <Text style={styles.verseTitle}>{item.verse}</Text>
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>{item.date}</Text>
            </View>
          </View>
          <Text style={styles.previewText} numberOfLines={2}>
            {item.preview}
          </Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => handleViewWriting(item.id)}
          activeOpacity={0.7}>
          <MaterialIcons name="visibility" size={18} color={colors.primary.DEFAULT} />
          <Text style={styles.viewButtonText}>Ver Escrito y Versículo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
            activeFilter === 'recientes' && styles.filterChipActive,
          ]}
          onPress={() => setActiveFilter('recientes')}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.filterText,
              activeFilter === 'recientes' && styles.filterTextActive,
            ]}>
            Más recientes
          </Text>
          <MaterialIcons
            name="expand-more"
            size={18}
            color={activeFilter === 'recientes' ? '#FFFFFF' : colors.ink.light}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            activeFilter === 'libro' && styles.filterChipActive,
          ]}
          onPress={() => setActiveFilter('libro')}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.filterText,
              activeFilter === 'libro' && styles.filterTextActive,
            ]}>
            Por Libro
          </Text>
          <MaterialIcons
            name="expand-more"
            size={18}
            color={activeFilter === 'libro' ? '#FFFFFF' : colors.ink.light}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            activeFilter === 'favoritos' && styles.filterChipActive,
          ]}
          onPress={() => setActiveFilter('favoritos')}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.filterText,
              activeFilter === 'favoritos' && styles.filterTextActive,
            ]}>
            Favoritos
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Writings List */}
      <FlatList
        data={writings}
        renderItem={renderWritingCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

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
    // Sin línea inferior
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    paddingBottom: 20, // Espacio para tab bar
    gap: 16,
  },

  // Writing Card
  writingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.ivory.border,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    gap: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  cardTextContainer: {
    flex: 1,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  verseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.burgundy.accent,
    flex: 1,
  },
  dateBadge: {
    backgroundColor: colors.ivory.shade,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.ivory.border,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.charcoal.muted,
  },
  previewText: {
    fontSize: 14,
    lineHeight: 22,
    color: `${colors.charcoal.DEFAULT}CC`,
  },
  cardFooter: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.ivory.border,
    alignItems: 'flex-end',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary.DEFAULT,
  },


});

export default WritingsScreen;

