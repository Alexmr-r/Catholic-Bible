// src/services/revenuecatConfig.ts
// ---------------------------------------------------
// Centraliza las claves de API de RevenueCat para iOS y Android.
// REEMPLAZA los valores de ejemplo con los que RevenueCat te haya
// generado en el dashboard (Project Settings → API Keys).
// ---------------------------------------------------
export const REVENUECAT_KEYS = {
    // Lectura de variables públicas de entorno inyectadas por Expo en el build
    apple: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY || '',
    google: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY || '',
};
