import apiClient from './api.client';

export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

class AIService {
    // Intermediario que habliará con el Backend Spring Boot y Ollama.
    async sendMessage(query: string): Promise<string> {
        console.log('[AIService] Sending query to AI:', query);

        try {
            const data = await apiClient.post<{ response: string }>('/chat', { query });
            return data.response || "No response found.";
        } catch (error) {
            console.error('[AIService] Failed to fetch from backend:', error);
            return "I apologize, but I cannot reach the server right now. Make sure the database and AI environment are running.";
        }
    }
}

export const aiService = new AIService();
