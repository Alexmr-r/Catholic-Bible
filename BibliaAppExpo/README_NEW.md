# 📖 Biblia App - Aplicación Móvil de Lectura Bíblica

[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~54.0-black)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-~5.9.2-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red)]()

Aplicación móvil moderna para lectura y estudio de la Biblia, diseñada con enfoque en la experiencia del usuario y lista para presentación a inversores.

---

## 🎯 Visión General

**Biblia App** es un prototipo funcional completo que demuestra las capacidades de una aplicación de lectura bíblica de nueva generación. Incluye:

- ✅ 12 pantallas completamente funcionales
- ✅ Sistema de navegación robusto
- ✅ UI/UX premium con diseño coherente
- ✅ Arquitectura escalable lista para backend
- ✅ Código TypeScript tipado y documentado

---

## 📱 Características Principales

### 🔐 Autenticación
- Login con email/contraseña
- Integración con Apple y Google (preparado)
- Recuperación de contraseña
- Registro de nuevos usuarios

### 📖 Lectura Bíblica
- **Lectura del día** con imagen inspiracional
- **Navegación por libros** (Antiguo y Nuevo Testamento)
- **Lectura de capítulos** con versículos formateados
- **Selección de versículos** con toolbar flotante
- **Sistema de secciones** para mejor organización

### 🔍 Búsqueda y Navegación
- Búsqueda de versículos por texto
- Búsqueda por voz (preparado)
- Historial de búsquedas recientes
- Navegación rápida entre capítulos
- **Header y barra de búsqueda fijos** ✨ Nuevo

### ⭐ Gestión Personal
- **Favoritos** con categorización y búsqueda en tiempo real
- **Notas personales** vinculadas a versículos
- **Resaltado de versículos** con colores personalizables
- **Reflexiones diarias** privadas

### 🎨 Experiencia de Usuario
- Diseño minimalista y elegante
- Animaciones fluidas
- FAB inteligente que se oculta al scrollear
- Scroll optimizado sin espacios extra
- Sistema de colores coherente
- Mensajes profesionales para demos

---

## 🚀 Inicio Rápido

### Para Demostración Rápida (Expo Go)

```bash
# 1. Instalar Expo Go en tu móvil
# iOS: App Store → "Expo Go"
# Android: Play Store → "Expo Go"

# 2. Iniciar servidor
npm install
npm start

# 3. Escanear QR con Expo Go
# ¡La app se carga en segundos!
```

### Para Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en simulador iOS
npm run ios

# Ejecutar en emulador Android
npm run android

