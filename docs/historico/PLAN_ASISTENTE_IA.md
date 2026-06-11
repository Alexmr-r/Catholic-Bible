# 🤖 Plan y Arquitectura: Asistente Bíblico IA (RAG + Ollama)

Este documento centraliza toda la estrategia, arquitectura y pasos a seguir para implementar un Asistente de Inteligencia Artificial como un "Tutor Bíblico" dentro de la BibliaApp, garantizando coste cero de mantenimiento operativo, cero problemas de licencias y 100% privacidad de los datos de los colegios.

---

## 🏗️ La Arquitectura: RAG (Retrieval-Augmented Generation)

Para evitar que la IA (LLM) alucine o invente dogmas, usaremos RAG. 
La IA no contestará "de memoria", sino que actuará como un intérprete literario que **solo tiene permiso para leer los versículos exactos de la base de datos de la aplicación**.

### Flujo de Datos
1. **Frontend (App Móvil):** El usuario escribe "Who was Moses?".
2. **Backend (Spring Boot):** Recibe la pregunta.
   - Ejecuta una búsqueda semántica o por palabras clave en la Base de Datos SQLite/PostgreSQL.
   - Extrae el texto exacto de `Exodus 14`.
3. **Generación (Ollama en Docker):** Spring Boot le dice a Ollama: _"The user asked X. Respond nicely for students using EXCLUSIVELY this text: [Exodus 14...]"_.
4. **Respuesta:** Ollama genera el resumen y Spring Boot lo manda de vuelta al móvil.

---

## 🌎 Idioma y Base de Datos (Inglés)

Dado que tu base de datos SQLite tiene los textos bíblicos en inglés, **es absolutamente crucial y obligatorio que el asistente opere en inglés**.

**Razones técnicas:**
1. **Semantic Search (RAG)**: Si el usuario pregunta "amor", la base de datos no encontrará nada, porque el texto dice "love".
2. **Rendimiento de la IA**: Modelos como `llama3` o `phi3` fueron entrenados con 90% de datos en inglés. Son muchísimo más listos, rápidos y precisos razonando en inglés que en español.
3. **Mapeo de Libros**: Es más fácil convertir "Genesis" a `genesis` que lidiar con acentos ("Génesis" a `genesis`).

Por lo tanto, la interfaz del usuario (UI) y los comandos internos (Prompts) han sido codificados en inglés (`Holy AI Tutor`).

---

## 📱 Fase 1: Desarrollo del Frontend (React Native) - [COMPLETADO]

### 1. `src/services/ai.service.ts` (El Motor de Comunicación)
Esta es una clase Singleton (solo existe una instancia global llamada `aiService`) que se encarga de aislar la conexión a internet de los componentes visuales.
*   **Método principal**: `sendMessage(query: string): Promise<string>`
*   **¿Qué hace?**: Toma el texto que escribe el usuario, le añade un pequeño retraso artificial (para simular el "escribiendo...") y devuelve un texto simulado (Mock).
*   **Futuro Backend**: Aquí es exactamente donde, en el futuro, haremos el `fetch("http://192.168.1.40:8080/api/chat", { method: 'POST', body: query })` apuntando a tu servidor Spring Boot con Docker.

### 2. `src/components/MessageParser.tsx` (El "Traductor" de Enlaces)
Este es el componente visual más inteligente. No muestra texto plano, sino que lo "escanea" buscando referencias bíblicas.
*   **Regex Mágico**: Utiliza la expresión regular `/\[\[([A-Za-z0-9\s]+)\s(\d+):(\d+)(-\d+)?\]\]/g` para encontrar textos envueltos en corchetes como `[[Genesis 1:1]]`.
*   **¿Cómo funciona?**:
    *   Corta la frase en trozos usando `text.split()`.
    *   Si un trozo es un texto normal (`"God created the heaven..."`), lo pinta con el componente `<Text>` en color normal.
    *   Si detecta un corchete, limpia el texto, pinta un `<Text>` en color dorado vibrante que además tiene la función `onPress`.
