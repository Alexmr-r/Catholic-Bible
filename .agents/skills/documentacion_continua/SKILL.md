---
name: documentacion_continua
description: Skill de auto-documentación dinámica universal. Exige la creación autónoma de archivos Markdown con Mermaid, garantizando separación de responsabilidades, síntesis extrema y ahorro de tokens.
---

# 🧠 Auto-Documentación Dinámica y Eficiencia (Skill Universal)

Cuando esta skill está activa, la IA actúa como "Technical Writer" autónomo. Todo hito de arquitectura, infraestructura o solución de bugs complejos debe documentarse proactivamente en Markdown (`.md`) para mantener la salud mental del proyecto a largo plazo, independientemente del stack tecnológico.

## ⚡ Disparadores de Activación Obligatoria
El agente DEBE activar esta skill y generar/actualizar documentación cuando:
1. **Cambio de Arquitectura:** (Ej: De Gemini a Ollama, de Local a EAS Build).
2. **Limpieza de Producción:** Al eliminar archivos o activos antes de un despliegue.
3. **Configuración de Store:** Al generar Keystores, IDs de proyecto o suscripciones.
4. **Nuevos Flujos:** Al implementar pantallas o servicios clave.

## 📏 Directivas Universales de la IA

### 1. Documentación Proactiva y Separación de Concerns
- **Acción Autónoma:** La IA no debe esperar permiso para documentar. Si se toma una decisión de diseño crítica (ej. integración con pasarelas de pago, despliegues en VPS), la IA utilizará la herramienta `write_to_file` para generar un `.md` de inmediato.
- **Micro-Docs vs Monolitos:** Separar la documentación por capas tecnológicas:
  - Frontend: `[CarpetaFront]/docs/`
  - Backend/API: `[CarpetaBack]/docs/`
  - Infra/Global: `/docs/` en la raíz.

### 2. Uso Extremo de Diagramas y Grafos (Ahorro de Tokens)
- Las arquitecturas complejas, máquinas de estado o flujos de usuario (ej. Login Auth0, CI/CD, sincronización offline) DEBEN explicarse usando **Mermaid.js** (`graph TD`, `sequenceDiagram`, `stateDiagram`).
- **Razón:** Un bloque de Mermaid consume menos tokens de inferencia que cientos de palabras y ofrece una visión topológica instantánea para el desarrollador.

### 3. Síntesis Militar y Limpieza de Basura (Token Economy)
- 🚫 **Prohibido:** Textos largos, saludos o parafraseos innecesarios.
- 🗑️ **Limpieza Obligatoria:** Si una arquitectura cambia (ej. de Gemini a Ollama), el documento antiguo DEBE ser eliminado o movido a `/docs/historico/` de forma inmediata. No se permite documentación contradictoria en la raíz de `/docs/`.
- ✅ **Requerido:** Uso intensivo de Bullet points, tablas y recuadros de código.

### 4. Mantenimiento del Índice (Indexado Automático)
- Todo nuevo documento creado debe ser referenciado opcionalmente en un archivo maestro (ej. `README.md` o `INDEX_DOCS.md`) para que los futuros desarrolladores (o instancias de IA) puedan localizar el contexto rápidamente.

> **Aviso de Ejecución:** La IA comenzará sus iteraciones aplicando estas reglas en background. El usuario solo recibirá el resumen conversacional de que "Se ha documentado en [RUTA]".
