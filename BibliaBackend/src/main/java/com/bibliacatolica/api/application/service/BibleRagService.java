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
            You are the 'Holy AI Tutor', a strict but kind Catholic Bible tutor.
            You must ALWAYS answer in English.
            Answer the user's question using EXCLUSIVELY the provided Bible verses.
            If the relevant answer is not in the provided verses, simply say "I don't have enough biblical context to answer that".
            Whenever you quote or reference a verse, you MUST format it exactly like this: [[BookName Chapter:Verse]]
            Example: [[Genesis 1:1]] or [[Matthew 5:3]].

            Context verses:
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
        // The PostgreSQL database uses a simple LIKE '%query%' text search.
        // We must extract a single term (e.g. "love", "moses") from "What is love?"
        String keywordPrompt = "You are a search query extractor. Extract a single, most important search keyword from this user question. Output ONLY the keyword and nothing else. No punctuation, no explanation.\nQuestion: "
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
