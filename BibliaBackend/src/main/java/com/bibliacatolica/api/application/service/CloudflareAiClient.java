package com.bibliacatolica.api.application.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class CloudflareAiClient {

    private final RestClient restClient;

    @Value("${cloudflare.ai.account-id:}")
    private String accountId;

    @Value("${cloudflare.ai.api-token:}")
    private String apiToken;

    @Value("${cloudflare.ai.model:@cf/meta/llama-3-8b-instruct}")
    private String model;

    public CloudflareAiClient() {
        this.restClient = RestClient.builder().build();
    }

    @SuppressWarnings("unchecked")
    public String generate(String systemPrompt, String userPrompt) {
        if (accountId == null || accountId.trim().isEmpty() || apiToken == null || apiToken.trim().isEmpty()) {
            log.warn("Cloudflare AI credentials are not configured. Make sure CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are set.");
            throw new IllegalStateException("Cloudflare AI is not configured. Missing Account ID or API Token.");
        }

        String url = String.format("https://api.cloudflare.com/client/v4/accounts/%s/ai/run/%s", accountId.trim(), model.trim());

        // Construct message list
        List<Map<String, String>> messages;
        if (systemPrompt != null && !systemPrompt.trim().isEmpty()) {
            messages = List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user", "content", userPrompt)
            );
        } else {
            messages = List.of(
                    Map.of("role", "user", "content", userPrompt)
            );
        }

        Map<String, Object> body = Map.of("messages", messages);

        try {
            log.info("Sending request to Cloudflare Workers AI using model: {}", model);
            Map<String, Object> response = restClient.post()
                    .uri(url)
                    .headers(headers -> {
                        headers.setBearerAuth(apiToken.trim());
                        headers.setContentType(MediaType.APPLICATION_JSON);
                    })
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.containsKey("result")) {
                Map<String, Object> result = (Map<String, Object>) response.get("result");
                if (result != null && result.containsKey("response")) {
                    return (String) result.get("response");
                }
            }

            log.error("Invalid response format received from Cloudflare AI: {}", response);
            throw new RuntimeException("Failed to get a valid response from Cloudflare AI.");
        } catch (Exception e) {
            log.error("Error communicating with Cloudflare Workers AI", e);
            throw e;
        }
    }
}
