/**
 * ==========================================
 * SPLASH SCREEN - PANTALLA DE CARGA INICIAL
 * ==========================================
 * Diseño basado en el HTML de referencia
 * Muestra el logo de la app durante 1 segundo
 * Luego navega automáticamente a la pantalla Auth
 */

import React, {useEffect} from 'react';
import {View, StyleSheet, Animated} from 'react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({onFinish}) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Animación de entrada (fade in + scale)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Después de 700ms, iniciar fade out (300ms para salir)
    const fadeOutTimer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Cuando termina el fade out, navegar
        onFinish();
      });
    }, 700);

    return () => clearTimeout(fadeOutTimer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{scale: scaleAnim}],
          },
        ]}>
        {/* Logo Container con sombra y gradiente */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            {/* Icono de la Biblia - Cruz + Libro */}
            <View style={styles.iconContainer}>
              {/* Cruz vertical */}
              <View style={styles.crossVertical} />
              {/* Cruz horizontal */}
              <View style={styles.crossHorizontal} />
              {/* Curva del libro (parte inferior) */}
              <View style={styles.bookCurve} />
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFBF7', // bible-ivory del HTML
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Logo Container - círculo con gradiente
  logoContainer: {
    marginBottom: 40,
  },
  logoCircle: {
    width: 144, // 36 * 4 (w-36 en Tailwind = 9rem = 144px)
    height: 144,
    borderRadius: 72,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    // Sombra sutil elevada (subtle-elevated del HTML)
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.04,
    shadowRadius: 25,
    elevation: 4,
    // Borde blanco semi-transparente
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },

  // Icono de la Biblia
  iconContainer: {
    width: 80, // w-20 = 5rem = 80px
    height: 96, // h-24 = 6rem = 96px
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Cruz vertical (8px ancho x 80px alto)
  crossVertical: {
    position: 'absolute',
    width: 8,
    height: 80,
    backgroundColor: '#DBCFB0', // champagne-gold del HTML
    borderRadius: 4,
    zIndex: 10,
  },

  // Cruz horizontal (56px ancho x 8px alto)
  crossHorizontal: {
    position: 'absolute',
    width: 56, // w-14 = 3.5rem = 56px
    height: 8,
    backgroundColor: '#DBCFB0', // champagne-gold del HTML
    borderRadius: 4,
    top: 24, // mt-6 = 1.5rem = 24px
    zIndex: 10,
  },

  // Curva del libro (parte inferior)
  bookCurve: {
    position: 'absolute',
    bottom: 4, // Cambiado de -2 a 4 para que no se recorte
    width: 48,
    height: 12,
    borderBottomWidth: 3,
    borderBottomColor: '#DBCFB0', // champagne-gold del HTML
    borderRadius: 24, // 50% en CSS
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
});

export default SplashScreen;
