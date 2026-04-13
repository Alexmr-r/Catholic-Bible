import React from 'react';
import { View, Text, StyleSheet, Animated, Platform, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNetwork } from '../contexts/NetworkContext';

const OfflineBanner: React.FC = () => {
  const { colors, isDarkMode } = useTheme();
  const { isConnected, isInternetReachable, isForcedOffline, isBibleDownloaded } = useNetwork();
  
  // Solo mostramos el banner si NO hay conexión física o hemos forzado el modo offline manualmente.
  const isOnline = isConnected && (isInternetReachable !== false) && !isForcedOffline;

  // Determinar mensaje
  const bannerText = isForcedOffline ? 'Modo sin conexión activo' : 'Sin conexión a internet';
  const indicatorColor = isBibleDownloaded ? colors.primary.DEFAULT : colors.burgundy.DEFAULT;

  const visible = React.useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = React.useState(false);
  const hideTimeout = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (!isOnline) {
      setShouldRender(true);
      // Animación de entrada
      Animated.spring(visible, {
        toValue: 1,
        useNativeDriver: true,
        tension: 40,
        friction: 8,
      }).start();

      // Auto-ocultar después de 4 segundos
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      hideTimeout.current = setTimeout(() => {
        Animated.timing(visible, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => setShouldRender(false));
      }, 4000);
    } else {
      // Si vuelve el internet, ocultar inmediatamente
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      Animated.timing(visible, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShouldRender(false));
    }

    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, [isOnline]);

  if (!shouldRender) return null;

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          opacity: visible,
          transform: [{
            translateY: visible.interpolate({
              inputRange: [0, 1],
              outputRange: [-50, 20] // Aparece flotando un poco más abajo del top
            })
          }]
        }
      ]}
    >
      <View style={[
        styles.pill, 
        { backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)' }
      ]}>
        <View style={[styles.indicator, { backgroundColor: indicatorColor }]} />
        <Text style={[styles.text, { color: isDarkMode ? '#F1F5F9' : '#334155' }]}>
          {bannerText}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 20,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

export default OfflineBanner;
