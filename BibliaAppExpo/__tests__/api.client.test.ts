/**
 * Tests unitarios para el API Client
 * Mock de fetch y AsyncStorage para testing aislado
 */

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve('mock-token-123')),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
  },
}));

// Mock config
jest.mock('../src/services/config', () => ({
  API_CONFIG: {
    BASE_URL: 'http://test-api.example.com/api/v1',
    TIMEOUT: 5000,
    TIMEOUT_AI: 0,
  },
}));

// Mock global fetch
const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

// Necesitamos importar después de los mocks
import { apiClient } from '../src/services/api.client';

beforeEach(() => {
  mockFetch.mockClear();
});

describe('ApiClient', () => {
  describe('GET requests', () => {
    it('realiza GET con headers de autenticación', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ data: 'test' })),
      });

      const result = await apiClient.get<{ data: string }>('/test');

      expect(result).toEqual({ data: 'test' });
      expect(mockFetch).toHaveBeenCalledTimes(1);

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe('http://test-api.example.com/api/v1/test');
      expect(options.method).toBe('GET');
      expect(options.headers).toHaveProperty('Authorization', 'Bearer mock-token-123');
    });
  });

  describe('POST requests', () => {
    it('envía datos en el body como JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ id: '1' })),
      });

      const body = { email: 'test@test.com', password: '12345678' };
      await apiClient.post('/auth/login', body);

      const [_, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('POST');
      expect(JSON.parse(options.body)).toEqual(body);
      expect(options.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('PUT requests', () => {
    it('realiza PUT correctamente', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ updated: true })),
      });

      await apiClient.put('/user/profile', { fullName: 'Nuevo Nombre' });

      const [_, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('PUT');
    });
  });

  describe('DELETE requests', () => {
    it('realiza DELETE correctamente', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(''),
      });

      await apiClient.delete('/favorites/123');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/favorites/123');
      expect(options.method).toBe('DELETE');
    });
  });

  describe('Manejo de errores', () => {
    it('lanza error para respuestas no-ok con JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'No autorizado' }),
      });

      await expect(apiClient.get('/protected')).rejects.toThrow('No autorizado');
    });

    it('lanza error genérico para respuestas no-ok sin JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('no JSON')),
      });

      await expect(apiClient.get('/broken')).rejects.toThrow();
    });

    it('lanza error de red cuando fetch falla', async () => {
      const networkError = new TypeError('Network request failed');
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(apiClient.get('/offline')).rejects.toThrow('Network Error');
    });
  });

  describe('Respuestas vacías', () => {
    it('maneja respuesta vacía correctamente', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(''),
      });

      const result = await apiClient.get('/empty');
      expect(result).toEqual({});
    });
  });
});
