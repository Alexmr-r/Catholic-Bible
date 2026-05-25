import React, {useState, useEffect, useRef} from 'react';
import { View, StyleSheet, Appearance, TouchableWithoutFeedback, Keyboard } from 'react-native';
import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator, NativeStackScreenProps} from '@react-navigation/native-stack';
import {createBottomTabNavigator, BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {CompositeScreenProps} from '@react-navigation/native';
import {MaterialIcons} from '@expo/vector-icons';
import {useTheme} from '../contexts/ThemeContext';
import {useAuth} from '../contexts/AuthContext';
import {t} from '../locales/i18n';
import * as ExpoSplashScreen from 'expo-splash-screen';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import DailyReadingScreen from '../screens/DailyReadingScreen';
import WritingsScreen from '../screens/WritingsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import BibleSearchScreen from "../screens/BibleSearchScreen";
import OldTestamentScreen from "../screens/OldTestamentScreen";
import NewTestamentScreen from "../screens/NewTestamentScreen";
import GenesisChaptersScreen from "../screens/GenesisChaptersScreen";
import GenesisReadingScreen from "../screens/GenesisReadingScreen";
import MatthewChaptersScreen from "../screens/MatthewChaptersScreen";
import ChapterReadingScreen from "../screens/ChapterReadingScreen";
import BookChaptersScreen from "../screens/BookChaptersScreen";
import WritingDetailScreen from "../screens/WritingDetailScreen";
import EditWritingScreen from "../screens/EditWritingScreen";
import ReadingCalendarScreen from "../screens/ReadingCalendarScreen";
import ProfileScreen from "../screens/ProfileScreen";
import HelpSupportScreen from "../screens/HelpSupportScreen";
import ReadingSettingsScreen from "../screens/ReadingSettingsScreen";
import AccountScreen from "../screens/AccountScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import WritingsHelpScreen from "../screens/WritingsHelpScreen";
import FavoritesHelpScreen from "../screens/FavoritesHelpScreen";
import OfflineHelpScreen from "../screens/OfflineHelpScreen";
import ManageDownloadsScreen from "../screens/ManageDownloadsScreen";
import AudioPlayerOverlay from "../components/AudioPlayerOverlay";
import AIAssistantScreen from "../screens/AIAssistantScreen";
import PaywallScreen from "../screens/PaywallScreen";
import { useSubscription } from "../contexts/SubscriptionContext";

// =====================================================
// 🎯 TIPOS DE NAVEGACIÓN
// =====================================================

export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  Profile: undefined;
  Account: undefined;
  ChangePassword: undefined;
  HelpSupport: undefined;
  ReadingSettings: undefined;
  DailyReading: { date?: string };
  OldTestament: undefined;
  NewTestament: undefined;
  BookChapters: { bookId: string; bookName: string; totalChapters: number; testament: 'old' | 'new' };
  GenesisChapters: undefined;
  GenesisReading: undefined;
  MatthewChapters: undefined;
  ChapterReading: {
    bookId: string; bookName: string; chapter: number; testament?: 'old' | 'new';
    fromFavorite?: boolean; favoriteVerseNumber?: number; favoriteVerseEnd?: number
  };
  WritingDetail: {
    writingId: string; title: string; content: string; bookId?: string; bookName?: string;
    chapter?: number; verse?: number; tags?: string[]; createdAt: string; isFavorite: boolean
  };
  EditWriting: {
    writingId: string; initialTitle: string; initialContent: string; bookId?: string;
    bookName?: string; chapter?: number; verse?: number; verseText?: string; createdAt: string
  };
  ReadingCalendar: undefined;
  WritingsHelp: undefined;
  FavoritesHelp: undefined;
  OfflineHelp: undefined;
  ManageDownloads: { returnTo?: 'OldTestament' | 'NewTestament' | 'Profile' } | undefined;
  AIAssistant: { bookName?: string; chapter?: number; verse?: number; verseText?: string; } | undefined;
  Paywall: undefined;
};

export type AuthStackParamList = { Login: undefined; Register: undefined; ForgotPassword: undefined; };
export type MainTabsParamList = { DailyReading: { date?: string } | undefined; BibleSearch: undefined; Writings: undefined; Favorites: undefined; };

