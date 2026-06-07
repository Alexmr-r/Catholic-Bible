package com.bibliacatolica.api.application.service;

import com.bibliacatolica.api.domain.model.SearchResult;
import com.bibliacatolica.api.domain.port.out.BibleRepositoryPort;
import com.bibliacatolica.api.domain.port.in.BibleRagUseCase;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class BibleRagService implements BibleRagUseCase {

    private final ChatClient chatClient;
    private final BibleRepositoryPort bibleRepositoryPort;
    private final CloudflareAiClient cloudflareAiClient;

    @Value("${spring.ai.provider:cloudflare}")
    private String aiProvider;

    private final String SYSTEM_PROMPT = """
            Eres un Asistente Teológico e Inteligencia Artificial de la Biblia Católica.
            Tu misión es proveer respuestas enriquecedoras, profesionales, profundas y espiritualmente edificantes a los usuarios.

            Normas de comportamiento:
            1. IDIOMA: Responde siempre en el mismo idioma en el que el usuario te ha hecho la pregunta.
            2. TONO: Sé respetuoso, objetivo, pastoral y teológicamente riguroso. No actúes en primera persona como Dios, Jesús o un sacerdote. Eres un asistente virtual laico de doctrina católica.
            3. ESTRUCTURA DE LA RESPUESTA: Haz tus respuestas altamente estructuradas y visualmente premium utilizando markdown (negritas, listas y espaciados). Organiza tu respuesta en las siguientes secciones cuando sea apropiado:
               - **Explicación Bíblica**: Explica el concepto bíblico basándote prioritariamente en los versículos provistos en el contexto, y citando pasajes clave.
               - **Tradición y Magisterio Católico**: Enriquece la explicación con el entendimiento de la Iglesia Católica, los Padres de la Iglesia, los Santos (ej. San Agustín, Santo Tomás) o el Catecismo de la Iglesia Católica.
               - **Reflexión para la Vida**: Brinda una breve aplicación práctica o pastoral para el día a día del cristiano.
            4. ENLACES INTERACTIVOS (CRÍTICO): Siempre que menciones, cites o referencies cualquier libro, capítulo o versículo bíblico (ya sea del contexto o de tu conocimiento general), es OBLIGATORIO que lo encierres en doble corchetes [[ ]].
               Ejemplos correctos:
               - [[Génesis]] (si hablas del libro completo)
               - [[Génesis 2]] (si hablas del capítulo completo)
               - [[Génesis 2:1]] (si citas un versículo específico)
               - [[Mateo 5:3]]

            Versículos de contexto del buscador (úsalos como base principal de referencias):
            {context}
            """;

    public BibleRagService(ChatClient.Builder chatClientBuilder, BibleRepositoryPort bibleRepositoryPort,
            CloudflareAiClient cloudflareAiClient) {
        this.chatClient = chatClientBuilder.build();
        this.bibleRepositoryPort = bibleRepositoryPort;
        this.cloudflareAiClient = cloudflareAiClient;
    }

    private String callLLM(String systemPrompt, String userPrompt) {
        if ("cloudflare".equalsIgnoreCase(aiProvider)) {
            return cloudflareAiClient.generate(systemPrompt, userPrompt);
        } else {
            log.info("Calling local Ollama LLM provider");
            var promptSpec = chatClient.prompt();
            if (systemPrompt != null && !systemPrompt.trim().isEmpty()) {
                promptSpec = promptSpec.system(systemPrompt);
            }
            return promptSpec.user(userPrompt).call().content();
        }
    }

    @Override
    public String askBible(String userQuery) {
        log.info("Received query for RAG (Provider: {}): {}", aiProvider, userQuery);

        // STEP 0: KEYWORD EXTRACTION
        // IMPORTANTE: El backend busca en una base de datos de la Biblia en INGLÉS
        // (CPDV).
        // La palabra clave MÁGICA DEBE estar siempre traducida al inglés y corregida de
        // errores tipográficos.
        String keywordPrompt = """
                Eres un extractor de palabras clave de búsqueda experto en temas bíblicos.
                Tu tarea es extraer el término, personaje, lugar o concepto bíblico más importante de la pregunta del usuario.

                Reglas obligatorias:
                1. Corrige cualquier error ortográfico, tipográfico o de escritura en el término (ej: si escriben 'nohe' o 'noe', corrígelo a 'Noah'; si escriben 'moises', a 'Moses'; si escriben 'genesis', a 'Genesis').
                2. Traduce el término resultante SIEMPRE al inglés (ej: 'Adán' -> 'Adam', 'Eva' -> 'Eve', 'arca' -> 'ark').
                3. Responde ÚNICAMENTE con la palabra en inglés resultante, sin artículos, sin explicaciones y sin puntuación.

                Pregunta del usuario: """
                + userQuery;

        String searchTerm = userQuery;
        try {
            searchTerm = callLLM("", keywordPrompt)
                    .trim()
                    .replaceAll("[\"'.]", "");
            log.info("Extracted search term using LLM: {}", searchTerm);
        } catch (Exception e) {
            log.warn("Could not extract keyword with LLM, falling back to original query", e);
        }

        // STEP 1: RETRIEVAL
        // We search the DB for matching context by using the extracted keyword
        List<SearchResult> searchResults = bibleRepositoryPort.searchVerses(searchTerm, 15, 0);

        String contextText;
        if (searchResults.isEmpty()) {
            log.info("No database search results found for term: {}. Proceeding with general knowledge fallback.",
                    searchTerm);
            contextText = "(No se encontraron versículos de coincidencia exacta en la base de datos para la palabra clave: "
                    + searchTerm
                    + ". Responde usando tu conocimiento teológico católico y cita las escrituras oportunas en formato [[Libro Capitulo:Versiculo]])";
        } else {
            contextText = searchResults.stream()
                    .map(result -> result.getReference() + " - " + result.getText())
                    .collect(Collectors.joining("\n"));
        }

        log.debug("Context derived from database: \n{}", contextText);

        // STEP 2: AUGMENTATION
        String finalSystemPrompt = SYSTEM_PROMPT.replace("{context}", contextText);

        // STEP 3: GENERATION
        try {
            return callLLM(finalSystemPrompt, userQuery);
        } catch (Exception e) {
            log.error("Error communicating with LLM model", e);
            return "I'm currently unable to process your request due to an AI server issue. Please try again later.";
        }
    }
}
