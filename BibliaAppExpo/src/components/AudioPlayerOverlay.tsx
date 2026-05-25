import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Easing,
} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { t } from '../locales/i18n';
import {audioService, AudioStatus} from '../services/audio.service';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const AudioPlayerOverlay: React.FC = () => {
  const {colors, isDarkMode} = useTheme();
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState<AudioStatus>({isSpeaking: false, engineType: 'native'});
  const [slideAnim] = useState(new Animated.Value(-150)); // Empezar fuera de pantalla (arriba)
  const [progressAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Suscribirse a cambios de estado del AudioService
    audioService.subscribe((newStatus) => {
      setStatus(newStatus);
      
      // Animar entrada si está hablando O descargando
      const shouldShow = newStatus.isSpeaking || newStatus.isDownloading;
      
      Animated.spring(slideAnim, {
        toValue: shouldShow ? 0 : -150,
        useNativeDriver: true,
        bounciness: 8,
      }).start();
    });

    return () => {
      audioService.unsubscribe();
    };
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: status.readProgress || 0,
      duration: 1800, // Aumentado para que "flote" suavemente entre frases
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [status.readProgress]);

  const handleStop = async () => {
    await audioService.stop();
  };

  const handleDownload = async () => {
    await audioService.downloadModel();
  };

  // Si no está hablando y terminó la animación de salida, podríamos no renderizar
  // pero mantendremos el componente montado para la animación fluida

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 10),
          transform: [{translateY: slideAnim}],
          backgroundColor: isDarkMode ? colors.surface.highlight : '#FFFFFF',
          borderBottomColor: colors.ivory.border,
        },
      ]}>
      <View style={styles.content}>
        <View style={styles.infoRow}>
          <View style={styles.iconBadge}>
            <MaterialIcons 
              name={status.isDownloading ? "cloud-download" : "graphic-eq"} 
              size={18} 
              color={colors.primary.DEFAULT} 
            />
          </View>
          <View style={styles.textColumn}>
            <Text style={[styles.title, {color: colors.charcoal.DEFAULT}]}>
              {status.isDownloading ? t('reading.installingNarrator') : t('reading.listeningReading')}
            </Text>
            <Text style={[styles.subtitle, {color: colors.charcoal.muted}]} numberOfLines={1}>
              {status.isDownloading 
                ? `Descargando: ${Math.round((status.downloadProgress || 0) * 100)}%`
                : `${status.engineType === 'ai-local' ? '✨ ' : ''}${status.voiceName || 'Narración Activa'}`
              }
            </Text>
          </View>
        </View>

        {status.isSpeaking ? (
          <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: 10}}>
            <TouchableOpacity
              style={[styles.iconButton, {backgroundColor: isDarkMode ? '#2c2c2e' : '#f2f2f7'}]}
              onPress={status.isPaused ? () => audioService.resume() : () => audioService.pause()}
              activeOpacity={0.7}>
              <MaterialIcons name={status.isPaused ? "play-arrow" : "pause"} size={24} color={colors.primary.DEFAULT} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.iconButton, {backgroundColor: isDarkMode ? '#3a1c1c' : '#ffebee', marginLeft: 10}]}
              onPress={handleStop}
              activeOpacity={0.7}>
              <MaterialIcons name="close" size={24} color={colors.burgundy.DEFAULT} />
            </TouchableOpacity>
          </View>
        ) : status.isDownloading ? (
          <View style={styles.progressContainer}>
             <View style={[styles.progressBar, { backgroundColor: colors.primary.DEFAULT, width: (status.downloadProgress || 0) * 100 + '%' as any }]} />
          </View>
        ) : null}
      </View>

      {status.isSpeaking && status.engineType === 'ai-local' && (
        <View style={styles.readingProgressContainer}>
          <Animated.View style={[
            styles.readingProgressBar, 
            { 
              backgroundColor: colors.primary.DEFAULT, 
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp'
              })
            }
          ]} />
        </View>
      )}

      {!status.isDownloading && status.engineType === 'native' && (
        <TouchableOpacity 
          style={styles.upgradePrompt}
          onPress={handleDownload}
        >
          <MaterialIcons name="auto-awesome" size={14} color={colors.primary.DEFAULT} />
          <Text style={styles.upgradeText}>{t('reading.installPremiumVoice')}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    // Sombra para elevación
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(107, 144, 128, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textColumn: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  stopText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  progressContainer: {
    width: 100,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  readingProgressContainer: {
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 1.5,
    marginTop: 15,
    overflow: 'hidden',
    width: '100%',
  },
  readingProgressBar: {
    height: '100%',
    borderRadius: 1.5,
  },
  upgradePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.03)',
    gap: 6,
  },
  upgradeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AudioPlayerOverlay;