export type LoginScreenProps = CompositeScreenProps<NativeStackScreenProps<AuthStackParamList, 'Login'>, NativeStackScreenProps<RootStackParamList>>;
export type RegisterScreenProps = CompositeScreenProps<NativeStackScreenProps<AuthStackParamList, 'Register'>, NativeStackScreenProps<RootStackParamList>>;
export type ForgotPasswordScreenProps = CompositeScreenProps<NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>, NativeStackScreenProps<RootStackParamList>>;
export type DailyReadingScreenProps = CompositeScreenProps<BottomTabScreenProps<MainTabsParamList, 'DailyReading'>, NativeStackScreenProps<RootStackParamList>>;
export type BibleSearchScreenProps = CompositeScreenProps<BottomTabScreenProps<MainTabsParamList, 'BibleSearch'>, NativeStackScreenProps<RootStackParamList>>;
export type WritingsScreenProps = CompositeScreenProps<BottomTabScreenProps<MainTabsParamList, 'Writings'>, NativeStackScreenProps<RootStackParamList>>;
export type FavoritesScreenProps = CompositeScreenProps<BottomTabScreenProps<MainTabsParamList, 'Favorites'>, NativeStackScreenProps<RootStackParamList>>;
export type ChapterReadingScreenProps = NativeStackScreenProps<RootStackParamList, 'ChapterReading'>;
export type OldTestamentScreenProps = NativeStackScreenProps<RootStackParamList, 'OldTestament'>;
export type NewTestamentScreenProps = NativeStackScreenProps<RootStackParamList, 'NewTestament'>;
export type BookChaptersScreenProps = NativeStackScreenProps<RootStackParamList, 'BookChapters'>;
export type GenesisChaptersScreenProps = NativeStackScreenProps<RootStackParamList, 'GenesisChapters'>;
export type GenesisReadingScreenProps = NativeStackScreenProps<RootStackParamList, 'GenesisReading'>;
export type MatthewChaptersScreenProps = NativeStackScreenProps<RootStackParamList, 'MatthewChapters'>;
export type ChangePasswordScreenProps = NativeStackScreenProps<RootStackParamList, 'ChangePassword'>;
export type AccountScreenProps = NativeStackScreenProps<RootStackParamList, 'Account'>;
export type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'Profile'>;
export type ReadingSettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'ReadingSettings'>;
export type ReadingCalendarScreenProps = NativeStackScreenProps<RootStackParamList, 'ReadingCalendar'>;
export type HelpSupportScreenProps = NativeStackScreenProps<RootStackParamList, 'HelpSupport'>;
export type AIAssistantScreenProps = NativeStackScreenProps<RootStackParamList, 'AIAssistant'>;

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabsParamList>();

const AuthNavigator = () => {
  const { colors, isDarkMode } = useTheme();
  return (
    <AuthStack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: isDarkMode ? colors.background.dark : colors.cream },
      }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
};