*   **Navegación**: Al pulsar el enlace dorado, la función `navigateToChapter` dispara un evento hacia `AppNavigator`, mandando al usuario a la pantalla de lectura con el `bookId` (ej. `genesis`) y su capítulo exacto.

### 3. `src/screens/AIAssistantScreen.tsx` (La Pantalla del Chat)
Esta es la interfaz gráfica donde interactúa el usuario, diseñada para replicar la experiencia de ChatGPT o iMessage.
*   **Estado (State)**: Usa un array de objetos `messages`. Cada mensaje tiene un `id`, `text`, y un `sender` (que puede ser `'user'` o `'ai'`).
*   **Componentes Clave**:
    *   **`<KeyboardAvoidingView>`**: Evita que el teclado virtual del iPhone tape el cajón de escritura cuando el usuario va a escribir.
    *   **`<FlatList>`**: Renderiza la lista de mensajes de forma ultrarrápida (solo carga los mensajes visibles en pantalla). Además, tiene un `ref={flatListRef}` para hacer scroll automático hacia abajo cuando llega un mensaje nuevo.
    *   **Indicador de Escribiendo**: Una variable booleana `isTyping` muestra un ActivityIndicator (la ruedita) para darle feedback visual al usuario mientras `ai.service.ts` resuelve la promesa simulada de 1.5 segundos.
*   **Compatibilidad**. Soporta los colores litúrgicos del `ThemeContext`, cambiando fondos de oscuros a claros en tiempo real.

---

## 🛠 Fase 2: Desarrollo del Backend (Spring Boot + Ollama en Docker) - [GUÍA DE IMPLEMENTACIÓN]

Como la app se va a monetizar y desplegar en colegios, montaremos todo en **Docker** para tenerlo empaquetado y transportable. Aquí tienes la guía absoluta paso a paso para replicarlo en tu proyecto Spring Boot.

### 1. El ecosistema Docker en el Servidor (`docker-compose.yml`)
En la raíz de tu proyecto Backend, necesitas crear un archivo `docker-compose.yml` que levantará tu base de datos y la IA.

```yaml
version: '3.8'
services:
  # El Cerebro de la IA (Ollama)
  ollama:
    image: ollama/ollama:latest
    container_name: bible_ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    restart: always

  # (Opcional) Si en el futuro pasas de SQLite a PostgreSQL
  db:
    image: postgres:15
    container_name: bible_postgres
    environment:
      POSTGRES_DB: bible_db
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secretpassword
    ports:
      - "5432:5432"

volumes:
  ollama_data:
```

**Paso Crítico tras levantar Docker:**
Una vez hagas `docker-compose up -d`, debes entrar al contenedor y descargar el modelo de inteligencia artificial gratuito (pesa unos ~2GB). Usaremos Llama 3.2 1B (Ultra rápido para servidores):
```bash
docker exec -it bible_ollama ollama run llama3.2:1b
```

### 2. Configuración en Spring Boot (`pom.xml` y `application.yml`)

Debes añadir la dependencia oficial de **Spring AI**.
Abre tu `pom.xml` (o `build.gradle` si usas Gradle) y añade:
```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-ollama-spring-boot-starter</artifactId>
    <version>1.0.0-M1</version> <!-- Revisa la última versión estable -->
</dependency>
```

Abre tu `application.yml` y dile a Spring dónde encontrar a Ollama:
```yaml
spring:
  ai:
    ollama:
      base-url: http://localhost:11434
      chat:
        options:
          model: llama3.2:1b
          temperature: 0.2  # Bajo para que no invente (0 = robótico, 1 = creativo)
```

### 3. El Controlador (`AIChatController.java`)
Crea un endpoint REST que tu App móvil (React Native) pueda consumir.

```java
@RestController
@RequestMapping("/api/v1/chat")
public class AIChatController {

    private final BibleRagService bibleRagService;

    public AIChatController(BibleRagService bibleRagService) {
        this.bibleRagService = bibleRagService;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        String userQuery = request.get("query");
        String aiResponse = bibleRagService.askBible(userQuery);
        
        return ResponseEntity.ok(Map.of("response", aiResponse));
    }
}
```

