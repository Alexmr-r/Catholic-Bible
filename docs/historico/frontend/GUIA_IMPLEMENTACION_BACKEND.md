# 🔌 Guía de Implementación Backend

**Objetivo:** Convertir la demo funcional en una aplicación completa con backend

---

## 📋 Índice

1. [API Endpoints Necesarios](#api-endpoints-necesarios)
2. [Modelos de Base de Datos](#modelos-de-base-de-datos)
3. [Integración Frontend-Backend](#integración-frontend-backend)
4. [Autenticación y Autorización](#autenticación-y-autorización)
5. [Caché y Performance](#caché-y-performance)
6. [Migración de Datos Mock](#migración-de-datos-mock)

---

## 🌐 API Endpoints Necesarios

### 1. **Autenticación** (`/api/auth`)

```typescript
// POST /api/auth/register
interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

interface RegisterResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// POST /api/auth/social
interface SocialAuthRequest {
  provider: 'google' | 'apple';
  token: string;
}

// POST /api/auth/refresh
interface RefreshTokenRequest {
  refreshToken: string;
}

// POST /api/auth/logout
interface LogoutRequest {
  token: string;
}
```

**Implementación en Frontend:**

```typescript
// services/auth.service.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export class AuthService {
  private static API_URL = process.env.EXPO_PUBLIC_API_URL;
  
  static async login(email: string, password: string) {
    const response = await fetch(`${this.API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    const data = await response.json();
    await AsyncStorage.setItem('authToken', data.token);
    await AsyncStorage.setItem('refreshToken', data.refreshToken);
    
    return data;
  }
  
  static async register(email: string, password: string, fullName: string) {
    const response = await fetch(`${this.API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    const data = await response.json();
    await AsyncStorage.setItem('authToken', data.token);
    await AsyncStorage.setItem('refreshToken', data.refreshToken);
    
    return data;
  }
  
  static async logout() {
    const token = await AsyncStorage.getItem('authToken');
    
    await fetch(`${this.API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('refreshToken');
  }
}
```

---

### 2. **Contenido Bíblico** (`/api/bible`)

```typescript
// GET /api/bible/books
interface BooksResponse {
  old_testament: Book[];
  new_testament: Book[];
}

// GET /api/bible/books/:bookId
interface BookDetailResponse {
  book: Book;
  chapters: number;
  description: string;
  author: string;
  historicalContext: string;
}

// GET /api/bible/books/:bookId/chapters/:chapterNumber
interface ChapterResponse {
  book: string;
  chapter: number;
  version: string;
  sections: Section[];
  previousChapter?: ChapterReference;
  nextChapter?: ChapterReference;
}

// GET /api/bible/verses/:reference
interface VerseResponse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  version: string;
}

// GET /api/bible/search
interface SearchRequest {
  query: string;
  testament?: 'old' | 'new' | 'all';
  books?: string[];
  limit?: number;
  offset?: number;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  hasMore: boolean;
}

interface SearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  highlightedText: string; // Con <mark> tags
}
```

**Implementación en Frontend:**

```typescript
// services/bible.service.ts
export class BibleService {
  private static API_URL = process.env.EXPO_PUBLIC_API_URL;
  
  static async getBooks(): Promise<BooksResponse> {
    const token = await AsyncStorage.getItem('authToken');
    
    const response = await fetch(`${this.API_URL}/bible/books`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch books');
    }
    
    return response.json();
  }
  
  static async getChapter(
    bookId: string,
    chapterNumber: number
  ): Promise<ChapterResponse> {
    const token = await AsyncStorage.getItem('authToken');
    
    const response = await fetch(
      `${this.API_URL}/bible/books/${bookId}/chapters/${chapterNumber}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch chapter');
    }
    
    return response.json();
  }
  
  static async searchVerses(query: string): Promise<SearchResponse> {
    const token = await AsyncStorage.getItem('authToken');
    
    const response = await fetch(
      `${this.API_URL}/bible/search?query=${encodeURIComponent(query)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Search failed');
    }
    
    return response.json();
  }
}
```

**Integración con React Query:**

```typescript
// hooks/useBible.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';

export function useChapter(bookId: string, chapterNumber: number) {
  return useQuery({
    queryKey: ['chapter', bookId, chapterNumber],
    queryFn: () => BibleService.getChapter(bookId, chapterNumber),
    staleTime: 1000 * 60 * 60, // 1 hora
    cacheTime: 1000 * 60 * 60 * 24, // 24 horas
  });
}

export function useBooks() {
  return useQuery({
    queryKey: ['books'],
    queryFn: () => BibleService.getBooks(),
    staleTime: 1000 * 60 * 60 * 24, // 24 horas
  });
}

export function useSearchVerses(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => BibleService.searchVerses(query),
    enabled: query.length > 2, // Solo buscar si hay más de 2 caracteres
  });
}
```

**Uso en Componentes:**

```typescript
// ChapterReadingScreen.tsx
import { useChapter } from '../hooks/useBible';

const ChapterReadingScreen = ({ route }) => {
  const { bookId, chapterNumber } = route.params;
  const { data, isLoading, error } = useChapter(bookId, chapterNumber);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <ErrorView message="No se pudo cargar el capítulo" />;
  }
  
  return (
    <View>
      {data.sections.map((section) => (
        <Section key={section.title} section={section} />
      ))}
    </View>
  );
};
```

---

### 3. **Lectura del Día** (`/api/daily-reading`)

```typescript
// GET /api/daily-reading?date=YYYY-MM-DD
interface DailyReadingResponse {
  date: string;
  title: string;
  badge: string; // "EVANGELIO", "SALMO", etc.
  imageUrl: string;
  reading: {
    book: string;
    chapter: number;
    verses: number[];
    text: string;
  };
  reflection?: string; // Reflexión oficial opcional
}

// POST /api/daily-reading/:id/reflection
interface SaveReflectionRequest {
  text: string;
}

// GET /api/daily-reading/history
interface ReadingHistoryResponse {
  readings: {
    date: string;
    title: string;
    read: boolean;
    reflectionSaved: boolean;
  }[];
}
```

---

### 4. **Favoritos** (`/api/favorites`)

```typescript
// GET /api/favorites
interface FavoritesResponse {
  favorites: Favorite[];
}

// POST /api/favorites
interface AddFavoriteRequest {
  book: string;
  chapter: number;
  verse: number;
  tags?: string[];
  note?: string;
}

// PUT /api/favorites/:id
interface UpdateFavoriteRequest {
  tags?: string[];
  note?: string;
  highlight?: HighlightColor;
}

// DELETE /api/favorites/:id
```

**Implementación:**

```typescript
// services/favorites.service.ts
export class FavoritesService {
  static async getFavorites(): Promise<Favorite[]> {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/favorites`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  }
  
  static async addFavorite(favorite: AddFavoriteRequest): Promise<Favorite> {
    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/favorites`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(favorite),
    });
    return response.json();
  }
  
  static async removeFavorite(id: string): Promise<void> {
    const token = await AsyncStorage.getItem('authToken');
    await fetch(`${API_URL}/favorites/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  }
}
```

---

### 5. **Notas y Escritos** (`/api/writings`)

```typescript
// GET /api/writings
interface WritingsResponse {
  writings: Writing[];
  total: number;
}

// POST /api/writings
interface CreateWritingRequest {
  title: string;
  content: string;
  verseReference?: {
    book: string;
    chapter: number;
    verse: number;
  };
  tags?: string[];
}

// PUT /api/writings/:id
// DELETE /api/writings/:id
// GET /api/writings/:id
```

---

### 6. **Resaltados** (`/api/highlights`)

```typescript
// POST /api/highlights
interface CreateHighlightRequest {
  book: string;
  chapter: number;
  verse: number;
  color: 'gold' | 'primary' | 'secondary' | 'burgundy';
}

// GET /api/highlights?book=:book&chapter=:chapter
interface HighlightsResponse {
  highlights: {
    verse: number;
    color: string;
  }[];
}

// DELETE /api/highlights/:id
```

---

## 🗄️ Modelos de Base de Datos

### Schema Propuesto (PostgreSQL)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Books (Catálogo de libros bíblicos)
CREATE TABLE books (
  id VARCHAR(50) PRIMARY KEY, -- 'genesis', 'matthew', etc.
  name VARCHAR(100) NOT NULL,
  testament VARCHAR(10) NOT NULL, -- 'old' or 'new'
  category VARCHAR(50) NOT NULL, -- 'pentateuch', 'historical', etc.
  chapters INTEGER NOT NULL,
  abbreviation VARCHAR(10) NOT NULL,
  description TEXT,
  author VARCHAR(100),
  historical_context TEXT
);

-- Chapters
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id VARCHAR(50) REFERENCES books(id),
  chapter_number INTEGER NOT NULL,
  version VARCHAR(50) DEFAULT 'jerusalem', -- 'jerusalem', 'reina-valera', etc.
  UNIQUE(book_id, chapter_number, version)
);

-- Verses
CREATE TABLE verses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id),
  verse_number INTEGER NOT NULL,
  text TEXT NOT NULL,
  has_note BOOLEAN DEFAULT false,
  UNIQUE(chapter_id, verse_number)
);

-- Sections (para organizar capítulos)
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id),
  title VARCHAR(255) NOT NULL,
  order_index INTEGER NOT NULL
);

