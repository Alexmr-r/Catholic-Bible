/**
 * PANTALLA: GESTIONAR DESCARGAS
 * Permite descargar/eliminar la Biblia en Inglés para uso offline
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import {colors} from '../theme/colors';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/AppNavigator';
import {EnglishBibleDownloadService} from '../services/english-bible-download.service';

interface DownloadState {
  isDownloaded: boolean;
  isDownloading: boolean;
  progress: number;
  error: string | null;
}

type ManageDownloadsScreenProps = NativeStackScreenProps<RootStackParamList, 'ManageDownloads'>;

const ManageDownloadsScreen: React.FC<ManageDownloadsScreenProps> = ({navigation}) => {
  const [downloadState, setDownloadState] = useState<DownloadState>({
    isDownloaded: false,
    isDownloading: false,
    progress: 0,
    error: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkDownloadStatus();
  }, []);

  const checkDownloadStatus = async () => {
    try {
      const isDownloaded = await EnglishBibleDownloadService.isDownloaded();
      setDownloadState(prev => ({...prev, isDownloaded}));
    } catch (error) {
      console.error('Error checking download status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloadState(prev => ({...prev, isDownloading: true, progress: 0, error: null}));

    try {
      await EnglishBibleDownloadService.download((progress) => {
        setDownloadState(prev => ({...prev, progress}));
      });

      setDownloadState({
        isDownloaded: true,
        isDownloading: false,
        progress: 100,
        error: null,
      });

      Alert.alert(
        '¡Descarga completada!',
        'La Biblia en Inglés ya está disponible para uso sin conexión.',
        [{text: 'OK'}]
      );
    } catch (error: any) {
      setDownloadState(prev => ({
        ...prev,
        isDownloading: false,
        error: error.message || 'Error en la descarga',
      }));

      Alert.alert(
        'Error en la descarga',
        'No se pudo descargar la Biblia. Por favor, verifica tu conexión e inténtalo de nuevo.',
        [{text: 'OK'}]
      );
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar descarga',
      '¿Estás seguro de que quieres eliminar la Biblia en Inglés? Necesitarás conexión a internet para volver a descargarla.',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await EnglishBibleDownloadService.delete();
              setDownloadState({
                isDownloaded: false,
                isDownloading: false,
                progress: 0,
                error: null,
              });
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la descarga');
            }
          },
        },
      ]
    );
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.gold.DEFAULT} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back-ios" size={24} color={colors.charcoal.DEFAULT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestionar Descargas</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* Sección: Versión Disponible */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VERSIÓN DISPONIBLE</Text>

          <View style={styles.downloadCard}>
            {/* Header de la tarjeta */}
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <View style={styles.bookIconContainer}>
                  <MaterialIcons name="menu-book" size={24} color={colors.gold.DEFAULT} />
                </View>
                <View style={styles.bookInfo}>
                  <Text style={styles.bookTitle}>Biblia en Inglés</Text>
                  <Text style={styles.bookMeta}>English • ~10 MB</Text>
                </View>
              </View>

              {/* Badge de estado */}
              {downloadState.isDownloaded ? (
                <View style={styles.badgeActive}>
                  <MaterialIcons name="check-circle" size={14} color="#059669" />
                  <Text style={styles.badgeActiveText}>ACTIVA</Text>
                </View>
              ) : (
                <View style={styles.badgeInactive}>
                  <MaterialIcons name="info" size={14} color="#94A3B8" />
                  <Text style={styles.badgeInactiveText}>NO DESCARGADO</Text>
                </View>
              )}
            </View>

            {/* Contenido según estado */}
            <View style={styles.cardContent}>
              {downloadState.isDownloaded ? (
                // Estado: Descargado
                <>
                  <View style={styles.statusRow}>
                    <MaterialIcons name="download-done" size={18} color="#059669" />
                    <Text style={styles.statusText}>Contenido descargado</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDelete}
                    activeOpacity={0.7}>
                    <MaterialIcons name="delete" size={18} color={colors.burgundy.DEFAULT} />
                    <Text style={styles.deleteButtonText}>Eliminar descarga</Text>
                  </TouchableOpacity>
                </>
              ) : downloadState.isDownloading ? (
                // Estado: Descargando
                <>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {width: `${downloadState.progress}%`},
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {Math.round(downloadState.progress)}%
                    </Text>
                  </View>
                  <Text style={styles.downloadingText}>Descargando...</Text>
                </>
              ) : (
                // Estado: No descargado
                <>
                  <View style={styles.statusRow}>
                    <MaterialIcons name="cloud-off" size={18} color="#94A3B8" />
                    <Text style={styles.statusTextMuted}>
                      Requiere conexión para descargar
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={handleDownload}
                    activeOpacity={0.8}>
                    <MaterialIcons name="cloud-download" size={22} color="#FFFFFF" />
                    <Text style={styles.downloadButtonText}>Descargar ahora</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Info box */}
        <View style={styles.infoBox}>
          <MaterialIcons name="info" size={20} color={colors.gold.DEFAULT} />
          <Text style={styles.infoText}>
            Descargar versiones te permite realizar búsquedas y leer la Palabra de Dios incluso sin conexión a internet.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ivory.DEFAULT,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.ivory.DEFAULT,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.charcoal.DEFAULT,
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  headerSpacer: {
    width: 0,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  // Section
  section: {
    marginTop: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 2,
    marginBottom: 12,
    marginLeft: 4,
  },

  // Download Card
  downloadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.gold.DEFAULT,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bookIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.gold.DEFAULT}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookInfo: {},
  bookTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.charcoal.DEFAULT,
    fontFamily: 'serif',
  },
  bookMeta: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },

  // Badges
  badgeActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeActiveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: 0.5,
  },
  badgeInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeInactiveText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },

  // Card Content
  cardContent: {
    gap: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  statusTextMuted: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94A3B8',
  },

  // Download Button
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.gold.DEFAULT,
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: colors.gold.DEFAULT,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  downloadButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Delete Button
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: `${colors.burgundy.DEFAULT}30`,
    borderRadius: 12,
    paddingVertical: 12,
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.burgundy.DEFAULT,
  },

  // Progress
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.gold.DEFAULT,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gold.DEFAULT,
    width: 40,
    textAlign: 'right',
  },
  downloadingText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: `${colors.gold.DEFAULT}08`,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: `${colors.gold.DEFAULT}15`,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
  },
});

export default ManageDownloadsScreen;
