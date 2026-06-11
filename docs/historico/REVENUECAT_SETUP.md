# 💰 CatholicVerse — Activar Monetización (RevenueCat)

Todo el código está listo. Solo necesitas hacer esto una vez para lanzar la suscripción en producción.

---

## PASO 1 — Crear cuenta RevenueCat

1. Ve a [https://app.revenuecat.com](https://app.revenuecat.com) y crea una cuenta gratuita.
2. Crea un nuevo **Project** → nómbralo `CatholicVerse`.
3. Añade dos **Apps** dentro del proyecto:
   - **iOS** → Bundle ID: el que tienes en `app.json` (`com.tuempresa.catholicverse` o similar)
   - **Android** → Package name: el mismo que en Android

---

## PASO 2 — Crear productos en App Store Connect (iOS)

1. Ve a [https://appstoreconnect.apple.com](https://appstoreconnect.apple.com) → tu app → **Monetización → Suscripciones**.
2. Crea un **Subscription Group** → nombre: `CatholicVerse Premium`.
3. Dentro del grupo, añade **2 productos**:

| Product ID                        | Tipo          | Precio         | Duración |
|-----------------------------------|---------------|----------------|----------|
| `catholicverse_premium_monthly`   | Auto-Renewable | $4.99/mes      | 1 month  |
| `catholicverse_premium_yearly`    | Auto-Renewable | $39.99/año     | 1 year   |

4. Activa el período de prueba gratuita de **7 días** en ambos si quieres que Apple lo gestione también (opcional, ya lo hacemos nosotros en el backend).

---

## PASO 3 — Crear productos en Google Play Console (Android)

1. Ve a [https://play.google.com/console](https://play.google.com/console) → tu app → **Monetización → Suscripciones**.
2. Crea las mismas 2 suscripciones con los mismos Product IDs que en iOS.

---

## PASO 4 — Configurar RevenueCat

### 4a. Añadir los productos
1. En RevenueCat → **Products** → añade los 4 productos (2 iOS + 2 Android) con sus Product IDs exactos.

### 4b. Crear Entitlement
1. En RevenueCat → **Entitlements** → `+ New` → ID: **`premium_access`**.
2. Enlaza los 4 productos al entitlement `premium_access`.

### 4c. Crear Offering
1. En RevenueCat → **Offerings** → `+ New` (o edita `Default`).
2. Dentro del Offering, crea **2 Packages**:
   - Package ID: `$rc_annual` → enlaza el producto anual
   - Package ID: `$rc_monthly` → enlaza el producto mensual

---

## PASO 5 — Pegar las API Keys en el código

Abre el archivo:
```
BibliaAppExpo/src/contexts/SubscriptionContext.tsx
```

Busca este bloque al principio y reemplaza las API keys:

```typescript
const API_KEYS = {
  apple: 'appl_YOUR_APPLE_API_KEY_HERE',   // ← Pega aquí tu clave iOS de RevenueCat
  google: 'goog_YOUR_GOOGLE_API_KEY_HERE', // ← Pega aquí tu clave Android de RevenueCat
};
```

Las claves las encuentras en RevenueCat → tu App iOS/Android → **API Keys**.

---

## PASO 6 — Activar el Webhook (Backend)

Para que el backend de Spring Boot sepa si un usuario cancela su suscripción:

1. En RevenueCat → **Integrations** → **Webhooks** → `+ New Endpoint`.
2. URL del webhook: `https://TU_DOMINIO/api/webhooks/revenuecat`
3. ⚠️ Este endpoint aún no existe en el backend. Habrá que implementarlo cuando llegue el momento.

---

## PASO 7 — Activar el Muro de Pago en el Día 8 (Hard Paywall)

El código del Muro ya está implementado. Solo hay que descomentar 4 líneas en:
```
BibliaAppExpo/src/navigation/AppNavigator.tsx
```

Busca el bloque `{isAuthenticated ? (` y cambia:
```tsx
// ANTES (modo desarrollo — acceso libre)
{isAuthenticated ? (
  <>
    <RootStack.Screen name="MainTabs" ... />
    ...
  </>
) : (

// DESPUÉS (modo producción — muro activado)
{isAuthenticated ? (
  hasAccess ? (
    <>
      <RootStack.Screen name="MainTabs" ... />
      ...
    </>
  ) : (
    <RootStack.Screen name="Paywall" component={PaywallScreen} options={{ animation: 'fade' }} />
  )
) : (
```

> `hasAccess` es `true` si el usuario tiene suscripción activa O está en sus 7 días de prueba.
> Cuando caduca la prueba y no ha pagado, el muro aparece automáticamente cada vez que abre la app.

---

## Resumen de lo que está listo vs. pendiente

| Estado | Qué |
|--------|-----|
| ✅ Listo | Pantalla Paywall completa (dark/light mode, 2 planes, restore) |
| ✅ Listo | SubscriptionContext con RevenueCat SDK instalado |
| ✅ Listo | Backend: campos `is_premium`, `trial_start_date`, `hasPremiumAccess()` |
| ✅ Listo | Tarjeta "Upgrade to Premium" en Perfil |
| ✅ Listo | Lógica del Muro de Pago (solo activar con `hasAccess`) |
| ⏳ Pendiente | Crear productos en App Store Connect y Google Play |
| ⏳ Pendiente | Configurar RevenueCat (entitlements, offerings) |
| ⏳ Pendiente | Pegar API Keys en `SubscriptionContext.tsx` |
| ⏳ Pendiente | Implementar webhook backend `/api/webhooks/revenuecat` |
| ⏳ Pendiente | Activar el Hard Paywall (Paso 7 arriba) |