-- Verses to Sections (relación many-to-many)
CREATE TABLE section_verses (
  section_id UUID REFERENCES sections(id),
  verse_id UUID REFERENCES verses(id),
  PRIMARY KEY (section_id, verse_id)
);

-- Favorites
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  book_id VARCHAR(50) REFERENCES books(id),
  chapter_number INTEGER NOT NULL,
  verse_number INTEGER NOT NULL,
  note TEXT,
  tags TEXT[], -- Array de tags
  created_at TIMESTAMP DEFAULT NOW()
);

-- Highlights
CREATE TABLE highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  book_id VARCHAR(50) REFERENCES books(id),
  chapter_number INTEGER NOT NULL,
  verse_number INTEGER NOT NULL,
  color VARCHAR(20) NOT NULL, -- 'gold', 'primary', etc.
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, book_id, chapter_number, verse_number)
);

-- Writings (Reflexiones personales)
CREATE TABLE writings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  verse_reference JSONB, -- {book, chapter, verse}
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Daily Readings
CREATE TABLE daily_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  badge VARCHAR(50) NOT NULL, -- 'EVANGELIO', 'SALMO', etc.
  image_url TEXT,
  book_id VARCHAR(50) REFERENCES books(id),
  chapter_number INTEGER NOT NULL,
  verses INTEGER[] NOT NULL, -- Array de números de versículos
  official_reflection TEXT
);

