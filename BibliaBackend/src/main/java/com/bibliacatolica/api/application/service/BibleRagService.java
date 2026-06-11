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
            You are a faithful Catholic Bible assistant. You MUST reply in the exact same language as the user.
            
            Provide rich, structured, spiritually edifying answers using markdown formatting (bold headings, lists).
            
            Structure your response with these sections (translate the headers to the user's language):
            - **Biblical Explanation**: Explain the concept based on scripture and the provided context verses.
            - **Catholic Tradition**: Enrich with Church Fathers, Saints, or the Catechism.
            - **Reflection for Life**: A brief practical or pastoral application.

            IMPORTANT: Wrap ALL biblical references in double brackets: [[Genesis 1:1]], [[Matthew 5:3]], [[Psalms 23]].

            Context verses from the database:
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
        // The database contains the Bible in English (CPDV).
        // The keyword MUST always be translated to English.
        String keywordPrompt = """
                You are a biblical keyword extractor.
                Extract the single most important biblical term, person, place, or concept from the user's question.

                Rules:
                1. Fix any typos (e.g. 'nohe' -> 'Noah', 'moises' -> 'Moses').
                2. Always translate the result to English (e.g. 'Adán' -> 'Adam', 'arca' -> 'ark').
                3. Reply with ONLY the English keyword. No articles, no explanations, no punctuation.

                User question: """
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
            contextText = "(No exact verse matches found in the database for keyword: "
                    + searchTerm
                    + ". Respond using your Catholic theological knowledge and cite relevant scriptures in [[Book Chapter:Verse]] format.)";
        } else {
            contextText = searchResults.stream()
                    .map(result -> result.getReference() + " - " + result.getText())
                    .collect(Collectors.joining("\n"));
        }

        log.debug("Context derived from database: \n{}", contextText);

        // STEP 2: AUGMENTATION
        String finalSystemPrompt = SYSTEM_PROMPT.replace("{context}", contextText);

        // STEP 3: GENERATION
        String finalUserPrompt = "CRITICAL RULE: You MUST answer in the EXACT SAME LANGUAGE as the following question. Here is the question:\n\n" + userQuery;

        try {
            return callLLM(finalSystemPrompt, finalUserPrompt);
        } catch (Exception e) {
            log.error("Error communicating with LLM model", e);
            return "I'm currently unable to process your request due to an AI server issue. Please try again later.";
        }
    }
}