### 4. El Motor RAG (`BibleRagService.java`)
Aquí es donde ocurre la magia de verdad. Esta clase primero busca en la base de datos (JPA / Hibernate) y luego le pasa el contexto a Ollama.

```java
@Service
public class BibleRagService {

    private final ChatClient chatClient;
    private final VerseRepository verseRepository; // Tu Repositorio Crud/JPA normal

    // 1. El Prompt del Sistema (Las Reglas Militares)
    private final String SYSTEM_PROMPT = """
        You are the 'Holy AI Tutor', a strict Catholic Bible tutor.
        Answer the user's question using EXCLUSIVELY the provided Bible verses.
        If the answer is not in the provided verses, say "I don't have enough biblical context to answer that".
        Whenever you quote or reference a verse, you MUST format it exactly like this: [[BookName Chapter:Verse]]
        Example: [[Genesis 1:1]] or [[Matthew 5:3]].
        
        Context verses:
        {context}
        """;

    public BibleRagService(ChatClient.Builder chatClientBuilder, VerseRepository verseRepository) {
        this.chatClient = chatClientBuilder.build();
        this.verseRepository = verseRepository;
    }

    public String askBible(String userQuery) {
        // PASO 0: EXTRACCIÓN DE PALABRAS CLAVE (LLM)
        // Ya que la BD usa `LIKE '%query%'`, no podemos buscar toda la oración "What is love?".
        // Usamos primero a Ollama para que nos extraiga la palabra clave:
        String keywordPrompt = "Extract a single search keyword from this question: " + userQuery;
        String searchTerm = chatClient.prompt().user(keywordPrompt).call().content();

        // PASO 1: RETRIEVAL (Búsqueda)
        // Buscamos versículos en tu DB usando solo LA PALABRA CLAVE ("love")
        List<Verse> foundVerses = verseRepository.searchByKeyword(searchTerm);
        
        // Empaquetamos los versículos en un String plano
        String contextText = foundVerses.stream()
            .map(v -> v.getBook().getName() + " " + v.getChapter() + ":" + v.getVerseNumber() + " - " + v.getText())
            .collect(Collectors.joining("\\n"));

        // PASO 2: AUGMENTATION (Unir Reglas + Versículos)
        String finalSystemPrompt = SYSTEM_PROMPT.replace("{context}", contextText);

        // PASO 3: GENERATION (Llamada a Ollama)
        return chatClient.prompt()
            .system(finalSystemPrompt) // Le pasamos las reglas y los versículos
            .user(userQuery)           // Le pasamos la pregunta original del niño
            .call()
            .content();                // Devuelve la respuesta generada
    }
}
```

### 5. Seguridad y Autenticación (JWT)
El endpoint del chat (`/api/v1/chat`) está protegido de forma deliberada por `Spring Security` en el backend. 
- Al ser una función que cuesta recursos de servidor (CPU para mover a Ollama), **requiere que el usuario esté registrado e inicie sesión**.
- Por ende, en el Frontend usamos la clase `ApiClient.ts`, la cual se encarga de inyectar el Bearer Token (`JWT`) desde el `AsyncStorage`.
- **Previene abusos**: Si el endpoint fuera público, cualquiera podría colapsar tu servidor enviando peticiones maliciosas (DDoS). Ahora, solamente tus usuarios registrados y autenticados tienen acceso a la IA.

### Resumen del Flujo Backend Creado:
- `BibleRagUseCase.java`: Puerto de entrada Hexagonal.
- `AIChatController.java`: Expone la ruta privada `/chat`.
- `BibleRagService.java`: Ejecuta la magia de doble paso: 1. Llamar a Ollama para extraer palabras clave -> 2. Buscar en base de datos de PostgreSQL -> 3. Llamar a Ollama de nuevo con los textos reales para asegurar cero alucinaciones.