-- User Reading History
CREATE TABLE reading_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  daily_reading_id UUID REFERENCES daily_readings(id),
  read_at TIMESTAMP DEFAULT NOW(),
  user_reflection TEXT,
  UNIQUE(user_id, daily_reading_id)
);

-- User Progress (tracking de lectura)
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  book_id VARCHAR(50) REFERENCES books(id),
  chapter_number INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  last_read_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, book_id, chapter_number)
);

-- Search History
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  results_count INTEGER,
  searched_at TIMESTAMP DEFAULT NOW()
);

-- Refresh Tokens
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_verses_chapter ON verses(chapter_id);
CREATE INDEX idx_verses_text ON verses USING gin(to_tsvector('spanish', text));
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_highlights_user ON highlights(user_id);
CREATE INDEX idx_writings_user ON writings(user_id);
CREATE INDEX idx_reading_history_user ON reading_history(user_id);
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
```

---

## 🔄 Migración de Datos Mock a Backend

### Paso 1: Identificar datos mock en el código

**Archivos con datos mock:**
- `ChapterReadingScreen.tsx` - `MATTHEW_1_DATA`
- `GenesisReadingScreen.tsx` - `GENESIS_1_DATA`
- `DailyReadingScreen.tsx` - datos inline
- `FavoritesScreen.tsx` - array de favoritos
- `WritingsScreen.tsx` - array de escritos
- Todos los `*Screen.tsx` - datos de libros

### Paso 2: Crear servicios de migración

```typescript
// scripts/migrateToBackend.ts
import { MATTHEW_1_DATA } from '../screens/ChapterReadingScreen';
import { BibleService } from '../services/bible.service';

