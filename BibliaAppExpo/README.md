# 📱 CatholicVerse — App móvil (React Native + Expo)

App de lectura de la Biblia Católica (CPDV) con asistente de IA, modo offline, TTS y suscripciones. Cliente del backend `BibliaBackend/` (`https://api.getcatholicverse.com/api/v1`).

**Stack:** Expo SDK 54 · React Native 0.81.5 · React 19.1 · TypeScript · React Navigation 7 · RevenueCat (`react-native-purchases`) · sherpa-onnx (TTS offline) · EAS Build · bundle `com.catholicverse.app`.

## 🚀 Desarrollo

```bash
npm install
npx expo start          # servidor de desarrollo
npm run ios             # simulador iOS (requiere dev build: npx expo prebuild)
npm run android         # emulador Android
```

> La app usa módulos nativos (RevenueCat, sherpa-onnx, Google Sign-In…), por lo que **no funciona en Expo Go**: necesita un *development build* (`expo-dev-client`). Guía completa: [`../docs/03-app-movil/GUIA_DESARROLLO.md`](../docs/03-app-movil/GUIA_DESARROLLO.md).

## 🏗️ Estructura

```
src/
├── navigation/AppNavigator.tsx   ← Splash → Auth → Paywall/MainTabs
├── screens/      (29 pantallas: lectura diaria, biblia, escritos, favoritos,
│                  IA, calendario, perfil, ajustes, ayuda, paywall…)
├── services/     (18 servicios: api.client, auth, bible, ai, daily-reading,
│                  favorites, highlights, writings, cache, sync, audio, share…)
├── contexts/     (Auth, Subscription, Theme, Network, TextSettings)
├── components/   ← Componentes transversales (OfflineBanner, MessageParser…)
├── hooks/useOfflineBible.ts · locales/ (ES/EN) · theme/ · utils/
```

Las 4 pestañas: **DailyReading** · **BibleSearch** · **Writings** · **Favorites**. Acceso premium: `hasAccess = premium (RevenueCat/backend) ∨ trial 7 días`.

## 📚 Documentación

- **Visión completa y verificada:** [`../docs/01-sistema/DOCUMENTACION_MAESTRA_2026.md`](../docs/01-sistema/DOCUMENTACION_MAESTRA_2026.md) (sección 10: app)
- **Guías del frontend:** [`../docs/03-app-movil/`](../docs/03-app-movil/)
- **Específicas de esta carpeta:** [`../docs/03-app-movil/ANDROID_ASSETS_SPLASH.md`](../docs/03-app-movil/ANDROID_ASSETS_SPLASH.md) · [`../docs/03-app-movil/SOLUCION_CONECTIVIDAD_ANDROID.md`](../docs/03-app-movil/SOLUCION_CONECTIVIDAD_ANDROID.md)
- **Crash TTS Android (workaround vigente):** [`../docs/03-app-movil/FIX_TTS_AND_PAYWALL_STABILITY.md`](../docs/03-app-movil/FIX_TTS_AND_PAYWALL_STABILITY.md)
