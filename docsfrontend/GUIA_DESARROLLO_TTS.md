# 🎙️ Guía de Desarrollo de Inteligencia Artificial (Offline TTS)

Esta guía documenta exhaustivamente todo nuestro aprendizaje, errores, soluciones definitivas y la arquitectura final implementada para dotar a la BibliaApp de un motor de síntesis de voz (Text-To-Speech) con Inteligencia Artificial **completamente offline** en iOS y Android.

---

## 🏗️ La Arquitectura Definitiva

Implementar TTS offline en React Native no es trivial. Hemos utilizado la librería \`react-native-sherpa-onnx-offline-tts\` como base, interconectada con los motores nativos (Swift/Objective-C en iOS) y el framework \`expo-speech\` como nuestro sistema "fallback" (voz de respaldo).

### 🧠 ¿Qué Modelo de IA Usamos?

Elegimos **\`vits-ljs\` (Coqui-TTS)**:
- **¿Por qué este y no los basados en Piper?**
  Durante la investigación inicial, intentamos usar modelos basados en \`Piper\`. Estos modelos necesitan un componente interno llamado \`espeak-ng\` para traducir texto (grafemas) a sonidos fonéticos (fonemas). Al no tener \`espeak-ng\` compilado directamente para móvil en esta librería, las voces fallaban, hablaban a velocidades absurdas o crasheaban la app. Además, requerían la declaración de un diccionario manual \`lexicon.txt\`, propenso a errores "Out Of Vocabulary" (OOV).
  
  **El modelo VITS de Coqui resuelve esto**: Procesa el texto directamente carácter por carácter (Character-Level Processing), entendiendo pausas, acentos y puntuación sin diccionarios intermediarios.
- **Archivos necesarios**: Solo necesita \`vits-ljs.onnx\` (el cerebro neuronal, ~76MB) y \`tokens.txt\` (el mapeo de caracteres que entiende).

---

## 🛠️ Modificaciones de Código Nativo (El core del éxito)

La librería \`react-native-sherpa-onnx-offline-tts\` venía con deficiencias graves en la interconexión con React Native, manejo de progreso y concurrencia. **Tuvimos que parchear intensamente el código nativo** y usar \`patch-package\` para que estos cambios sobrevivieran a las instalaciones de \`npm\`.

### 1. ⏸️ Implementando Play, Pause y Resume Reales
La librería base no exponía al lado JavaScript (React Native) los métodos de pausa y reanudación, por lo que el usuario no podía parar de leer sin perder el progreso del capítulo.
- **En Objective-C (\`SherpaOnnxOfflineTts.mm\`)**: Tuvimos que añadir manualmente las macros \`RCT_EXTERN_METHOD(pausePlayback)\` y \`RCT_EXTERN_METHOD(resumePlayback)\` para construir el puente entre C++ e iOS.
- **En JavaScript (\`src/index.tsx\` y \`lib/module/index.js\`)**: Inyectamos estas llamadas para que el método \`audio.service.ts\` pudiera controlar el estado del reproductor.

### 2. 📊 La Barra de Progreso a Trompicones ("Chunky Progress")
**El Problema**: La barra de progreso de lectura (la línea azul) avanzaba dando "saltos" gigantes. Esto sucedía porque el motor ONNX procesaba frases completas (de 5 a 8 segundos de audio) y solo emitía el evento \`ProgressUpdate\` a React Native cuando terminaba de reproducir la frase entera.
**La Solución Definitiva (Cirugía en Swift)**:
En el archivo \`AudioPlayer.swift\`, modificamos el método \`playAudioData\` para que, en vez de encolar el audio completo de una frase de golpe, fragmentara ("slicing") el buffer de audio (los _samples_ flotantes) en minimuestras de **0.5 segundos**.
```swift
let chunkSize = Int(self.audioFormat.sampleRate * 0.5) // Tramos de 0.5 segundos
```
De esta forma, iOS emite eventos de progreso cada medio segundo.
Además, en **React Native (\`AudioPlayerOverlay.tsx\`)**, acoplamos la interpolación matemática constante con animaciones \`Animated.timing\` y \`Easing.cubic\` con 1800ms de duración, consiguiendo un efecto de llenado de barra totalmente fluido e indetectable a la vista.

### 3. 💣 La "Guerra de los Hilos" y el Falso Fin de Lectura
- **El Problema**: Cuando se solicitaba detener la IA (dándole al botón Stop), la librería de Swift limpiaba la cola, pero mandaba a React Native un evento de \`Volume: -1.0\`. Si en ese mismo milisegundo disparábamos otra lectura, el evento antiguo del \`Stop\` mataba la lectura nueva antes de empezar.
- **La Solución**: Modificamos \`AudioPlayer.swift\` para no lanzar el \`-1.0\` en el \`stopPlayback\`. Ahora solo avisa del final si el reproductor detecta lógicamente el final del buffer de cola (`checkForPlaybackEnd`).
Además, en \`audio.service.ts\` gestionamos perfectamente los errores \`code: 'STOPPED'\` o \`code: 'BUSY'\`, logrando que al cancelar no se dispare por error la "voz robótica" nativa como un _fallback_ falso.

---

## 🔄 El Flujo Correcto de Lectura en la App

1. El usuario pulsa "Play" en la \`ChapterReadingScreen\`. Un pop-up pregunta si quiere IA o Voz de Sistema.
2. Si elige IA, \`audio.service.ts\` recibe el capítulo completo.
3. Se limpia de tags, números complejos y espacios dobles (importante para que la IA no tartamudee).
4. Se envía la petición a \`SherpaTTS.generateAndPlay\`.
5. **Cálculo Desacoplado (C++ Swift)**: El texto grande se divide en **frases** (al encontrar puntos o comas) mediante \`splitText\`. Mandar todo de golpe haría "Out of Memory" (OOM) en el iPhone y crashearía.
6. **Zero Latency**: Mientras iOS reproduce la Frase 1 (fragmentada en 0.5s), el procesador A16/A17 del iPhone está generando el tensor de la Frase 2 en un hilo secundario (\`DispatchQueue.global\`). El usuario percibe una lectura humana sin pausas de carga de procesamiento.
7. Al darle a Pause/Stop, \`AudioPlayer.swift\` interrumpe la cola (NSLock) e iOS detiene el motor \`AVAudioEngine\`.

---

## 📝 Checklists para Integrar o Mejorar en el Futuro

1. **Parches Asegurados**: Cualquier cambio futuro en la capa de Swift u Objective-C de la librería **debe ser fijado con \`npx patch-package react-native-sherpa-onnx-offline-tts\`**. Si haces un \`npm install\` limpio en otra máquina, el parche autoconstruirá los puentes y arreglos gracias a este comando.
2. **Rate limits de memoria**: No descargues modelos ONNX mucho más grandes de 150MB o el procesador del móvil del usuario abortará (cerrará la app por falta de memoria) al construir la sesión de IA. \`vits-ljs\` pesa ~80MB, siendo el _sweet spot_.
3. **Manejo de Caché Nativa**: Recuerda que al editar JavaScript precompilado de un \`node_module\` (como la carpeta \`/lib/module\` para exponer el Play/Pause), necesitas arrancar Expo con \`npx expo start -c\` para borrar la memoria de Metro Bundler y empaquetar los cambios nuevos puenteados al móvil, de lo contrario Xcode los ignorará.
4. **Respetar Diccionarios**: Si usas a futuro un modelo que sí use \`lexicon.txt\`, recuerda nunca enviar palabras desconocidas o acrónimos, porque la IA generará un evento de pánico por "Símbolo Desconocido".

¡Este motor está completamente customizado y optimizado al extremo tanto en la interfaz analógica (Javascript) como en el kernel metálico de iOS!
