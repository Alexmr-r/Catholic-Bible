import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './api.client';

// ========== Types ==========

export interface User {
  id: string;
  email: string;
  fullName: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ========== Auth Service ==========

export const authService = {
  /**
   * Registra un nuevo usuario
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    await this.saveTokens(response);
    return response;
  },

  /**
   * Inicia sesión
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    await this.saveTokens(response);
    return response;
  },

  /**
   * Refresca el token de acceso
   */
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No hay refresh token');
    }

    const response = await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
    await this.saveTokens(response);
    return response;
  },

  /**
   * Cierra sesión
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.log('Error en logout:', error);
    } finally {
      await this.clearTokens();
    }
  },

  /**
   * Obtiene el usuario actual
   */
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  },

  /**
   * Verifica si el usuario está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('accessToken');
    return !!token;
  },

  /**
   * Guarda los tokens en AsyncStorage
   */
  async saveTokens(response: AuthResponse): Promise<void> {
    await AsyncStorage.setItem('accessToken', response.accessToken);
    await AsyncStorage.setItem('refreshToken', response.refreshToken);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));
  },

  /**
   * Limpia los tokens de AsyncStorage
   */
  async clearTokens(): Promise<void> {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
  },

  /**
   * Obtiene el usuario guardado localmente
   */
  async getSavedUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

export default authService;

