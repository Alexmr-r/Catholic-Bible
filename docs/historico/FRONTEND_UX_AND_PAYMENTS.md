# 🎨 Frontend, UX y Sistema de Pagos (Suscripciones)
> *Documento maestro que consolida todo el histórico de desarrollo UI, navegación, lógicas de pantallas (Screen Implementations) y el Muro de Pago RevenueCat.*

## 1. Patrones Responsivos y UI (Design System)
Construido usando `react-native-safe-area-context` para soportar "Dynamic Island" en iOS.
- **Tipografía y Legibilidad:** Integrado `TextSettingsContext` que permite al usuario de CatholicVerse ampliar fuentes en tiempo real durante la lectura del versículo (`TEXT_SETTINGS_IMPLEMENTACION_COMPLETA.md`).
- **Modos de Color:** Contexto `ThemeContext` aplicado desde el inicio. El color dinámico controla el brillo en pantallas delicadas (ej. `GUIA_COLORES.md` y `AJUSTES_SUBRAYADOS_BADGE.md`).
- **Navegación Fluida:** (Histórico `MEJORES_PRACTICAS_NAVEGACION.md`) Implementadas transiciones con React Navigation usando BottomTabs nativos y Splash Screens programados (`SPLASH_SCREEN_IMPLEMENTACION.md`).

## 2. Pantallas Principales (Screen Implementations)
Se han construido pantallas agnósticas a los datos, delegando el estado en Custom Hooks:
- **BibleSearchScreen:** Equipado con un micrófono nativo que activa reconocimiento de audio (Oculto a la IA si no tiene internet), fusiona búsquedas en vivo y se apoya sobre el botón FAB.
- **Daily Reading / Calendar:** Cruza una validación algorítmica para determinar qué lectura toca cada día (`CALENDARIO_CONSTANCIA_FINAL.md`). No duplica la racha física (`BUG_FIX_REFLEXION_MISMO_DIA.md`).
- **Perfil y Ajustes:** Interfaz que enlaza el Logout, Ajustes avanzados e invoca los EULA compliance screen (`ACCOUNT_SCREEN_IMPLEMENTACION.md`).

## 3. RevenueCat y el Paywall (Suscripciones)
Se abolió el control de tickets manual (Apple/Google). Todo recae en el Wrapper `SubscriptionContext`.
- **Implementación del Paywall (`PaywallScreen.tsx`):**
  - Manejo universal de moneda usando `{package.product.priceString}` para absorber el "Exchange Rate" global sin código extra en la UI.
  - El contexto provee un booleano `hasAccess`. El sistema intercepta el ruteo (`AppNavigator`) y levanta el *Hard Paywall* si el Trial ha vencido y `hasAccess === false`, cortando el paso al `MainTabs`.
- La información de suscripción local y caché está resguardada de inyecciones debido al parseo de los Webhooks protegidos del backend.