const MainTabsNavigator = () => {
  const { colors, isDarkMode } = useTheme();
  return (
    <MainTabs.Navigator
      initialRouteName="DailyReading"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDarkMode ? colors.background.dark : colors.cream,
          borderTopWidth: 1, borderTopColor: colors.ivory.border, paddingTop: 8, paddingBottom: 8, height: 85,
        },
        tabBarActiveTintColor: colors.primary.DEFAULT, 
        tabBarInactiveTintColor: colors.charcoal.muted, 
      }}>
      <MainTabs.Screen name="DailyReading" component={DailyReadingScreen} options={{ tabBarLabel: t('navigation.home') || 'Reading', tabBarIcon: ({color}) => (<MaterialIcons name="auto-stories" size={30} color={color} />) }} />
      <MainTabs.Screen name="BibleSearch" component={BibleSearchScreen} options={{ tabBarLabel: 'Bible', tabBarIcon: ({color}) => (<MaterialIcons name="menu-book" size={30} color={color} />) }} />
      <MainTabs.Screen name="Writings" component={WritingsScreen} options={{ tabBarLabel: t('navigation.writings') || 'Writings', tabBarIcon: ({color}) => (<MaterialIcons name="history-edu" size={30} color={color} />) }} />
      <MainTabs.Screen name="Favorites" component={FavoritesScreen} options={{ tabBarLabel: t('navigation.favorites') || 'Favorites', tabBarIcon: ({color}) => (<MaterialIcons name="bookmark" size={30} color={color} />) }} />
    </MainTabs.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [appFullyReady, setAppFullyReady] = useState(false);
  const { isThemeLoading, isDarkMode } = useTheme();
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const { hasAccess } = useSubscription();
  
  const isEverythingLoaded = !isThemeLoading && !isAuthLoading;
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (isEverythingLoaded && !hasStarted) {
      setHasStarted(true);
    }
  }, [isEverythingLoaded]);

  useEffect(() => {
    if (hasStarted) {
      const timer = setTimeout(() => {
        ExpoSplashScreen.hideAsync().catch(() => {});
        setAppFullyReady(true);
      }, 1200); // Aumentado de 500ms a 1200ms para que se sienta más premium
      return () => clearTimeout(timer);
    }
  }, [hasStarted]);

  const navTheme = isDarkMode ? DarkTheme : DefaultTheme;

  return (
    <View style={styles.container}>
      {hasStarted && (
        <NavigationContainer theme={navTheme}>
          <RootStack.Navigator
            screenOptions={{ headerShown: false, animation: 'fade', animationDuration: 400 }}>
            
            {isAuthenticated ? (
              // 🔒 HARD PAYWALL — Producción: descomentar hasAccess cuando RevenueCat esté configurado
              // Para activar: envolver con: hasAccess ? (<>..screens..</>) : (<Paywall/>)
              hasAccess ? (
                <>
                  <RootStack.Screen name="MainTabs" component={MainTabsNavigator} />
                  <RootStack.Screen name="Profile" component={ProfileScreen} options={{ animation: 'slide_from_right' }} />
                  <RootStack.Screen name="Account" component={AccountScreen} options={{ animation: 'slide_from_right' }} />
                  <RootStack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ animation: 'slide_from_right' }} />
                  <RootStack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ animation: 'slide_from_right' }} />
                  <RootStack.Screen name="ReadingSettings" component={ReadingSettingsScreen} options={{ animation: 'slide_from_right' }} />
                  <RootStack.Screen name="DailyReading" component={DailyReadingScreen} options={{ animation: 'slide_from_right' }} />
                  <RootStack.Screen name="WritingsHelp" component={WritingsHelpScreen} options={{ animation: 'slide_from_right' }} />
                  <RootStack.Screen name="FavoritesHelp" component={FavoritesHelpScreen} options={{ animation: 'slide_from_right' }} />
                  <RootStack.Screen name="OfflineHelp" component={OfflineHelpScreen} options={{ animation: 'slide_from_right' }} />
                  <RootStack.Screen name="ManageDownloads" component={ManageDownloadsScreen} options={{ animation: 'slide_from_right' }} />
                  <RootStack.Screen name="OldTestament" component={OldTestamentScreen} options={{ animation: 'slide_from_right' }} />
                  <RootStack.Screen name="NewTestament" component={NewTestamentScreen} options={{ animation: 'slide_from_right' }} />
                  <RootStack.Screen name="BookChapters" component={BookChaptersScreen} options={{ animation: 'slide_from_right' }} />
                  <RootStack.Screen name="GenesisChapters" component={GenesisChaptersScreen} options={{ animation: 'slide_from_right' }} />
                  <RootStack.Screen name="MatthewChapters" component={MatthewChaptersScreen} options={{ animation: 'slide_from_right' }} />
                  <RootStack.Screen name="ChapterReading" component={ChapterReadingScreen} options={{ animation: 'slide_from_right' }} />
                  <RootStack.Screen name="WritingDetail" component={WritingDetailScreen} options={{ animation: 'slide_from_right' }} />
                  <RootStack.Screen name="EditWriting" component={EditWritingScreen} options={{ animation: 'slide_from_right' }} />
                  <RootStack.Screen name="ReadingCalendar" component={ReadingCalendarScreen} options={{ animation: 'slide_from_right' }} />
                  <RootStack.Screen name="GenesisReading" component={GenesisReadingScreen} options={{ animation: 'slide_from_right' }} />
                  <RootStack.Screen name="AIAssistant" component={AIAssistantScreen} options={{ animation: 'slide_from_right' }} />
                  <RootStack.Screen name="Paywall" component={PaywallScreen} options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
                </>
              ) : (
                // 🚫 Sin acceso: muro ineludible — no hay X para cerrar
                <RootStack.Screen name="Paywall" component={PaywallScreen} options={{ animation: 'fade' }} />
              )
            ) : (
              <RootStack.Screen name="Auth" component={AuthNavigator} />
            )}
          </RootStack.Navigator>
        </NavigationContainer>
      )}
      
      {hasStarted && <AudioPlayerOverlay />}
      
      {showSplash && !isThemeLoading && (
        <SplashScreen
          readyToLeave={appFullyReady}
          onFinish={() => setShowSplash(false)}
        />
      )}

      {(isThemeLoading || !hasStarted) && (
        <View style={[styles.container, { backgroundColor: '#FAF9F6' }]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1 } });
export default AppNavigator;
