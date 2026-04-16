package com.bibliacatolica.api.application.service;

import com.bibliacatolica.api.domain.model.SearchResult;
import com.bibliacatolica.api.domain.port.out.BibleRepositoryPort;
import com.bibliacatolica.api.domain.port.in.BibleRagUseCase;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class BibleRagService implements BibleRagUseCase {

    private final ChatClient chatClient;
    private final BibleRepositoryPort bibleRepositoryPort;

    private final String SYSTEM_PROMPT = """
            Eres un asistente de Inteligencia Artificial integrado en una app de la Biblia Católica.
            DEBES responder SIEMPRE en el MISMO IDIOMA en el que el usuario te ha hecho la pregunta.
            Tu tono debe ser neutral, respetuoso y objetivo. NO debes hacer rol ni actuar como si fueras Dios, ni un sacerdote, ni un personaje bíblico. NO uses frases como 'hijo mío', 'bendiciones' u otras expresiones similares que suenen a ente divino. Eres solo un asistente de Inteligencia Artificial laico que provee información.
            Responde la pregunta del usuario utilizando EXCLUSIVAMENTE los versículos bíblicos proveídos.
            Si la respuesta no se encuentra en esos versículos, simplemente di: "I don't have enough biblical context to answer that" o "No tengo suficiente contexto bíblico para responder eso" (dependiendo del idioma de la pregunta).
            Siempre que cites o referencies un versículo, DEBES formatearlo exactamente así: [[NombreDelLibro Capitulo:Versiculo]]
            Ejemplo: [[Génesis 1:1]] o [[San Mateo 5:3]].

            Versículos de contexto:
            {context}
            """;

    public BibleRagService(ChatClient.Builder chatClientBuilder, BibleRepositoryPort bibleRepositoryPort) {
        this.chatClient = chatClientBuilder.build();
        this.bibleRepositoryPort = bibleRepositoryPort;
    }

    @Override
    public String askBible(String userQuery) {
        log.info("Received query for RAG: {}", userQuery);

        // STEP 0: KEYWORD EXTRACTION
        // IMPORTANTE: El backend busca en una base de datos de la Biblia en ESPAÑOL. La
        // palabra clave MÁGICA DEBE estar siempre traducida al español.
        String keywordPrompt = "Eres un extractor de palabras clave de búsqueda. Extrae la UNICA palabra clave más importante de la siguiente pregunta de un usuario. Traduce esa palabra clave al ESPAÑOL (sin importar el idioma original de la pregunta) y responde ÚNICAMENTE con esa palabra clave en español, sin puntuación, sin artículos y sin explicaciones extra.\nPregunta del usuario: "
                + userQuery;

        String searchTerm = userQuery;
        try {
            searchTerm = chatClient.prompt()
                    .user(keywordPrompt)
                    .call()
                    .content()
                    .trim()
                    .replaceAll("[\"'.]", "");
            log.info("Extracted search term using LLM: {}", searchTerm);
        } catch (Exception e) {
            log.warn("Could not extract keyword with LLM, falling back to full query", e);
        }

        // STEP 1: RETRIEVAL
        // We search the DB for matching context by using the extracted keyword
        List<SearchResult> searchResults = bibleRepositoryPort.searchVerses(searchTerm, 15, 0);

        if (searchResults.isEmpty()) {
            // Small fallback or we could still call AI to apologize nicely
            return "I couldn't find any relevant verses for your question in the database.";
        }

        String contextText = searchResults.stream()
                .map(result -> result.getReference() + " - " + result.getText())
                .collect(Collectors.joining("\n"));

        log.debug("Context derived from database: \n{}", contextText);

        // STEP 2: AUGMENTATION
        String finalSystemPrompt = SYSTEM_PROMPT.replace("{context}", contextText);

        // STEP 3: GENERATION
        try {
            return chatClient.prompt()
                    .system(finalSystemPrompt)
                    .user(userQuery)
                    .call()
                    .content();
        } catch (Exception e) {
            log.error("Error communicating with Ollama AI model", e);
            return "I'm currently unable to process your request due to an AI server issue. Please try again later.";
        }
    }
}
