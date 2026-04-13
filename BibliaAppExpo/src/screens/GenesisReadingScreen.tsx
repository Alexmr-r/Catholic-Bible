import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {ThemeColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';
import {GenesisReadingScreenProps} from '../navigation/AppNavigator';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

// Mock data para Génesis 1 - La Creación
const GENESIS_1_DATA = {
  book: 'Génesis',
  chapter: 1,
  version: 'Biblia de Jerusalén',
  title: 'La Creación',
  verses: [
    {number: 1, text: 'En el principio creó Dios los cielos y la tierra.'},
    {number: 2, text: 'La tierra era caos y confusión y oscuridad por encima del abismo, y un viento de Dios aleteaba por encima de las aguas.'},
    {number: 3, text: 'Dijo Dios: «Haya luz», y hubo luz.'},
    {number: 4, text: 'Vio Dios que la luz era buena, y separó Dios la luz de la oscuridad,'},
    {number: 5, text: 'y llamó Dios a la luz «día», y a la oscuridad la llamó «noche». Y atardeció y amaneció: día primero.'},
    {number: 6, text: 'Dijo Dios: «Haya un firmamento por en medio de las aguas, que las aparte unas de otras.»'},
    {number: 7, text: 'E hizo Dios el firmamento; y apartó las aguas de por debajo del firmamento de las aguas de por encima del firmamento. Y así fue.'},
    {number: 8, text: 'Y llamó Dios al firmamento «cielos». Y atardeció y amaneció: día segundo.'},
    {number: 9, text: 'Dijo Dios: «Acumúlense las aguas de por debajo de los cielos en un solo conjunto, y déjese ver lo seco»; y así fue.'},
    {number: 10, text: 'Y llamó Dios a lo seco «tierra», y al conjunto de las aguas lo llamó «mares»; y vio Dios que estaba bien.'},
    {number: 11, text: 'Dijo Dios: «Produzca la tierra vegetación: hierbas que den semillas y árboles frutales que den fruto, de su especie, con su semilla dentro, sobre la tierra.» Y así fue.'},
    {number: 12, text: 'La tierra produjo vegetación: hierbas que dan semilla, por sus especies, y árboles que dan fruto con la semilla dentro, por sus especies; y vio Dios que estaba bien.'},
    {number: 13, text: 'Y atardeció y amaneció: día tercero.'},
    {number: 14, text: 'Dijo Dios: «Haya luceros en el firmamento celeste, para apartar el día de la noche, y sirvan de señales para las solemnidades, para los días y para los años;'},
    {number: 15, text: 'y sirvan de luceros en el firmamento celeste para alumbrar sobre la tierra.» Y así fue.'},
    {number: 16, text: 'Hizo Dios los dos luceros mayores; el lucero grande para el dominio del día, y el lucero pequeño para el dominio de la noche, y las estrellas;'},
    {number: 17, text: 'y los puso Dios en el firmamento celeste para alumbrar sobre la tierra,'},
    {number: 18, text: 'y para dominar en el día y en la noche, y para apartar la luz de la oscuridad; y vio Dios que estaba bien.'},
    {number: 19, text: 'Y atardeció y amaneció: día cuarto.'},
    {number: 20, text: 'Dijo Dios: «Bullan las aguas de animales vivientes, y aves revoloteen sobre la tierra frente al firmamento celeste.»'},
    {number: 21, text: 'Y creó Dios los grandes monstruos marinos y todo animal viviente, los que serpean, de los que bullen las aguas por sus especies, y todas las aves aladas por sus especies; y vio Dios que estaba bien;'},
    {number: 22, text: 'y los bendijo Dios diciendo: «Sed fecundos y multiplicaos, y henchid las aguas en los mares, y las aves crezcan en la tierra.»'},
    {number: 23, text: 'Y atardeció y amaneció: día quinto.'},
    {number: 24, text: 'Dijo Dios: «Produzca la tierra animales vivientes de cada especie: bestias, sierpes y alimañas terrestres de cada especie.» Y así fue.'},
    {number: 25, text: 'Hizo Dios las alimañas terrestres de cada especie, y las bestias de cada especie, y toda sierpe del suelo de cada especie: y vio Dios que estaba bien.'},
    {number: 26, text: 'Y dijo Dios: «Hagamos al ser humano a nuestra imagen, como semejanza nuestra, y manden en los peces del mar y en las aves de los cielos, y en las bestias y en todas las alimañas terrestres, y en todas las sierpes que serpean por la tierra.', hasNote: true},
    {number: 27, text: 'Creó, pues, Dios al ser humano a imagen suya, a imagen de Dios le creó, macho y hembra los creó.'},
    {number: 28, text: 'Y bendíjolos Dios, y díjoles Dios: «Sed fecundos y multiplicaos y henchid la tierra y sometedla; mandad en los peces del mar y en las aves de los cielos y en todo animal que serpea sobre la tierra.»'},
    {number: 29, text: 'Dijo Dios: «Ved que os he dado toda hierba de semilla que existe sobre la haz de toda la tierra, así como todo árbol que lleva fruto de semilla; para vosotros será de alimento.'},
    {number: 30, text: 'Y a todo animal terrestre, y a toda ave de los cielos y a toda sierpe de sobre la tierra, animada de vida, toda la hierba verde les doy de alimento.» Y así fue.'},
    {number: 31, text: 'Vio Dios cuanto había hecho, y todo estaba muy bien. Y atardeció y amaneció: día sexto.'},
  ],
};

const GenesisReadingScreen: React.FC<GenesisReadingScreenProps> = ({navigation}) => {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => getStyles(colors, isDarkMode, insets.top), [colors, isDarkMode, insets.top]);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const data = GENESIS_1_DATA;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleTextSettings = () => {
    Alert.alert(
      '🔤 Ajustes de Texto',
      'Funcionalidad en desarrollo.\n\nPróximamente podrás ajustar el tamaño de letra, tipo de fuente, espaciado, etc.',
      [{text: 'Entendido'}]
    );
  };

  const handleMoreOptions = () => {
    Alert.alert(
      '⚙️ Más Opciones',
      'Funcionalidad en desarrollo.\n\nPróximamente podrás acceder a:\n• Audio del capítulo\n• Comentarios\n• Referencias cruzadas\n• Compartir capítulo completo',
      [{text: 'Entendido'}]
    );
  };

  const handleHighlight = (color: string) => {
    Alert.alert(
      '🎨 Resaltar',
      `Funcionalidad en desarrollo.\n\nPróximamente podrás resaltar el versículo ${selectedVerse} con color ${color}.`,
      [{text: 'Entendido'}]
    );
    setSelectedVerse(null);
  };

  const handleAddNote = () => {
    Alert.alert(
      '📝 Agregar Nota',
      `Funcionalidad en desarrollo.\n\nPróximamente podrás escribir una nota personal para el versículo ${selectedVerse}.`,
      [{text: 'Entendido'}]
    );
    setSelectedVerse(null);
  };

  const handleAddFavorite = () => {
    Alert.alert(
      '❤️ Agregar a Favoritos',
      `Funcionalidad en desarrollo.\n\nPróximamente podrás agregar el versículo ${selectedVerse} a tus favoritos.`,
      [{text: 'Entendido'}]
    );
    setSelectedVerse(null);
  };

  const handleShare = () => {
    Alert.alert(
      '🔗 Compartir',
      `Funcionalidad en desarrollo.\n\nPróximamente podrás compartir el versículo ${selectedVerse} en redes sociales o por mensaje.`,
      [{text: 'Entendido'}]
    );
    setSelectedVerse(null);
  };

  const handlePreviousChapter = () => {
    Alert.alert(
      '⬅️ Capítulo Anterior',
      'Funcionalidad en desarrollo.\n\nPróximamente navegarás al inicio o al último capítulo del libro anterior.',
      [{text: 'Entendido'}]
    );
  };

  const handleNextChapter = () => {
    Alert.alert(
      '➡️ Siguiente Capítulo',
      'Funcionalidad en desarrollo.\n\nPróximamente navegarás a Génesis 2.',
      [{text: 'Entendido'}]
    );
  };

  const handleVersePress = (verseNumber: number) => {
    setSelectedVerse(selectedVerse === verseNumber ? null : verseNumber);
  };

  return (
    <View style={styles.container}>
      {/* Header Sticky */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={20} color={colors.charcoal.dark} />
          </TouchableOpacity>
        </View>

        <View style={styles.headerCenter}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>{data.book} {data.chapter}</Text>
            <MaterialIcons name="expand-more" size={16} color={colors.secondary} style={styles.expandIcon} />
          </View>
          <Text style={styles.headerSubtitle}>{data.version}</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleTextSettings}
            style={styles.iconButton}
            activeOpacity={0.7}>
            <MaterialIcons name="text-fields" size={24} color={colors.charcoal.muted} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleMoreOptions}
            style={styles.iconButton}
            activeOpacity={0.7}>
            <MaterialIcons name="more-vert" size={24} color={colors.charcoal.muted} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Content */}
        <View style={styles.content}>
          {/* Chapter Title */}
          <View style={styles.chapterHeader}>
            <Text style={styles.chapterTitle}>{data.title}</Text>
            <View style={styles.chapterDivider} />
          </View>

          {/* Verses */}
          <View style={styles.versesContainer}>
            {data.verses.map((verse) => (
              <TouchableOpacity
                key={verse.number}
                style={[
                  styles.verseRow,
                  selectedVerse === verse.number && styles.verseRowSelected,
                ]}
                onPress={() => handleVersePress(verse.number)}
                activeOpacity={0.7}>
                <Text style={[
                  styles.verseNumber,
                  selectedVerse === verse.number && { color: colors.charcoal.dark }, // Highlight readability
                ]}>{verse.number}</Text>
                <View style={styles.verseContent}>
                  <Text
                    style={[
                      styles.verseText,
                      selectedVerse === verse.number && styles.verseTextSelected,
                      selectedVerse === verse.number && { color: '#1A1A1A' }, // Texto oscuro sobre selección clara
                    ]}>
                    {verse.text}
                  </Text>
                  {verse.hasNote && (
                    <TouchableOpacity style={styles.noteButton}>
                      <MaterialIcons name="sticky-note-2" size={14} color={colors.secondary} />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Navigation Buttons */}
          <View style={styles.navigationButtons}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={handlePreviousChapter}
              activeOpacity={0.7}>
              <MaterialIcons name="arrow-back" size={20} color={colors.charcoal.muted} />
              <View style={styles.navButtonText}>
                <Text style={styles.navButtonLabel}>ANTERIOR</Text>
                <Text style={styles.navButtonTitle}>Inicio</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, styles.navButtonRight]}
              onPress={handleNextChapter}
              activeOpacity={0.7}>
              <View style={[styles.navButtonText, styles.navButtonTextRight]}>
                <Text style={styles.navButtonLabel}>SIGUIENTE</Text>
                <Text style={styles.navButtonTitle}>Génesis 2</Text>
              </View>
              <MaterialIcons name="arrow-forward" size={20} color={colors.charcoal.muted} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Floating Toolbar (cuando hay versículo seleccionado) */}
      {selectedVerse !== null && (
        <View style={styles.floatingToolbar}>
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => handleHighlight('gold')}
            activeOpacity={0.7}>
            <View style={[styles.colorDot, {backgroundColor: colors.gold.accent}]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => handleHighlight('primary')}
            activeOpacity={0.7}>
            <View style={[styles.colorDot, {backgroundColor: colors.primary.DEFAULT}]} />
          </TouchableOpacity>

          <View style={styles.toolbarDivider} />

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={handleAddNote}
            activeOpacity={0.7}>
            <MaterialIcons name="edit-note" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={handleAddFavorite}
            activeOpacity={0.7}>
            <MaterialIcons name="favorite" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={handleShare}
            activeOpacity={0.7}>
            <MaterialIcons name="share" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const getStyles = (colors: ThemeColors, isDarkMode: boolean, safeTop: number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? colors.background.dark : colors.cream,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: Math.max(safeTop, 20) + 16,
    paddingBottom: 8,
    backgroundColor: isDarkMode ? colors.background.dark : colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: colors.ivory.border,
  },
  headerLeft: {
    width: 80,
    alignItems: 'flex-start',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.charcoal.dark,
    lineHeight: 24,
  },
  expandIcon: {
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.charcoal.muted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
    justifyContent: 'flex-end',
  },
  iconButton: {
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
    paddingBottom: 24,
  },

  // Content
  content: {
    maxWidth: 700,
    alignSelf: 'center',
    width: '100%',
  },

  // Chapter Header
  chapterHeader: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
    alignItems: 'center',
  },
  chapterTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: isDarkMode ? colors.primary.DEFAULT : colors.burgundy.accent,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  chapterDivider: {
    width: 64,
    height: 3,
    backgroundColor: isDarkMode ? `${colors.primary.DEFAULT}80` : `${colors.gold.accent}80`,
    borderRadius: 999,
  },

  // Verses
  versesContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  verseRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  verseRowSelected: {
    backgroundColor: isDarkMode ? `${colors.primary.DEFAULT}20` : `${colors.primary.DEFAULT}20`,
  },
  verseNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.charcoal.muted,
    marginRight: 6,
    marginTop: 6,
    minWidth: 20,
  },
  verseContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  verseText: {
    fontSize: 19,
    lineHeight: 34,
    color: colors.charcoal.DEFAULT,
    flex: 1,
  },
  verseTextSelected: {
    backgroundColor: isDarkMode ? `${colors.primary.DEFAULT}40` : `${colors.primary.DEFAULT}20`,
    borderRadius: 2,
  },
  noteButton: {
    marginLeft: 4,
    marginTop: 4,
    opacity: 0.5,
  },

  // Navigation Buttons
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  navButtonRight: {
    flexDirection: 'row-reverse',
  },
  navButtonText: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  navButtonTextRight: {
    alignItems: 'flex-end',
  },
  navButtonLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.charcoal.muted,
    letterSpacing: 1.5,
  },
  navButtonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.charcoal.DEFAULT,
  },

  // Floating Toolbar
  floatingToolbar: {
    position: 'absolute',
    top: 90,
    alignSelf: 'center', // Centrado y más estrecho
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E', // Color premium casi negro
    borderRadius: 30, // Forma de cápsula/pill
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // Borde sutil premium
    zIndex: 1000,
  },
  toolbarButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  toolbarDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default GenesisReadingScreen;

