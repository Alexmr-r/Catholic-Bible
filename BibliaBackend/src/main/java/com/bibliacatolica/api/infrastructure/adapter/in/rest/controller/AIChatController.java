package com.bibliacatolica.api.infrastructure.adapter.in.rest.controller;

import com.bibliacatolica.api.domain.port.in.BibleRagUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * REST Controller that exposes the AI Assistant chat endpoint.
 */
@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class AIChatController {

    private final BibleRagUseCase bibleRagUseCase;

    /**
     * Endpoint for AI chat interactions.
     * Expects a JSON body with a 'query' field.
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        String userQuery = request.get("query");

        if (userQuery == null || userQuery.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Query cannot be empty"));
        }

        // Pass the query to the application layer UseCase
        String aiResponse = bibleRagUseCase.askBible(userQuery);

        return ResponseEntity.ok(Map.of("response", aiResponse));
    }
}
