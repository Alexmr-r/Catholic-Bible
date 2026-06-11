# Solución al Bug de Compilación en Simulador de Expo

## ¿Cuándo usar esto?
Si alguna vez utilizas la opción **"Erase All Content and Settings"** de tu simulador de iOS y luego, al intentar correr `npx expo start`, te sale el error de que no hay un **development build instalado**, y al intentar instalarlo con `npx expo run:ios` te salta un error sobre **"devicectl"** o pidiendo certificados de Apple ("No code signing certificates...").

Ese es un bug en Expo donde se confunde y cree que el Simulador es un iPhone físico.

## Opción 1: Modo Manual desde Xcode (Más Fiable) 📺

Si el simulador no reconoce la app o da errores extraños, lo mejor es usar Xcode directamente para una instalación limpia:

1.  Abre Xcode.
2.  Ve a `File` -> `Open` -> Busca la carpeta `ios` de tu proyecto y abre el archivo **`BibliaAppExpo.xcworkspace`**.
3.  En la barra superior, asegúrate de que el **Esquema** sea `BibliaAppExpo` y el **Destino** sea tu simulador (ej. `iPhone 16 Pro`).
4.  Pulsa el botón de **Play (Run)**.
5.  Una vez que Xcode instale la app y la abra en el simulador, puedes cerrarlo y volver a usar `npx expo start` normalmente.

---

## Opción 2: Instrucciones Automáticas desde Terminal 💻

Para forzar la instalación correcta en el simulador saltándonos el error de Expo, sólo copia, pega y ejecuta de un tirón el siguiente comando en tu terminal (en la misma carpeta raíz del proyecto `BibliaAppExpo`):

```bash
echo "==> Limpiando antiguos builds..." && rm -rf ./ios/build_custom && echo "==> Compilando aplicación nativa para el simulador..." && xcrun xcodebuild -workspace ios/BibliaAppExpo.xcworkspace -scheme BibliaAppExpo -configuration Debug -sdk iphonesimulator -derivedDataPath ./ios/build_custom -destination 'generic/platform=iOS Simulator' -quiet build && echo "==> Instalando en tu simulador abierto..." && xcrun simctl install booted ./ios/build_custom/Build/Products/Debug-iphonesimulator/BibliaAppExpo.app && echo "==> Iniciando la app..." && xcrun simctl launch booted com.alexmr.biblia && echo "==> ¡COMPILACIÓN ÉXITOSA!"
```

### ¿Qué hace exactamente este comando?
1. Limpia compilaciones viejas (`rm -rf ./ios/build_custom`).
2. Usa la herramienta nativa de Apple (`xcodebuild`) para ensamblar la app dirigida exclusivamente a simuladores genéricos.
3. Lo hace de forma silenciosa para que no te inunde la consola (`-quiet build`).
4. Usa otra herramienta nativa (`simctl install`) para detectar cuál es tu simulador encendido (`booted`) y meterle la app de Expo a la fuerza.
5. Inicia tu app automáticamente (`launch booted com.alexmr.biblia`).

Una vez terminando y viendo el mensaje final, tu app de Expo estará lista y corriendo en tu simulador. Luego ya puedes simplemente utilizar tu `npx expo start` tranquilo.



mrrobot@MacBook-Pro-de-Alejandro BibliaAppExpo % npx expo prebuild -p ios && rm -rf ./ios/bu
ild_custom && xcrun xcodebuild -workspace ios/BibliaAppExpo.xcworkspace -scheme BibliaAppExp
o -configuration Debug -sdk iphonesimulator -derivedDataPath ./ios/build_custom -destination
 'generic/platform=iOS Simulator' -quiet build && xcrun simctl install booted ./ios/build_cu
stom/Build/Products/Debug-iphonesimulator/BibliaAppExpo.app
✔ Created native directory | reusing /ios
✔ Updated package.json | no changes
✔ Finished prebuild