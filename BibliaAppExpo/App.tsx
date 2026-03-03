import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { TextSettingsProvider } from './src/contexts/TextSettingsContext';
import { NetworkProvider } from './src/contexts/NetworkContext';

import { ThemeProvider } from './src/contexts/ThemeContext';

import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NetworkProvider>
          <AuthProvider>
            <TextSettingsProvider>
              <StatusBar style="auto" />
              <AppNavigator />
            </TextSettingsProvider>
          </AuthProvider>
        </NetworkProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