# Modo web (testing)
npm run web
```

---

## 🏗️ Arquitectura

```
BibliaAppExpo/
├── src/
│   ├── components/          # Componentes reutilizables
│   ├── navigation/          # Sistema de navegación
│   │   └── AppNavigator.tsx
│   ├── screens/            # 12 pantallas principales
│   │   ├── Auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── Main/
│   │   │   ├── DailyReadingScreen.tsx
│   │   │   ├── BibleSearchScreen.tsx
│   │   │   ├── WritingsScreen.tsx
│   │   │   └── FavoritesScreen.tsx
│   │   └── Bible/
│   │       ├── OldTestamentScreen.tsx
│   │       ├── NewTestamentScreen.tsx
│   │       ├── GenesisChaptersScreen.tsx
│   │       ├── MatthewChaptersScreen.tsx
│   │       ├── GenesisReadingScreen.tsx
│   │       └── ChapterReadingScreen.tsx
│   └── theme/
│       └── colors.ts       # Sistema de colores
├── assets/                 # Recursos visuales
└── docs/                   # Documentación exhaustiva
```

### Stack Tecnológico

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| React Native | 0.81.5 | Framework principal |
| Expo | ~54.0 | Tooling y desarrollo |
| TypeScript | ~5.9.2 | Tipado estático |
| React Navigation | 7.x | Navegación |
| Material Icons | 15.x | Iconografía |
| Linear Gradient | 15.x | Efectos visuales |

---

## 📚 Documentación Completa

### 📖 Documentos Principales

| Documento | Descripción |
|-----------|-------------|
| [ARQUITECTURA_Y_MEJORAS.md](./ARQUITECTURA_Y_MEJORAS.md) | Visión completa, mejoras propuestas, KPIs, roadmap |
| [GUIA_IMPLEMENTACION_BACKEND.md](./GUIA_IMPLEMENTACION_BACKEND.md) | API endpoints, modelos DB, integración |
| [SISTEMA_COMPONENTES_REUTILIZABLES.md](./SISTEMA_COMPONENTES_REUTILIZABLES.md) | Componentes a extraer, código reutilizable |
| [GUIA_COLORES.md](./GUIA_COLORES.md) | Sistema de diseño y paleta de colores |
| [MEJORES_PRACTICAS_NAVEGACION.md](./MEJORES_PRACTICAS_NAVEGACION.md) | Patrones de navegación |
| [PLAN_DESARROLLO.md](./PLAN_DESARROLLO.md) | Roadmap y fases del proyecto |

### 📝 Documentos de Implementación

- Cada pantalla tiene documentación detallada de su implementación
- 20+ archivos markdown con especificaciones técnicas
- Guías de buenas prácticas y patrones

---

## 🎨 Sistema de Diseño

### Paleta de Colores

```typescript
Primary (Azul Serenidad):    #4A90A4  // Navegación, CTAs
Secondary (Verde Oliva):      #7A9E7E  // Acentos, Estados
Burgundy (Borgoña):           #A65E6E  // Títulos, Jerarquía
Gold (Oro Suave):             #C4A96F  // Badges Premium
Cream (Crema):                #F5F1E8  // Fondo principal
Charcoal (Carbón):            #36454F  // Textos
Ivory (Marfil):               #FFFFF0  // Cards, Inputs
```

### Tipografía

- **Títulos:** 28-32px, Bold (700)
- **Subtítulos:** 18-24px, SemiBold (600)
- **Lectura:** 19px, Regular (400), line-height: 34px
- **UI Elements:** 14-16px

Ver [GUIA_COLORES.md](./GUIA_COLORES.md) para especificaciones completas.

---

## 🔄 Estado de Funcionalidades

### ✅ Implementado (UI Completa + Navegación)

- [x] **Autenticación**
  - Pantalla de Login
  - Pantalla de Registro
  - Integración social (preparado)
  
- [x] **Lectura Bíblica**
  - Lectura del día con FAB inteligente
  - Navegación por Antiguo Testamento (46 libros)
  - Navegación por Nuevo Testamento (27 libros)
  - Vista de capítulos (Genesis, San Mateo)
  - Lectura de capítulos completos
  - Selección de versículos con toolbar flotante
  
- [x] **Búsqueda**
  - Buscador con header fijo ✨
  - Búsqueda en tiempo real en Favoritos
  - Historial de búsquedas
  
- [x] **Gestión Personal**
  - Favoritos con filtros por categoría
  - Escritos personales
  - Sistema de notas (UI)

### 🔴 Pendiente (Integración Backend)

- [ ] API REST para contenido bíblico
- [ ] Base de datos con todos los versículos
- [ ] Autenticación real (JWT)
- [ ] Sincronización de favoritos y notas
- [ ] Sistema de caché offline
- [ ] Audio de capítulos
- [ ] Búsqueda por voz
- [ ] Analytics y tracking

---

## 🚀 Roadmap

### Fase 1: MVP Backend (2-3 meses)
```
✓ Configurar servidor Node.js + Express
✓ Base de datos PostgreSQL con versículos completos
✓ API de autenticación con JWT
✓ Endpoints de contenido bíblico
✓ Sistema de favoritos y notas
✓ Tests unitarios e integración
```

### Fase 2: Features Core (2-3 meses)
```
✓ Audio de capítulos (TTS o grabaciones)
✓ Búsqueda avanzada con filtros
✓ Modo offline completo (SQLite)
✓ Compartir en redes sociales
✓ Notificaciones push diarias
✓ Analytics y métricas
```

### Fase 3: Premium Features (3-4 meses)
```
✓ Planes de lectura personalizados
✓ Comentarios teológicos
✓ Referencias cruzadas automáticas
✓ Estadísticas de lectura
✓ Comunidad y grupos de estudio
✓ Modo oscuro
```

Ver [ARQUITECTURA_Y_MEJORAS.md](./ARQUITECTURA_Y_MEJORAS.md) para detalles completos.

---

## 📊 Métricas del Proyecto

```
📱 Pantallas:              12
🧩 Componentes:            50+
📝 Líneas de código:       ~6,500
📚 Documentos:             20+
🎨 Colores definidos:      7 paletas
🔧 Tests:                  Por implementar
📦 Bundle size:            ~2MB (sin optimizar)
⚡ Tiempo de carga:        <2s (sin backend)
```

---

## 💡 Mejoras Recientes

### Diciembre 2024
- ✅ Header y barra de búsqueda fijos en BibleSearchScreen
- ✅ Padding ajustado en ChapterReadingScreen y GenesisReadingScreen
- ✅ Cambio de terminología "mockeado" → "en desarrollo"
- ✅ Documentación completa de arquitectura
- ✅ Guía de implementación de backend
- ✅ Sistema de componentes reutilizables documentado

---

## 🔧 Configuración

### Variables de Entorno

Crear archivo `.env`:

```bash
EXPO_PUBLIC_API_URL=https://api.bibliaapp.com
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn
EXPO_PUBLIC_ANALYTICS_ID=your_analytics_id
```

### Build para Producción

```bash
# iOS (requiere cuenta de Apple Developer)
eas build --platform ios --profile production