async function migrateChapter(data: any) {
  // Enviar a backend
  await fetch(`${API_URL}/admin/chapters`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_TOKEN}`,
    },
    body: JSON.stringify(data),
  });
}

// Ejecutar migración
migrateChapter(MATTHEW_1_DATA);
```

### Paso 3: Actualizar componentes

**Antes (con datos mock):**
```typescript
const MATTHEW_1_DATA = {
  book: 'San Mateo',
  chapter: 1,
  // ... datos
};

const ChapterReadingScreen = () => {
  const data = MATTHEW_1_DATA;
  // ...
};
```

**Después (con backend):**
```typescript
import { useChapter } from '../hooks/useBible';

const ChapterReadingScreen = ({ route }) => {
  const { bookId, chapterNumber } = route.params;
  const { data, isLoading, error } = useChapter(bookId, chapterNumber);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorView />;
  
  // Usar data del backend
  return <ChapterContent data={data} />;
};
```

---

## 🔐 Autenticación y Autorización

### Implementación de Auth Context

```typescript
// contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Verificar token al iniciar
  useEffect(() => {
    checkAuth();
  }, []);
  
  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        // Verificar si el token es válido
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          await AsyncStorage.removeItem('authToken');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const login = async (email: string, password: string) => {
    const data = await AuthService.login(email, password);
    setUser(data.user);
  };
  
  const register = async (email: string, password: string, fullName: string) => {
    const data = await AuthService.register(email, password, fullName);
    setUser(data.user);
  };
  
  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

**Uso en LoginScreen:**

```typescript
// screens/LoginScreen.tsx
import { useAuth } from '../contexts/AuthContext';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await login(email, password);
      // Navegación automática manejada por AppNavigator
    } catch (error) {
      Alert.alert('Error', 'Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    // ... UI
    <TouchableOpacity onPress={handleLogin} disabled={isLoading}>
      {isLoading ? <ActivityIndicator /> : <Text>Iniciar Sesión</Text>}
    </TouchableOpacity>
  );
};
```

**Proteger rutas:**

```typescript
// navigation/AppNavigator.tsx
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <SplashScreen />;
  }
  
  return (
    <NavigationContainer>
      <RootStack.Navigator>
        {isAuthenticated ? (
          <RootStack.Screen name="MainTabs" component={MainTabsNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
```

---

## 🚀 Optimización y Caché

### 1. Configurar React Query

```typescript
// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      cacheTime: 1000 * 60 * 30, // 30 minutos
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

### 2. Offline Support con AsyncStorage

```typescript
// services/cache.service.ts
export class CacheService {
  static async saveChapter(bookId: string, chapter: number, data: any) {
    const key = `chapter_${bookId}_${chapter}`;
    await AsyncStorage.setItem(key, JSON.stringify(data));
  }
  
  static async getChapter(bookId: string, chapter: number) {
    const key = `chapter_${bookId}_${chapter}`;
    const cached = await AsyncStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  }
}

// Usar en hooks
export function useChapter(bookId: string, chapter: number) {
  return useQuery({
    queryKey: ['chapter', bookId, chapter],
    queryFn: async () => {
      // Intentar caché primero
      const cached = await CacheService.getChapter(bookId, chapter);
      if (cached) return cached;
      
      // Si no hay caché, fetch del backend
      const data = await BibleService.getChapter(bookId, chapter);
      
      // Guardar en caché
      await CacheService.saveChapter(bookId, chapter, data);
      
      return data;
    },
  });
}
```

---

## 📊 Monitoreo y Analytics

```typescript
// services/analytics.service.ts
import * as Analytics from 'expo-firebase-analytics';

export class AnalyticsService {
  static async trackScreenView(screenName: string) {
    await Analytics.logEvent('screen_view', {
      screen_name: screenName,
      screen_class: screenName,
    });
  }
  
  static async trackChapterRead(book: string, chapter: number) {
    await Analytics.logEvent('chapter_read', {
      book,
      chapter,
      timestamp: new Date().toISOString(),
    });
  }
  
  static async trackSearch(query: string, resultsCount: number) {
    await Analytics.logEvent('search', {
      search_term: query,
      results_count: resultsCount,
    });
  }
}
```

---

## ✅ Checklist de Implementación

### Backend
- [ ] Configurar servidor (Node.js + Express o similar)
- [ ] Configurar base de datos PostgreSQL
- [ ] Implementar endpoints de autenticación
- [ ] Implementar endpoints de contenido bíblico
- [ ] Implementar sistema de favoritos
- [ ] Implementar sistema de notas
- [ ] Configurar CORS y seguridad
- [ ] Implementar rate limiting
- [ ] Configurar logging y monitoreo

### Frontend
- [ ] Instalar dependencias necesarias
- [ ] Configurar variables de entorno
- [ ] Implementar AuthContext
- [ ] Implementar servicios de API
- [ ] Migrar todos los componentes a usar backend
- [ ] Implementar manejo de errores
- [ ] Implementar loading states
- [ ] Configurar caché offline
- [ ] Implementar analytics
- [ ] Testing de integración

---

**Próximos pasos:** Ver `ARQUITECTURA_Y_MEJORAS.md` para roadmap completo

