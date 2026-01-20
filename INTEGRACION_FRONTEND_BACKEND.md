# 🔌 Plan de Integración Frontend-Backend

## Estado actual

### ✅ COMPLETADO:
1. **AuthContext** - Contexto de autenticación creado
2. **LoginScreen** - Conectado con API real
3. **RegisterScreen** - Conectado con API real
4. **App.tsx** - Envuelto con AuthProvider
5. **AsyncStorage** - Instalado para guardar tokens
6. **OldTestamentScreen** - Conectado con API de libros ✅
7. **NewTestamentScreen** - Conectado con API de libros ✅
8. **BookChaptersScreen** - Pantalla de selección de capítulos ✅
9. **ChapterReadingScreen** - Conectado con API de capítulos ✅
10. **FavoritesScreen** - Conectado con API de favoritos ✅
11. **BibleSearchScreen** - Conectado con API de búsqueda ✅
12. **Añadir/Eliminar favoritos** - Funcionalidad completa ✅

### 🔄 PENDIENTE:
1. DailyReadingScreen - Conectar con API de lectura diaria
2. WritingsScreen - Conectar con API de escritos personales
3. Resaltados y notas en versículos

## Pantallas y sus conexiones con la API

| Pantalla | Endpoint Backend | Estado |
|----------|-----------------|--------|
| LoginScreen | POST /auth/login | ✅ Conectado |
| RegisterScreen | POST /auth/register | ✅ Conectado |
| OldTestamentScreen | GET /bible/books/old-testament | ✅ Conectado |
| NewTestamentScreen | GET /bible/books/new-testament | ✅ Conectado |
| BookChaptersScreen | GET /bible/books/{bookId} | ✅ Conectado |
| ChapterReadingScreen | GET /bible/books/{bookId}/chapters/{num} | ✅ Conectado |
| **ChapterReadingScreen (Favoritos)** | **POST /favorites** | **✅ Conectado** |
| FavoritesScreen | GET /favorites | ✅ Conectado |
| **FavoritesScreen (Eliminar)** | **DELETE /favorites/{id}** | **✅ Conectado** |
| **FavoritesScreen (Navegación)** | - | **✅ Navega a ChapterReading** |
| BibleSearchScreen | GET /bible/search | ✅ Conectado |
| DailyReadingScreen | GET /daily-readings/today | 🔄 Pendiente |
| WritingsScreen | - | 🔄 Pendiente |

## Servicios ya creados (en src/services/):

- ✅ `api.client.ts` - Cliente HTTP con autenticación
- ✅ `auth.service.ts` - Login, register, logout, refresh
- ✅ `bible.service.ts` - Libros, capítulos, búsqueda
- ✅ `favorites.service.ts` - CRUD de favoritos
- ✅ `config.ts` - Configuración de URL de API

## Arquitectura de la integración:

```
App.tsx
└── AuthProvider (contexto global)
    └── AppNavigator
        ├── LoginScreen ─────── useAuth() → authService → API /auth/login
        ├── RegisterScreen ──── useAuth() → authService → API /auth/register
        └── MainTabs
            ├── DailyReadingScreen ─── bibleService → API /daily-readings
            ├── OldTestamentScreen ─── bibleService → API /bible/books/old-testament
            ├── NewTestamentScreen ─── bibleService → API /bible/books/new-testament
            ├── FavoritesScreen ────── favoritesService → API /favorites
            └── BibleSearchScreen ──── bibleService → API /bible/search
```

## Próximos pasos:

1. Verificar errores de TypeScript
2. Probar Login y Register con el backend
3. Conectar pantallas de listado de libros
4. Conectar pantalla de lectura de capítulos
5. Conectar pantalla de favoritos
6. Conectar pantalla de búsqueda

## Comandos para probar:

```bash
# 1. Levantar backend
./dev-start.sh

# 2. En otra terminal, verificar que la API responde
curl http://localhost:8080/api/v1/actuator/health

# 3. Probar registro
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "Test1234!",
    "fullName": "Test User"
  }'

# 4. Probar login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "Test1234!"
  }'
```

## Notas importantes:

1. **URL de la API**: Configurada en `src/services/config.ts`
   - Para emulador Android: `http://10.0.2.2:8080/api/v1`
   - Para iOS Simulator/Web: `http://localhost:8080/api/v1`
   - Para dispositivo físico: `http://TU_IP:8080/api/v1`

2. **Tokens**: Se guardan en AsyncStorage automáticamente

3. **Errores de red**: El cliente API maneja errores y los muestra

