# Registro Técnico: Autenticación en Descargas 🔑

Este documento detalla la solución implementada para permitir la descarga de recursos protegidos (como la Biblia completa) desde la aplicación móvil.

---

## 🚀 El Problema: Error 403 Forbidden
Al intentar descargar el archivo JSON de la Biblia, el servidor respondía con un error **403**. Esto se debe a que el endpoint `/bible/english/download` no era público (requería estar "logueado").

Anteriormente, la descarga usaba esta lógica:
```tsx
// ❌ Error: No enviaba ninguna identificación al servidor
const downloadResumable = FileSystem.createDownloadResumable(URL, URI, {});
```

---

## ✅ La Solución: Inyección de Token de Usuario
Para que el servidor nos reconozca, debemos enviar el **JWT (Json Web Token)** que recibimos al iniciar sesión. Este token se guarda en el `AsyncStorage` bajo la clave `accessToken`.

### 1. Obtención del Token
En `english-bible-download.service.ts`, añadimos un paso previo a la descarga:
```tsx
const token = await AsyncStorage.getItem('accessToken');
```

### 2. Configuración de Cabeceras (Headers)
Creamos una cabecera de autorización estándar de tipo "Bearer":
```tsx
const headers = token ? { Authorization: `Bearer ${token}` } : {};
```

### 3. Ejecución de la Descarga Segura
Pasamos estas cabeceras a la función de Expo para que el servidor sepa quién está pidiendo el archivo:
```tsx
const downloadResumable = FileSystem.createDownloadResumable(
  DOWNLOAD_URL,
  BIBLE_FILE_URI,
  { headers } // 👈 Aquí se inyecta la "llave"
);
```

---

## 📌 Por qué es importante para el futuro
1. **Seguridad**: Evita que cualquiera (bots, externos) use el ancho de banda de tu servidor sin estar registrado.
2. **Escalabilidad**: Podrías añadir lógica en el backend para saber qué usuarios descargan qué versiones.
3. **Consistencia**: Todos los recursos protegidos del API (favoritos, escritos, configuraciones) siguen este mismo patrón de usar el `accessToken`.

---
*(Documento de referencia para el equipo de desarrollo v1.1)*
