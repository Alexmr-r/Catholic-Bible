import React, {useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator, NativeStackScreenProps} from '@react-navigation/native-stack';
import {createBottomTabNavigator, BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {CompositeScreenProps} from '@react-navigation/native';
import {MaterialIcons} from '@expo/vector-icons';
import {colors} from '../theme/colors';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
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

// =====================================================
// 🎯 TIPOS DE NAVEGACIÓN - Mejores Prácticas
// =====================================================

// Stack Navigator (Auth + Main)
export type RootStackParamList = {
  Auth: undefined;           // Stack de autenticación
  MainTabs: undefined;       // Tab navigator principal
  OldTestament: undefined;   // Pantalla de libros del Antiguo Testamento
  NewTestament: undefined;   // Pantalla de libros del Nuevo Testamento
  BookChapters: {            // Pantalla genérica de capítulos de un libro
    bookId: string;
    bookName: string;
    totalChapters: number;
    testament: 'old' | 'new';
  };
  GenesisChapters: undefined; // Pantalla de capítulos de Génesis (legacy)
  GenesisReading: undefined;  // Pantalla de lectura de Génesis (legacy)
  MatthewChapters: undefined; // Pantalla de capítulos de San Mateo (legacy)
  ChapterReading: {           // Pantalla de lectura de capítulo (dinámica)
    bookId: string;
    bookName: string;
    chapter: number;
    // Desde favoritos: ocultar navegación
    fromFavorite?: boolean;
    // Opcional: para mostrar versículos específicos (desde favoritos)
    favoriteVerseNumber?: number;  // Versículo inicial
    favoriteVerseEnd?: number;     // Versículo final (para rangos como 1-5)
  };
  WritingDetail: {
    writingId: string;
    title: string;
    content: string;
    bookId?: string;
    bookName?: string;
    chapter?: number;
    verse?: number;
    tags?: string[];
    createdAt: string;
    isFavorite: boolean;
  };
  EditWriting: {
    writingId: string;
    initialTitle: string;
    initialContent: string;
    bookName?: string;
    chapter?: number;
    verse?: number;
    verseText?: string;
    createdAt: string;
  };
  ReadingCalendar: undefined;
};

// Auth Stack (Login, Register, ForgotPassword)
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// Tab Navigator (Pantallas principales con bottom bar)
export type MainTabsParamList = {
  DailyReading: undefined;
  BibleSearch: undefined;
  Writings: undefined;
  Favorites: undefined;
};

// =====================================================
// 🏷️ TIPOS DE PROPS POR PANTALLA
// =====================================================

// Auth Screens - Ahora tienen acceso a RootStack para navegar a MainTabs
export type LoginScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AuthStackParamList, 'Login'>,
  NativeStackScreenProps<RootStackParamList>
>;
export type RegisterScreenProps = CompositeScreenProps<
  NativeStackScreenProps<AuthStackParamList, 'Register'>,
  NativeStackScreenProps<RootStackParamList>
>;

// Main Tab Screens
export type DailyReadingScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, 'DailyReading'>,
  NativeStackScreenProps<RootStackParamList>
>;
export type BibleSearchScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, 'BibleSearch'>,
  NativeStackScreenProps<RootStackParamList>
>;
export type WritingsScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, 'Writings'>,
  NativeStackScreenProps<RootStackParamList>
>;
export type FavoritesScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, 'Favorites'>,
  NativeStackScreenProps<RootStackParamList>
>;

// Stack Screens (navegación modal/stack desde tabs)
export type OldTestamentScreenProps = NativeStackScreenProps<RootStackParamList, 'OldTestament'>;
export type NewTestamentScreenProps = NativeStackScreenProps<RootStackParamList, 'NewTestament'>;
export type BookChaptersScreenProps = NativeStackScreenProps<RootStackParamList, 'BookChapters'>;
export type GenesisChaptersScreenProps = NativeStackScreenProps<RootStackParamList, 'GenesisChapters'>;
export type MatthewChaptersScreenProps = NativeStackScreenProps<RootStackParamList, 'MatthewChapters'>;
export type ChapterReadingScreenProps = NativeStackScreenProps<RootStackParamList, 'ChapterReading'>;
export type GenesisReadingScreenProps = NativeStackScreenProps<RootStackParamList, 'GenesisReading'>;

// =====================================================
// 📱 NAVIGATORS
// =====================================================

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabsParamList>();

// ✅ Auth Stack Navigator (Login, Register)
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: colors.cream,
        },
      }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

// ✅ Main Tabs Navigator (Bottom Bar)
const MainTabsNavigator = () => {
  return (
    <MainTabs.Navigator
      initialRouteName="DailyReading"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.cream,
          borderTopWidth: 1,
          borderTopColor: colors.ivory.border,
          paddingTop: 12,
          paddingBottom: 20, // Reducido de 32 - el safe area se agrega automáticamente
          height: 90, // Aumentado de 80 para más espacio total
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -5},
          shadowOpacity: 0.05,
          shadowRadius: 12,
        },
        tabBarActiveTintColor: colors.primary.DEFAULT,
        tabBarInactiveTintColor: colors.ink.light,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
      }}>
      <MainTabs.Screen
        name="DailyReading"
        component={DailyReadingScreen}
        options={{
          tabBarLabel: 'Lectura',
          tabBarIcon: ({color, size}) => (
            <MaterialIcons name="auto-stories" size={size} color={color} />
          ),
        }}
      />
      <MainTabs.Screen
        name="BibleSearch"
        component={BibleSearchScreen}
        options={{
          tabBarLabel: 'Biblia',
          tabBarIcon: ({color, size}) => (
            <MaterialIcons name="menu-book" size={size} color={color} />
          ),
        }}
      />
      <MainTabs.Screen
        name="Writings"
        component={WritingsScreen}
        options={{
          tabBarLabel: 'Escritos',
          tabBarIcon: ({color, size}) => (
            <MaterialIcons name="history-edu" size={size} color={color} />
          ),
        }}
      />
      <MainTabs.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarLabel: 'Favoritos',
          tabBarIcon: ({color, size}) => (
            <MaterialIcons name="bookmark" size={size} color={color} />
          ),
        }}
      />
    </MainTabs.Navigator>
  );
};

// ✅ Root Navigator (Main App)
const AppNavigator: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  // Si estamos en splash, mostrar SplashScreen
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Después del splash, mostrar navegación normal
  return (
    <NavigationContainer>
      <RootStack.Navigator
        initialRouteName="Auth"
        screenOptions={{
          headerShown: false,
        }}>
        <RootStack.Screen name="Auth" component={AuthNavigator} />
        <RootStack.Screen name="MainTabs" component={MainTabsNavigator} />
        <RootStack.Screen
          name="OldTestament"
          component={OldTestamentScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        <RootStack.Screen
          name="NewTestament"
          component={NewTestamentScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        <RootStack.Screen
          name="BookChapters"
          component={BookChaptersScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        <RootStack.Screen
          name="GenesisChapters"
          component={GenesisChaptersScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        <RootStack.Screen
          name="MatthewChapters"
          component={MatthewChaptersScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        <RootStack.Screen
          name="ChapterReading"
          component={ChapterReadingScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        <RootStack.Screen
          name="WritingDetail"
          component={WritingDetailScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        <RootStack.Screen
          name="EditWriting"
          component={EditWritingScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        <RootStack.Screen
          name="ReadingCalendar"
          component={ReadingCalendarScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        <RootStack.Screen
          name="GenesisReading"
          component={GenesisReadingScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