# Android
eas build --platform android --profile production

# Preview Build (para testing)
eas build --platform all --profile preview
```

---

## 🧪 Testing

```bash
# Tests unitarios (por implementar)
npm test

# Tests E2E (por implementar)
npm run test:e2e

# Linting
npm run lint

# Type checking
npm run type-check
```

---

## 🤝 Contribución

### Para Desarrolladores

1. Leer documentación completa en `/docs`
2. Seguir guía de estilo de código
3. Crear feature branch desde `develop`
4. Implementar con tests
5. Documentar cambios
6. Pull request con descripción detallada

### Guías de Código

- TypeScript estricto (strict mode)
- Nombres descriptivos (handle*, use*, *Screen, *Service)
- Componentes funcionales con hooks
- Comentarios útiles y concisos
- Documentación de funciones complejas

---

## 📄 Licencia

Proyecto propietario. Todos los derechos reservados © 2024.

---

## 👥 Equipo

- **Desarrollador Principal:** [Tu Nombre]
- **Diseño UI/UX:** [Nombre]
- **Arquitectura Backend:** [Nombre]
- **QA:** [Nombre]

---

## 📞 Contacto

**Para consultas sobre el proyecto o inversión:**

- 📧 Email: contact@bibliaapp.com
- 🌐 Website: [En desarrollo]
- 💼 LinkedIn: [Tu perfil]
- 📱 Demo: [Enlace a Expo]

---

## 🙏 Agradecimientos

- **Biblia de Jerusalén** por el contenido de referencia
- **Comunidad de React Native** por las herramientas
- **Expo Team** por el framework increíble
- **Material Design** por la inspiración visual

---

## 📈 Métricas para Inversores

### KPIs Objetivo (Post-Lanzamiento)

```
📊 Engagement
├── DAU (Daily Active Users): 10K en 6 meses
├── Capítulos leídos/sesión: 2.5 promedio
├── Tiempo de lectura: 15 min/día
└── Retención D30: >40%

💰 Monetización
├── Freemium conversion: 5-8%
├── Premium price: $4.99/mes o $39.99/año
├── LTV/CAC ratio: >3:1
└── Churn rate: <5% mensual

📱 Technical
├── Crash rate: <1%
├── Load time: <2s
├── API response: <500ms
└── App rating: >4.5 ⭐
```

---

## 🎯 Para Presentación a Inversores

### Demo en 3 pasos

1. **Inversor descarga "Expo Go"** (gratis en App Store / Play Store)
2. **Tú ejecutas** `npm start`
3. **Inversor escanea QR** → ¡App funcionando en 30 segundos!

### Pitch Deck

Ver carpeta `/pitch/` para presentación completa con:
- Análisis de mercado
- Propuesta de valor
- Modelo de negocio
- Roadmap de desarrollo
- Proyecciones financieras

---

**Versión:** 1.0.0 (Demo)  
**Última actualización:** Diciembre 2024  
**Estado:** ✅ Listo para presentación a inversores  
**Próximo milestone:** Backend MVP (Q1 2025)

---

> *"La mejor forma de predecir el futuro es construirlo"*

