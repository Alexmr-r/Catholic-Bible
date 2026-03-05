import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface SplashScreenProps {
  onFinish: () => void;
  readyToLeave: boolean;
}

const MIN_DISPLAY_MS = 1500;

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, readyToLeave }) => {
  const { colors, isDarkMode } = useTheme();

  // Empieza en opacity 1 — sin fade-in.
  // La splash nativa de iOS muestra exactamente el mismo logo y fondo ivory,
  // así que la transición nativa→React es completamente invisible.
  // Solo se anima el fade-OUT cuando navega a Login.
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const leavingRef = useRef(false);
  const minTimeElapsed = useRef(false);
  const authReadyRef = useRef(false);

  useEffect(() => {
    const minTimer = setTimeout(() => {
      minTimeElapsed.current = true;
      if (authReadyRef.current) {
        startFadeOut();
      }
    }, MIN_DISPLAY_MS);
    return () => clearTimeout(minTimer);
  }, []);

  useEffect(() => {
    if (readyToLeave && !authReadyRef.current) {
      authReadyRef.current = true;
      if (minTimeElapsed.current) {
        startFadeOut();
      }
    }
  }, [readyToLeave]);

  const startFadeOut = () => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => onFinish());
  };

  const bgColor = isDarkMode ? colors.background.dark : colors.ivory.DEFAULT;

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColor, opacity: fadeAnim }]}>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
  },
});

export default SplashScreen;
