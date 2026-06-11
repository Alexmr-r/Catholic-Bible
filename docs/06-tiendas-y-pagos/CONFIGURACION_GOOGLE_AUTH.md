# 🔐 Configuración de Autenticación (Google & Apple)

## 🌐 Cloudflare vs Firebase: ¿Quién hace qué?
| Servicio | Función en CatholicVerse |
| :--- | :--- |
| **Cloudflare** | Gestiona el dominio `api.getcatholicverse.com`, el SSL y protege el servidor Backend. |
| **Firebase / Google Cloud** | Gestiona la identidad de los usuarios. Proporciona los SDKs nativos para el Login en Android/iOS. |

## 📄 Archivos Necesarios para Producción (Mobile)
Para que el Login funcione en la App publicada, son obligatorios estos archivos en la raíz de `BibliaAppExpo/`:

### 🤖 Android
- **Archivo:** `google-services.json`
- **Origen:** Firebase Console -> Configuración del proyecto -> Tus aplicaciones (Android).
- **Importante:** Requiere añadir la huella **SHA-1** de producción (se obtiene con `eas credentials`).

### 🍏 iOS
- **Archivo:** `GoogleService-Info.plist`
- **Origen:** Firebase Console -> Configuración del proyecto -> Tus aplicaciones (iOS).

## 🛠️ Credenciales Actuales (Hardcoded)
Actualmente, para máxima simplicidad y seguridad, los IDs están integrados en el código (proyecto Firebase `catholicverse-40437`). *Verificado contra el código en junio de 2026:*

### 📱 Frontend (`LoginScreen.tsx`)
- `webClientId`: `1055569033141-9l6tnmaugo5tbco40si0kc9qt887ion2.apps.googleusercontent.com`
- `iosClientId`: `1055569033141-8ol7lvhvgn445bfgcha7l74e7kjsshcr.apps.googleusercontent.com`

### ⚙️ Backend (`AuthenticationService.java`)
- El servidor utiliza la librería oficial de Google (`GoogleIdTokenVerifier`) para validar los tokens.
- **Audience:** acepta los tres client IDs del proyecto (Web `…9l6tn…`, iOS `…8ol7l…` y Android `1055569033141-6rdge1p5ri3vbqassb9u10p11v230o97…`).
- **Seguridad:** El Backend **NO necesita el `client_secret`** para verificar la identidad (solo usa la firma pública de Google), por lo que no es necesario configurar variables de entorno adicionales para Google Auth en el servidor.

> [!IMPORTANT]
> Si alguna vez cambias el cliente de Google en la consola de Firebase, asegúrate de actualizarlo tanto en el Front (LoginScreen) como en el Backend (AuthenticationService) para que la validación no falle.
