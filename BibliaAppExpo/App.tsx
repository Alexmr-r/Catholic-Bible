import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { TextSettingsProvider } from './src/contexts/TextSettingsContext';
import { NetworkProvider } from './src/contexts/NetworkContext';

export default function App() {
  return (
    <NetworkProvider>
      <AuthProvider>
        <TextSettingsProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </TextSettingsProvider>
      </AuthProvider>
    </NetworkProvider>
  );
}

