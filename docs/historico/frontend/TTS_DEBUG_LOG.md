# Log de Depuración AI Narrator (Sherpa-ONNX)

## Errores Identificados y Resueltos

### 1. Problema de Inicialización (Falla Crítica)
- **Síntoma**: El audio no sonaba o fallaba al iniciar; el modelo de IA no se cargaba correctamente.
- **Causa**: Carrera de hilos (Race Condition). El puente JavaScript-Nativo era síncrono ("fire-and-forget"). JS intentaba hablar antes de que el modelo de 50MB terminara de cargarse en memoria.
- **Solución**: Se reescribió el módulo en Swift/Objective-C para usar **Promesas**. Ahora `AudioService` espera (`await`) a que el nativo confirme que la IA está lista antes de enviar texto.

### 2. Error de "Modeling Unit" (Lexicon)
- **Síntoma**: Error `Not a model using characters as modeling unit`.
- **Causa**: El modelo `es_ES-sharvard-medium` no es de "caracteres", espera fonemas (IPA). Al no tener el directorio `espeak-ng-data`, el motor fallaba al no saber cómo convertir "Biblia" en sonidos.
- **Solución**: Se implementó una generación dinámica de un **Lexicon auxiliar**. El servicio crea un archivo `lexicon.txt` que mapea caracteres españoles directamente a sus fonemas correspondientes para que la IA sepa qué pronunciar.

### 3. Problema de Velocidad / Pitch (En curso)
- **Síntoma**: El audio va demasiado rápido ("voz de ardilla").
- **Causa**: Desajuste de Frecuencia de Muestreo (Sample Rate). El modelo genera a 22050Hz, pero el motor de audio (`AVAudioEngine`) podría estar reproduciendo a 44100Hz o 48000Hz sin realizar el resampling correctamente en el simulador.
- **Solución planeada**: Sincronizar la frecuencia de muestreo del `AudioPlayer` con la que reporta el objeto `audio` generado por la IA en tiempo real.
