# 📑 Guía Definitiva: Firebase vs Google Cloud (Evitar el caos en Android)

Si estás leyendo esto, es porque probablemente te has liado configurando el Inicio de Sesión de Google. No te preocupes, es el error #1 en desarrollo móvil. Aquí tienes la explicación clara para no volver a fallar.

## 🥊 El Gran Malentendido
Google tiene dos consolas, pero para nosotros **solo una es la jefa**:

| Característica | Firebase Console (La Jefa 👑) | Google Cloud Console (La Técnica 🛠️) |
| :--- | :--- | :--- |
| **Uso** | Configuración diaria, Auth, Base de Datos. | Configuración avanzada de APIs. |
| **Android** | Donde pegas la huella SHA-1. | Donde se crean los IDs de cliente. |
| **Archivos** | Genera el `google-services.json`. | Genera archivos JSON técnicos. |

## 🚀 La Regla de Oro
> **"Todo lo que sea de Google, configúralo SIEMPRE desde Firebase."**

### ¿Por qué?
Porque Firebase es un "envoltorio" inteligente. Cuando tú añades una huella SHA-1 en Firebase, él se encarga de ir a Google Cloud por ti, crear las credenciales correctas y meterlas todas en un solo archivo: el `google-services.json`.

## 🆘 Resolución de Errores Comunes

### 1. El error: "Otro proyecto contiene este cliente..."
**Causa:** Creaste el ID de Android a mano en Google Cloud en un proyecto diferente al de Firebase.
**Solución:** 
1. Ve a Google Cloud y **borra** esa credencial de Android.
2. Vuelve a Firebase y añade la huella SHA-1 ahí. Firebase ahora podrá "adueñarse" de esa huella sin conflictos.

### 2. El error: El `google-services.json` viene vacío (`oauth_client: []`)
**Causa:** Descargaste el archivo demasiado rápido o el navegador guardó la versión antigua.
**Solución:** 
1. Refresca la página de Firebase (F5).
2. Espera 2 minutos tras añadir la huella SHA-1.
3. Vuelve a descargar. El archivo DEBE contener una lista de `client_id`.

## 🛠️ Checklist para el éxito en Android
- [ ] Huella SHA-1 añadida en Firebase.
- [ ] Descargar `google-services.json` desde Firebase (no de Cloud Console).
- [ ] Asegurarse de que el `package_name` en el JSON coincida con `app.json` (`com.catholicverse.app`).

---
**Documentado para:** Alejandro (CatholicVerse)
**Por:** Antigravity (IA)
