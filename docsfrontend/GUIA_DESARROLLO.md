# Guía de Desarrollo - Aplicación Biblia (2026)

Esta guía explica cómo funciona el entorno de desarrollo de la aplicación y cómo puedes verla en tu ordenador tanto para iOS como para Android.

## 1. El Corazón de la App (Tecnología)
La app está construida con **React Native + Expo**. Esto permite escribir el código una vez y que funcione en ambos sistemas.

- **Frontend**: React Native con TypeScript.
- **Narrador IA**: Utilizamos `Sherpa-ONNX` con modelos `Piper TTS` para una voz humana offline de alta calidad.
- **Entorno**: Expo SDK 54 con Arquitectura Nueva (Fabric).

---

## 2. Cómo funciona en iOS (Lo que estamos usando ahora)

Para ver la app en un "móvil virtual" (Simulador) en tu Mac:

### Comandos principales:
- **Limpiar y preparar**: `rm -rf ios && npx expo prebuild` (Crea la carpeta nativa desde tu código).
- **Lanzar en el simulador**: `npx expo run:ios` (Compila y abre el iPhone virtual).
- **Limpieza de caché** (si algo falla): `npx expo run:ios --no-build-cache`.

### Abrir Xcode directamente:
A veces es mejor usar Xcode para ver errores detallados:
1. Abre `ios/BibliaAppExpo.xcworkspace`.
2. Elige un iPhone de la lista de arriba (ej. **iPhone 16 Pro**).
3. Dale al botón de **Play** (Cmd + R).

---

## 3. Cómo funciona en Android

Para ver la app en Android, necesitas tener instalado **Android Studio**.

### Pasos previos:
1. Abre **Android Studio** y crea un "Virtual Device" (Emulador) desde el `Device Manager`.
2. Asegúrate de tener instalado el SDK de Android.

### Comandos:
- **Preparar**: `npx expo prebuild` (si no existe la carpeta `android`).
- **Lanzar en el emulador**: `npx expo run:android`.

---

## 4. El Narrador de IA Premium

Hemos implementado un motor de voz profesional:
- **Offline**: No consume datos una vez descargado.
- **Calidad**: Voz humana pausada y natural.
- **Uso**: Al pulsar el botón de audio, aparecerá la opción de "Instalar Narrador Premium". La app bajará los archivos necesarios (~50MB) a la memoria interna del teléfono automáticamente.

---

## 5. Solución de Problemas Comunes

### Error: "The sandbox is not in sync"
Se soluciona sincronizando las librerías nativas:
```bash
cd ios && pod install && cd ..
```

### Error: "Module map not found"
Ocurre cuando Xcode tiene datos viejos en memoria. Se soluciona borrando la caché de Xcode:
- En Xcode: **Product > Clean Build Folder**.
- En la terminal: `rm -rf ~/Library/Developer/Xcode/DerivedData/*`.

### Error: "New Architecture" (Fabric)
Esta app requiere la Arquitectura Nueva activada para que el Slider y la IA funcionen bien. Asegúrate de que en `app.json` aparezca `"newArchEnabled": true`.

---

## 6. Mantenimiento del Código
Todo tu código personal está en la carpeta `/src`.
- `/src/screens`: Las pantallas de la Biblia.
- `/src/services`: Donde vive el `AudioService` (el cerebro de la voz).
- `/src/contexts`: El sistema de Temas (Modo Oscuro).

¡Disfruta construyendo la mejor app de la Biblia!
