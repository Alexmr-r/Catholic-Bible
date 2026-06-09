/**
 * Tests unitarios para AuthService
 * Verifica la lógica de autenticación y gestión de tokens
 */

// Mock AsyncStorage
const mockStorageData: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn((key: string) => Promise.resolve(mockStorageData[key] || null)),
    setItem: jest.fn((key: string, value: string) => {
      mockStorageData[key] = value;
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      delete mockStorageData[key];
      return Promise.resolve();
    }),
    multiRemove: jest.fn((keys: string[]) => {
      keys.forEach(k => delete mockStorageData[k]);
      return Promise.resolve();
    }),
  },
}));

// Mock apiClient
const mockGet = jest.fn();
const mockPost = jest.fn();
jest.mock('../src/services/api.client', () => ({
  apiClient: {
    get: (...args: any[]) => mockGet(...args),
    post: (...args: any[]) => mockPost(...args),
  },
}));

import { authService } from '../src/services/auth.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

beforeEach(() => {
  Object.keys(mockStorageData).forEach(k => delete mockStorageData[k]);
  jest.clearAllMocks();
});

describe('AuthService', () => {
  const mockAuthResponse = {
    user: {
      id: 'user-123',
      email: 'test@example.com',
      fullName: 'Test User',
      isPremium: false,
      isTrialActive: true,
    },
    accessToken: 'access-token-123',
    refreshToken: 'refresh-token-456',
    expiresIn: 86400000,
  };

  describe('register()', () => {
    it('registra y guarda tokens', async () => {
      mockPost.mockResolvedValueOnce(mockAuthResponse);

      const result = await authService.register({
        email: 'new@example.com',
        password: 'password123',
        fullName: 'New User',
      });

      expect(mockPost).toHaveBeenCalledWith('/auth/register', {
        email: 'new@example.com',
        password: 'password123',
        fullName: 'New User',
      });
      expect(result.user.email).toBe('test@example.com');
      expect(mockStorageData['accessToken']).toBe('access-token-123');
      expect(mockStorageData['refreshToken']).toBe('refresh-token-456');
    });
  });

  describe('login()', () => {
    it('inicia sesión y guarda tokens', async () => {
      mockPost.mockResolvedValueOnce(mockAuthResponse);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockPost).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.accessToken).toBe('access-token-123');
    });
  });

  describe('loginWithGoogle()', () => {
    it('envía idToken al endpoint de Google', async () => {
      mockPost.mockResolvedValueOnce(mockAuthResponse);

      await authService.loginWithGoogle('google-id-token');

      expect(mockPost).toHaveBeenCalledWith('/auth/google', {
        idToken: 'google-id-token',
      });
    });
  });

  describe('loginWithApple()', () => {
    it('envía identityToken y fullName al endpoint de Apple', async () => {
      mockPost.mockResolvedValueOnce(mockAuthResponse);

      await authService.loginWithApple('apple-identity-token', 'Apple User');

      expect(mockPost).toHaveBeenCalledWith('/auth/apple', {
        identityToken: 'apple-identity-token',
        fullName: 'Apple User',
      });
    });
  });

  describe('logout()', () => {
    it('limpia tokens incluso si la API falla', async () => {
      mockStorageData['accessToken'] = 'token';
      mockStorageData['refreshToken'] = 'refresh';
      mockStorageData['user'] = '{}';

      mockPost.mockRejectedValueOnce(new Error('Network error'));

      await authService.logout();

      expect(mockStorageData['accessToken']).toBeUndefined();
      expect(mockStorageData['refreshToken']).toBeUndefined();
      expect(mockStorageData['user']).toBeUndefined();
    });
  });

  describe('isAuthenticated()', () => {
    it('devuelve true cuando hay token', async () => {
      mockStorageData['accessToken'] = 'some-token';
      expect(await authService.isAuthenticated()).toBe(true);
    });

    it('devuelve false cuando no hay token', async () => {
      expect(await authService.isAuthenticated()).toBe(false);
    });
  });

  describe('getSavedUser()', () => {
    it('devuelve usuario guardado', async () => {
      const user = { id: '1', email: 'test@test.com', fullName: 'Test' };
      mockStorageData['user'] = JSON.stringify(user);

      const result = await authService.getSavedUser();
      expect(result).toEqual(user);
    });

    it('devuelve null si no hay usuario guardado', async () => {
      const result = await authService.getSavedUser();
      expect(result).toBeNull();
    });
  });

  describe('refreshToken()', () => {
    it('lanza error si no hay refresh token', async () => {
      await expect(authService.refreshToken()).rejects.toThrow('No hay refresh token');
    });

    it('refresca tokens correctamente', async () => {
      mockStorageData['refreshToken'] = 'old-refresh';
      mockPost.mockResolvedValueOnce(mockAuthResponse);

      const result = await authService.refreshToken();
      expect(mockPost).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken: 'old-refresh',
      });
      expect(result.accessToken).toBe('access-token-123');
    });
  });

  describe('getCurrentUser()', () => {
    it('obtiene usuario del endpoint /auth/me', async () => {
      const user = { id: '1', email: 'test@test.com', fullName: 'Test' };
      mockGet.mockResolvedValueOnce(user);

      const result = await authService.getCurrentUser();
      expect(mockGet).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(user);
    });
  });
});
