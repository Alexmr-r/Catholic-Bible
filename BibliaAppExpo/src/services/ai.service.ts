import apiClient from './api.client';
import { API_CONFIG } from './config';

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
            const data = await apiClient.post<{ response: string }>('/chat', { query }, API_CONFIG.TIMEOUT_AI);
            return data.response || "No response found.";
        } catch (error: any) {
            console.error('[AIService] Failed to fetch from backend:', error);

            const status = error?.status;

            if (status === 401 || status === 403) {
                return 'Your session is not authorized for the AI assistant. Please sign in again.';
            }

            if (status === 408) {
                return 'The AI server is taking too long to respond. Please try again in a moment.';
            }

            if (status === 0) {
                return 'Network error. Please verify your internet connection and backend availability.';
            }

            if (typeof status === 'number' && status >= 500) {
                return 'The AI service is temporarily unavailable. Please try again later.';
            }

            return error?.message || 'Unable to process your AI request right now. Please try again later.';
        }
    }
}

export const aiService = new AIService();
