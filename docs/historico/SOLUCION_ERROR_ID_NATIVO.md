# 🛡️ Solución Definitiva: Error de ID Nativo (com.catholicverse.app)

Este manual explica cómo solucionar el error `CommandError: No development build... is installed` que ocurre cuando cambias el nombre de la app, el slug o el Bundle ID en `app.json`.

## 🚨 El Problema
Cuando cambias el `bundleIdentifier` (ej: de `com.alexmr.biblia` a `com.catholicverse.app`), el simulador sigue buscando la app antigua y no encuentra la nueva. No basta con hacer `npx expo start`, hay que "reinstalar" la identidad de la app.

## 🛠️ La Solución Paso a Paso

### 1. Limpieza Total
Lo primero es eliminar los archivos nativos antiguos que están "corruptos" con el nombre viejo:
```bash
rm -rf ios android
```

### 2. Regeneración Limpia (Prebuild)
Crea las carpetas nativas de nuevo basándote 100% en tu `app.json` actual:
```bash
npx expo prebuild
```
*Si solo usas iOS, puedes usar `npx expo prebuild --platform ios`.*

### 3. Instalación Forzada en el Simulador
Este es el paso más importante. No uses `npx expo start` todavía. Tienes que compilar e instalar la app físicamente en el simulador:

**Opción A (Comando rápido):**
```bash
npx expo run:ios -d "iPhone 16 Pro"
```
*(Sustituir "iPhone 16 Pro" por el nombre de tu simulador abierto).*

**Opción B (Si la Opción A falla con certificados):**
1. Abre Xcode: `open ios/CatholicVerse.xcworkspace`
2. Selecciona el **Simulador** como destino (arriba a la izquierda).
3. Pulsa **Command (⌘) + R**.

---

## 💡 Notas Importantes
- **¿Cuándo hacer esto?**: Solo cuando cambies el Bundle ID, el nombre de la app en `app.json` o instales una librería nativa pesada.
- **¿Y el Backend?**: Si has cambiado lógica en Java, recuerda reconstruir el contenedor:
  ```bash
  cd BibliaBackend
  docker-compose up -d --build api
  ```
