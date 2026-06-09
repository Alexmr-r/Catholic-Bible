/**
 * Tests unitarios para CacheService
 * Mock de AsyncStorage para testing sin dispositivo
 */

// Mock AsyncStorage
const mockStorage: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn((key: string, value: string) => {
      mockStorage[key] = value;
      return Promise.resolve();
    }),
    getItem: jest.fn((key: string) => {
      return Promise.resolve(mockStorage[key] || null);
    }),
    removeItem: jest.fn((key: string) => {
      delete mockStorage[key];
      return Promise.resolve();
    }),
    multiRemove: jest.fn((keys: string[]) => {
      keys.forEach(key => delete mockStorage[key]);
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => {
      return Promise.resolve(Object.keys(mockStorage));
    }),
  },
}));

import { cacheService, CACHE_KEYS } from '../src/services/cache.service';

// Silenciar console.log en tests
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

beforeEach(() => {
  // Limpiar storage entre tests
  Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
  jest.clearAllMocks();
});

describe('CacheService', () => {
  describe('Operaciones genéricas set/get/remove', () => {
    it('guarda y recupera datos correctamente', async () => {
      const testData = { name: 'Test', value: 42 };
      await cacheService.set('test_key', testData);
      const result = await cacheService.get<{ name: string; value: number }>('test_key');
      expect(result).toEqual(testData);
    });

    it('devuelve null para clave inexistente', async () => {
      const result = await cacheService.get('nonexistent_key');
      expect(result).toBeNull();
    });

    it('elimina datos correctamente', async () => {
      await cacheService.set('to_remove', { data: true });
      await cacheService.remove('to_remove');
      const result = await cacheService.get('to_remove');
      expect(result).toBeNull();
    });
  });

  describe('Writings (Escritos)', () => {
    it('guarda y recupera escritos', async () => {
      const writings = [
        { id: '1', title: 'Reflexión 1', content: 'Contenido 1' },
        { id: '2', title: 'Reflexión 2', content: 'Contenido 2' },
      ];
      await cacheService.setWritings(writings);
      const result = await cacheService.getWritings();
      expect(result).toEqual(writings);
    });

    it('devuelve null si no hay escritos', async () => {
      const result = await cacheService.getWritings();
      expect(result).toBeNull();
    });
  });

  describe('Favorites (Favoritos)', () => {
    it('guarda y recupera favoritos', async () => {
      const favorites = [
        { id: '1', bookName: 'Génesis', chapter: 1, verse: 1 },
      ];
      await cacheService.setFavorites(favorites);
      const result = await cacheService.getFavorites();
      expect(result).toEqual(favorites);
    });

    it('devuelve null si no hay favoritos', async () => {
      const result = await cacheService.getFavorites();
      expect(result).toBeNull();
    });
  });

  describe('Daily Reading (Lectura del día)', () => {
    it('guarda y recupera lectura del día', async () => {
      const reading = { title: 'Evangelio', bookName: 'San Juan', chapter: 3 };
      await cacheService.setDailyReading('2026-06-09', reading);
      const result = await cacheService.getDailyReading('2026-06-09');
      expect(result).toEqual(reading);
    });

    it('hasDailyReading() devuelve true cuando existe', async () => {
      const reading = { title: 'Lectura' };
      await cacheService.setDailyReading('2026-06-09', reading);
      expect(await cacheService.hasDailyReading('2026-06-09')).toBe(true);
    });

    it('hasDailyReading() devuelve false cuando no existe', async () => {
      expect(await cacheService.hasDailyReading('2099-01-01')).toBe(false);
    });
  });

  describe('Sincronización pendiente', () => {
    it('agrega y recupera operaciones pendientes', async () => {
      await cacheService.addPendingSync({
        type: 'create',
        entity: 'writing',
        data: { title: 'Nuevo' },
        timestamp: Date.now(),
      });
      const pending = await cacheService.getPendingSync();
      expect(pending).toHaveLength(1);
      expect(pending[0].type).toBe('create');
      expect(pending[0].entity).toBe('writing');
    });

    it('acumula múltiples operaciones', async () => {
      await cacheService.addPendingSync({
        type: 'create',
        entity: 'writing',
        data: {},
        timestamp: Date.now(),
      });
      await cacheService.addPendingSync({
        type: 'delete',
        entity: 'favorite',
        data: {},
        timestamp: Date.now(),
      });
      const pending = await cacheService.getPendingSync();
      expect(pending).toHaveLength(2);
    });

    it('limpia operaciones pendientes', async () => {
      await cacheService.addPendingSync({
        type: 'create',
        entity: 'writing',
        data: {},
        timestamp: Date.now(),
      });
      await cacheService.clearPendingSync();
      const pending = await cacheService.getPendingSync();
      expect(pending).toHaveLength(0);
    });
  });

  describe('Utilidades', () => {
    it('generateTempId() genera IDs que empiezan con temp_', () => {
      const id = cacheService.generateTempId();
      expect(id).toMatch(/^temp_/);
    });

    it('generateTempId() genera IDs únicos', () => {
      const id1 = cacheService.generateTempId();
      const id2 = cacheService.generateTempId();
      expect(id1).not.toBe(id2);
    });

    it('isTempId() identifica IDs temporales correctamente', () => {
      expect(cacheService.isTempId('temp_123_abc')).toBe(true);
      expect(cacheService.isTempId('regular-uuid-here')).toBe(false);
    });
  });

  describe('clearAll()', () => {
    it('limpia todo el caché', async () => {
      await cacheService.setWritings([{ id: '1' }]);
      await cacheService.setFavorites([{ id: '1' }]);
      await cacheService.clearAll();
      
      const writings = await cacheService.getWritings();
      const favorites = await cacheService.getFavorites();
      expect(writings).toBeNull();
      expect(favorites).toBeNull();
    });
  });

  describe('Last Sync', () => {
    it('guarda y recupera timestamp de última sincronización', async () => {
      const now = Date.now();
      await cacheService.setLastSync();
      const lastSync = await cacheService.getLastSync();
      expect(lastSync).toBeDefined();
      expect(typeof lastSync).toBe('number');
    });

    it('devuelve null cuando no hay sincronización previa', async () => {
      const result = await cacheService.getLastSync();
      expect(result).toBeNull();
    });
  });
});
