/**
 * ==========================================
 * PANTALLA DE EDICIÓN DE ESCRITOS
 * ==========================================
 * Diseño basado en el HTML de referencia
 * Conectado con el backend para actualizar escritos
 */

import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  } from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {ThemeColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {RootStackParamList} from '../navigation/AppNavigator';
import {writingsService} from '../services/writings.service';
import {readingProgressService} from '../services/reading-progress.service';

type EditWritingScreenProps = NativeStackScreenProps<RootStackParamList, 'EditWriting'>;

const EditWritingScreen: React.FC<EditWritingScreenProps> = ({navigation, route}) => {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => getStyles(colors, isDarkMode, insets.top), [colors, isDarkMode, insets.top]);
  const {
    writingId,
    initialTitle,
    initialContent,
    bookId,
    bookName,
    chapter,
    verse,
    verseText,
    createdAt,
  } = route.params;

  const [title, setTitle] = useState(initialTitle || '');
  const [content, setContent] = useState(initialContent || '');
  const [isSaving, setIsSaving] = useState(false);
  const contentInputRef = useRef<TextInput>(null);

  const handleBack = () => {
    if (title !== initialTitle || content !== initialContent) {
      Alert.alert(
        'Unsaved changes',
        'Do you want to discard your changes?',
        [
          {text: 'Keep editing', style: 'cancel'},
          {text: 'Discard', style: 'destructive', onPress: () => navigation.goBack()},
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleCancel = () => {
      Alert.alert(
        'Cancel edit',
        'Are you sure you want to cancel? Your changes will be lost.',
        [
          {text: 'Keep editing', style: 'cancel'},
          {text: 'Cancel', style: 'destructive', onPress: () => navigation.goBack()},
        ]
      );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title cannot be empty');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Error', 'Content cannot be empty');
      return;
    }

    try {
      setIsSaving(true);

      if (writingId === 'new') {
        // Crear nuevo writing (viene desde calendario)
        await writingsService.createWriting({
          title: title.trim(),
          content: content.trim(),
          bookId: bookId,
          chapter: chapter,
          verse: verse,
          tags: ['reflexión', 'lectura-diaria'],
        });

        // ✅ NUEVO: Marcar el día como completado automáticamente
        try {
          const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
          await readingProgressService.markAsComplete(today);
          console.log('✅ Día marcado automáticamente como completado:', today);
        } catch (err) {
          console.error('Error marcando día como completado:', err);
          // No fallar si no se puede marcar, la reflexión ya se guardó
        }
      } else {
        // Actualizar writing existente
        await writingsService.updateWriting(writingId, {
          title: title.trim(),
          content: content.trim(),
        });
      }

      // Volver atrás
      navigation.goBack();
    } catch (error) {
      console.error('Error guardando escrito:', error);
      Alert.alert('Error', 'Could not save writing. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.charcoal.dark} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Editing Writing</Text>

          <TouchableOpacity style={styles.headerButton} disabled>
            <MaterialIcons name="share" size={24} color={colors.ink.light} style={{opacity: 0.5}} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Fecha y Badge de Modo Edición */}
          <View style={styles.metaRow}>
            <View style={styles.dateChip}>
              <MaterialIcons name="calendar-today" size={18} color={colors.primary.DEFAULT} />
              <Text style={styles.dateText}>{formatDate(createdAt)}</Text>
            </View>

            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>Edit Mode</Text>
            </View>
          </View>

          {/* Campo de Título */}
          <View style={styles.titleContainer}>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Writing title"
              placeholderTextColor={`${colors.ink.light}50`}
              multiline={false}
              maxLength={100}
              returnKeyType="next"
              onSubmitEditing={() => contentInputRef.current?.focus()}
            />
            <View style={styles.titleUnderline} />
          </View>

          {/* Campo de Contenido */}
          <View style={styles.contentContainer}>
            <TextInput
              style={styles.contentInput}
              value={content}
              onChangeText={setContent}
              placeholder="Write your reflection here..."
              placeholderTextColor={`${colors.ink.light}70`}
              multiline
              textAlignVertical="top"
              ref={contentInputRef}
              blurOnSubmit={false}
            />
          </View>

          {/* Tarjeta de Referencia Bíblica */}
          {bookName && chapter && verse && (
            <View style={styles.referenceCard}>
              <View style={styles.referenceStripe} />
              <View style={styles.referenceContent}>
                <View style={styles.referenceHeader}>
                  <MaterialIcons name="auto-stories" size={18} color={`${colors.burgundy.DEFAULT}80`} />
                  <Text style={styles.referenceLabel}>REFERENCE</Text>
                  <Text style={styles.referenceDisabled}>(not editable)</Text>
                </View>

                <Text style={styles.referenceTitle}>
                  {bookName} {chapter}:{verse}
                </Text>

                {verseText && (
                  <Text style={styles.referenceText} numberOfLines={2}>
                    "{verseText}"
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Botones de Acción */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={isSaving}
              activeOpacity={0.7}>
              <MaterialIcons name="close" size={20} color={colors.burgundy.DEFAULT} />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.7}>
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialIcons name="save" size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Save</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Espaciado inferior */}
          <View style={{height: 40}} />
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const getStyles = (colors: ThemeColors, isDarkMode: boolean, safeTop: number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? colors.background.dark : colors.cream,
  },

  // Header - igual que HTML
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'android' ? Math.max(safeTop, 45) + 20 : Math.max(safeTop, 20) + 16,
    backgroundColor: isDarkMode ? colors.background.dark : colors.cream,
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
    
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  // Meta Row - Fecha y Badge
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: isDarkMode ? colors.ivory.shade : colors.ivory.shade,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink.light,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  editBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editBadgeText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: isDarkMode ? colors.primary.DEFAULT : colors.gold.DEFAULT,
    
  },

  // Título Editable
  titleContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  titleInput: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.charcoal.dark,
    
    padding: 0,
    margin: 0,
    lineHeight: 38,
    minHeight: 38,
  },
  titleUnderline: {
    position: 'absolute',
    bottom: -8,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: isDarkMode ? `${colors.primary.DEFAULT}66` : `${colors.gold.DEFAULT}66`,
  },

  // Contenido Editable
  contentContainer: {
    marginBottom: 40,
  },
  contentInput: {
    fontSize: 18,
    lineHeight: 32,
    color: `${colors.charcoal.DEFAULT}E6`,
    
    padding: 0,
    margin: 0,
    minHeight: 280,
  },

  // Tarjeta de Referencia - deshabilitada con opacidad y grayscale
  referenceCard: {
    position: 'relative',
    flexDirection: 'row',
    backgroundColor: `${colors.ivory.shade}80`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${colors.ivory.border}80`,
    overflow: 'hidden',
    marginBottom: 32,
    opacity: 0.6, // Deshabilitada visualmente
  },
  referenceStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: `${colors.gold.DEFAULT}60`, // Más apagado
  },
  referenceContent: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingLeft: 24,
  },
  referenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  referenceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: `${colors.burgundy.DEFAULT}80`, // Más apagado
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  referenceDisabled: {
    fontSize: 9,
    fontStyle: 'italic',
    color: `${colors.ink.light}60`,
    marginLeft: 4,
  },
  referenceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: `${colors.charcoal.dark}99`, // Más apagado
    
    marginBottom: 4,
  },
  referenceText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: `${colors.ink.light}99`, // Más apagado
    
    lineHeight: 26,
  },

  // Botones de Acción - Grid 2 columnas
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${colors.burgundy.DEFAULT}33`,
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.burgundy.DEFAULT,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary.DEFAULT,
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: isDarkMode ? colors.charcoal.dark : '#FFFFFF',
  },
});

export default EditWritingScreen;
