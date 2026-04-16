import { StatusBar } from 'expo-status-bar';
import * as ExpoSplashScreen from 'expo-splash-screen';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { TextSettingsProvider } from './src/contexts/TextSettingsContext';
import { NetworkProvider } from './src/contexts/NetworkContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { SubscriptionProvider } from './src/contexts/SubscriptionContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Mantener la splash nativa visible hasta que auth resuelva
ExpoSplashScreen.preventAutoHideAsync();

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NetworkProvider>
          <AuthProvider>
            <SubscriptionProvider>
              <TextSettingsProvider>
                <StatusBar style="auto" />
                <AppNavigator />
              </TextSettingsProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </NetworkProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
