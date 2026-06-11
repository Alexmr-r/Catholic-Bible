# ⚠️ IMPORTANTE: Decisión de Arquitectura de IA (Ollama vs Cloudflare Workers AI)

Este documento detalla el análisis de recursos y la decisión de diseño de la Inteligencia Artificial (IA) para **CatholicVerse**. Si en el futuro se decide cambiar el proveedor del modelo de lenguaje (LLM), este archivo explica el impacto y el procedimiento.

---

## 🏗️ 1. ¿Cómo funciona la "IA entrenada" en CatholicVerse?

Es fundamental entender que en CatholicVerse **no hemos entrenado los pesos neuronales de un modelo desde cero** (lo cual costaría miles de dólares y requeriría GPUs masivas). 

En su lugar, hemos implementado una arquitectura **RAG (Retrieval-Augmented Generation)**:
1. El usuario hace una pregunta.
2. El backend de Spring Boot realiza una **búsqueda semántica en la Base de Datos** del servidor.
3. El backend extrae los versículos bíblicos reales y exactos (evitando alucinaciones).
4. El backend construye un **Prompt de Sistema** (las "reglas de comportamiento") e inyecta los versículos como contexto.
5. Se le envía todo al LLM para que redacte una respuesta amigable.

### 🧠 Implicación de RAG en la portabilidad:
Dado que la "inteligencia y entrenamiento" reside en el **Prompt de Sistema** y en los **datos de tu Base de Datos**, el LLM actúa únicamente como un "redactor". Esto significa que **da exactamente igual qué proveedor de LLM usemos** (sea Ollama local o Cloudflare Workers AI en la nube). Ambos interpretarán las mismas reglas y darán el mismo comportamiento guiado.

---

## ⚖️ 2. Comparativa y Decisión: Ollama Local vs Cloudflare Workers AI

| Criterio | Opción A: Ollama Local (en tu VPS) | Opción B: Cloudflare Workers AI (Nube Edge) |
|----------|-------------------------------------|---------------------------------------------|
| **Costo Servidor** | Requiere ampliar VPS a mínimo 4GB-8GB RAM ($24 - $48/mes). | Funciona en el VPS actual de 1GB RAM ($6/mes). |
| **Costo Consultas**| 100% Gratis e ilimitado. | Gratis en el plan Free de Cloudflare. |
| **Estabilidad** | Alto riesgo de congelar el servidor si hay consultas simultáneas. | 100% Estable. Cloudflare escala automáticamente en sus servidores GPU. |
| **Velocidad** | Lento en CPUs de VPS baratos. | Muy rápido (corre en GPUs de última generación). |

### 🚨 Decisión de Diseño:
Para el lanzamiento inicial de la App en producción, **se ha optado por la Opción B (Cloudflare Workers AI)**. Esto permite mantener los costos del Droplet de DigitalOcean al mínimo absoluto ($6/mes) y garantiza que el servidor de base de datos y la API no se caigan por falta de memoria RAM.

---

## 🔄 3. ¿Qué hacer si decidimos volver a Ollama en el futuro?

Si mañana decides contratar un servidor VPS dedicado de 8GB de RAM o con GPU y deseas alojar la IA de forma local y privada:

1. **En tu Servidor VPS:**
   - Descomenta el servicio `ollama` en el archivo `/BibliaBackend/docker-compose.yml`.
   - Reinicia Docker Compose: `docker compose up -d --build`.
   - Entra al contenedor y descarga el modelo:
     ```bash
     docker exec -it biblia-ollama ollama pull llama3.2:1b
     ```

2. **En tu Backend (Spring Boot):**
   - En tu archivo `application.yml` (o variables de entorno), cambia la URL de la IA:
     ```yaml
     spring:
       ai:
         ollama:
           base-url: http://ollama:11434
     ```
   - Reinicia la API (`./prod-reload-api.sh`).

3. **En el Código Java:**
   - **No hay que tocar nada**. La lógica de RAG en `BibleRagService.java` seguirá buscando en la base de datos y empaquetando el prompt de la misma forma exacta, solo que el destinatario final será tu propio servidor Ollama en lugar del API de Cloudflare.
