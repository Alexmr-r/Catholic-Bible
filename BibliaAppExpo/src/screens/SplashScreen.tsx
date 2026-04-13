import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Animated, Dimensions, Image, Appearance } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface SplashScreenProps {
  onFinish: () => void;
  readyToLeave: boolean;
}

const { width } = Dimensions.get('window');

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, readyToLeave }) => {
  const { colors, isDarkMode } = useTheme();
  
  // 1. Empezamos con el color del sistema (donde está el nativo)
  const systemIsDark = Appearance.getColorScheme() === 'dark';
  const initialBg = systemIsDark ? '#121212' : '#FAF9F6';
  const targetBg = isDarkMode ? '#121212' : '#FAF9F6';

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const bgAnim = useRef(new Animated.Value(isDarkMode === systemIsDark ? 0 : 1)).current;
  
  useEffect(() => {
    // Si hay discrepancia entre sistema y guardado, animamos suave el fondo
    if (isDarkMode !== systemIsDark) {
      Animated.timing(bgAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false, // Background no soporta native driver
      }).start();
    }
  }, []);

  useEffect(() => {
    if (readyToLeave) {
      // Salida rápida (300ms)
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(() => onFinish());
    }
  }, [readyToLeave]);

  // Interpolar colores para evitar el parpadeo brusco
  const backgroundColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [initialBg, targetBg]
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor, opacity: fadeAnim }]}>
        <Image
          source={require('../../assets/logo-transparent.png')}
          style={styles.logo}
          resizeMode="contain"
        />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  logo: {
    width: width * 0.4,
    height: width * 0.4,
  },
});

export default SplashScreen;
