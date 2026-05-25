import { StatusBar } from 'expo-status-bar';
import * as ExpoSplashScreen from 'expo-splash-screen';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { TextSettingsProvider } from './src/contexts/TextSettingsContext';
import { NetworkProvider } from './src/contexts/NetworkContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { SubscriptionProvider } from './src/contexts/SubscriptionContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import React from 'react';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { REVENUECAT_KEYS } from './src/services/revenuecatConfig';

// Mantener la splash nativa visible hasta que auth resuelva
ExpoSplashScreen.preventAutoHideAsync();

// 🚀 PRODUCTION READY: Disable logs in production environments
if (!__DEV__) {
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  console.error = () => {};
}

import { useFonts, Lora_400Regular } from '@expo-google-fonts/lora';
import { useFonts as useInterFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Text, TextInput } from 'react-native';

import { GlobalToast } from './src/components/GlobalToast';

// Set global font family to match Apple's San Francisco as requested
interface TextWithDefaultProps {
  defaultProps?: { style?: any };
}
((Text as unknown) as TextWithDefaultProps).defaultProps = ((Text as unknown) as TextWithDefaultProps).defaultProps || {};
((Text as unknown) as TextWithDefaultProps).defaultProps!.style = { fontFamily: 'Inter_500Medium' };

((TextInput as unknown) as TextWithDefaultProps).defaultProps = ((TextInput as unknown) as TextWithDefaultProps).defaultProps || {};
((TextInput as unknown) as TextWithDefaultProps).defaultProps!.style = { fontFamily: 'Inter_500Medium' };

export default function App() {
  // Cargar fuentes personalizadas para garantizar igualdad entre iOS y Android
  let [loraLoaded] = useFonts({
    Lora_400Regular,
  });

  let [interLoaded] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!loraLoaded || !interLoaded) {
    return null;
  }

  // La inicialización de RevenueCat ahora se hace de forma segura en SubscriptionContext.tsx

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NetworkProvider>
          <AuthProvider>
            <SubscriptionProvider>
              <TextSettingsProvider>
                <StatusBar style="auto" />
                <AppNavigator />
                <GlobalToast />
              </TextSettingsProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </NetworkProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
