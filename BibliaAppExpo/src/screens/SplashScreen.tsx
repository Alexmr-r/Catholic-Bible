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
  
  // 1. Siempre claro para coincidir con el Splash nativo
  const initialBg = '#FAF9F6';
  const targetBg = '#FAF9F6'; // Mantenemos blanco para que no haya cambios de color durante el logo

  const fadeAnim = useRef(new Animated.Value(1)).current;
  
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

  const backgroundColor = initialBg;

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
    width: width * 0.55, // Aumentado de 0.4 a 0.55 para que el logo se vea más imponente
    height: width * 0.55,
  },
});

export default SplashScreen;
