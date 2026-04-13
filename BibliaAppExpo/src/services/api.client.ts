import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from './config';

/**
 * Cliente HTTP base para todas las peticiones a la API
 */
class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await AsyncStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async request<T>(endpoint: string, options: RequestInit & { timeout?: number }): Promise<T> {
    const controller = new AbortController();
    const timeoutValue = options.timeout !== undefined ? options.timeout : API_CONFIG.TIMEOUT;

    let id: any = null;
    if (timeoutValue > 0) {
      id = setTimeout(() => controller.abort(), timeoutValue);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(id);

      if (!response.ok) {
        throw await this.handleError(response);
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(id);
      if (error.name === 'AbortError') {
        const timeoutError: any = new Error('Timeout: El servidor tarda demasiado en responder');
        timeoutError.status = 408;
        throw timeoutError;
      }
      if (error instanceof TypeError && error.message === 'Network request failed') {
        const netError: any = new Error('Error de red: Verifica tu conexión a internet');
        netError.status = 0;
        throw netError;
      }
      throw error;
    }
  }

  async get<T>(endpoint: string, customTimeout?: number): Promise<T> {
    const headers = await this.getAuthHeaders();
    return this.request<T>(endpoint, { method: 'GET', headers, timeout: customTimeout });
  }

  async post<T>(endpoint: string, data?: unknown, customTimeout?: number): Promise<T> {
    const headers = await this.getAuthHeaders();
    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      timeout: customTimeout,
    });
  }

  async put<T>(endpoint: string, data?: unknown, customTimeout?: number): Promise<T> {
    const headers = await this.getAuthHeaders();
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      timeout: customTimeout,
    });
  }

  async patch<T>(endpoint: string, data?: unknown, customTimeout?: number): Promise<T> {
    const headers = await this.getAuthHeaders();
    return this.request<T>(endpoint, {
      method: 'PATCH',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      timeout: customTimeout,
    });
  }

  async delete(endpoint: string, customTimeout?: number): Promise<void> {
    const headers = await this.getAuthHeaders();
    const controller = new AbortController();
    const timeoutValue = customTimeout !== undefined ? customTimeout : API_CONFIG.TIMEOUT;
    let id: any = null;
    if (timeoutValue > 0) {
      id = setTimeout(() => controller.abort(), timeoutValue);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers,
        signal: controller.signal,
      });

      clearTimeout(id);

      if (!response.ok) {
        throw await this.handleError(response);
      }
    } catch (error: any) {
      clearTimeout(id);
      if (error.name === 'AbortError') {
        throw new Error('Timeout: El servidor tarda demasiado en responder');
      }
      throw error;
    }
  }

  private async handleError(response: Response): Promise<Error> {
    try {
      const errorData = await response.json();
      const error: any = new Error(errorData.message || 'Error en la petición');
      error.status = response.status;
      return error;
    } catch {
      const error: any = new Error(`Error ${response.status}: ${response.statusText}`);
      error.status = response.status;
      return error;
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;

