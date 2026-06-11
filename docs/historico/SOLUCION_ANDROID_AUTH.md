# 🤖 Solución Completa: Google Sign-In en Android - Historia Real

## ✅ Estado Final
- **iOS:** ✅ Funcionando
- **Android:** ✅ Funcionando (resuelto el 12 Mayo 2026)

---

## 🔍 ¿Qué estaba pasando realmente?

### El culpable: DOS keystores distintos en el mismo proyecto

Un proyecto Expo/React Native tiene **dos archivos debug.keystore**:

| Keystore | Ubicación | SHA-1 | Uso |
|----------|-----------|-------|-----|
| **Del sistema** | `~/.android/debug.keystore` | `06:FC:A2...` | Keytool por defecto del Mac |
| **Del proyecto** | `android/app/debug.keystore` | `5E:8F:16...` | El que Gradle usa para FIRMAR la APK |

**El error:** Estábamos registrando la SHA-1 del keystore del sistema (`06:FC:A2...`) en Firebase, pero Gradle firmaba la APK con el keystore del proyecto (`5E:8F:16...`). Google comparaba las firmas y no coincidían → `DEVELOPER_ERROR`.

### Cronología del debugging (2 horas perdidas)

```
❌ Sospecha 1: SHA-1 incorrecta en Firebase → La cambiamos → Seguía fallando
❌ Sospecha 2: google-services.json desactualizado → Lo descargamos → Seguía fallando  
❌ Sospecha 3: androidClientId en el código → Lo quitamos → Seguía fallando
❌ Sospecha 4: Emulador sin Google Play Services → Cambiamos emulador → Seguía fallando
❌ Sospecha 5: google-services.json no en android/app/ → Lo copiamos → Seguía fallando
✅ Causa Real: La APK se firmaba con UNA clave pero Firebase conocía OTRA
```

### La solución definitiva
Añadir la SHA-1 del keystore del PROYECTO (no el del sistema) a Firebase:
```
# SHA-1 que realmente firma la APK:
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android
# → SHA1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

---

## 🌐 Google Cloud Console vs Firebase - La Confusión de los 2 Proyectos

### ¿Por qué tengo dos proyectos?

Cuando usas Firebase, Google crea automáticamente un proyecto en Google Cloud Console (GCP) vinculado a Firebase. Si además creaste un proyecto de GCP manualmente, tienes dos:

| Proyecto | ID | Número | Origen | Contenido |
|----------|-----|--------|--------|-----------|
| **CatholicVerse** | `catholicverse` | `709014169638` | Creado manualmente en GCP | Solo OAuth Web + iOS |
| **CatholicVerse (Firebase)** | `catholicverse-40437` | `1055569033141` | Creado por Firebase | OAuth Web + iOS + Android ✅ |

La app usa el **proyecto de Firebase** (`catholicverse-40437`). El `google-services.json` tiene `"project_number": "1055569033141"` que lo confirma.

### ¿Cómo accedo al proyecto de Firebase desde Google Cloud Console?

1. Ve a [console.cloud.google.com](https://console.cloud.google.com)
2. Haz clic en el **selector de proyectos** (arriba a la izquierda, donde pone el nombre del proyecto)
3. Busca `catholicverse-40437`
4. Selecciónalo → Ahora verás las credenciales del proyecto de Firebase

Ahí encontrarás los OAuth clients que usa tu app:
- Android: `1055569033141-2vqijdp7...` (con las dos SHA-1 registradas)
- Web: `1055569033141-9l6tnmau...` (el webClientId del código)

### ¿Borro el proyecto `catholicverse` (709014169638)?

**Por ahora NO lo borres.** Aunque la app no lo usa directamente, puede tener recursos compartidos (Gemini API Key, cuenta de servicio de RevenueCat). Déjalo estar y gestiona todo desde Firebase.

---

## 📋 Checklist definitivo para el futuro

Cuando el Google Login dé `DEVELOPER_ERROR` en Android:

- [ ] **Paso 1:** Obtener SHA-1 de AMBOS keystores:
  ```bash
  # Keystore del sistema (Mac):
  keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1
  
  # Keystore del proyecto (el que firma la APK):
  keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1
  ```
- [ ] **Paso 2:** Registrar AMBAS SHA-1 en Firebase Console
- [ ] **Paso 3:** Descargar nuevo `google-services.json` de Firebase
- [ ] **Paso 4:** Copiar el JSON a `android/app/google-services.json` también
- [ ] **Paso 5:** Compilar de nuevo: `npx expo run:android`
- [ ] **¿Emulador?** Asegurarse de que tiene Google Play Services (icono 🛍️)

---

## 🎯 Configuración final que funciona

### LoginScreen.tsx
```typescript
GoogleSignin.configure({
  offlineAccess: true,
  webClientId: '1055569033141-9l6tnmaugo5tbco40si0kc9qt887ion2.apps.googleusercontent.com',
  iosClientId: '1055569033141-8ol7lvhvgn445bfgcha7l74e7kjsshcr.apps.googleusercontent.com',
  // ⚠️ NO añadir androidClientId (la librería lo rechaza en nuevas versiones)
});
```

### SHA-1 registradas en Firebase
| SHA-1 | Keystore |
|-------|----------|
| `06:FC:A2:AA:DA:F0:C0:84:CA:DB:91:F3:79:F1:8F:8B:6E:62:8B:2F` | `~/.android/debug.keystore` |
| `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` | `android/app/debug.keystore` ← **La clave** |

---

*Documento creado el 12 Mayo 2026. iOS tardó 2 días, Android tardó 2 horas extra. Total: ~50 horas de debugging acumuladas entre las dos plataformas.*
