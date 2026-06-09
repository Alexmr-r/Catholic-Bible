/**
 * Tests unitarios para BibleService
 * Verifica las llamadas correctas a los endpoints de la API de la Biblia
 */

// Mock apiClient
const mockGet = jest.fn();
jest.mock('../src/services/api.client', () => ({
  apiClient: {
    get: (...args: any[]) => mockGet(...args),
  },
}));

import { bibleService } from '../src/services/bible.service';

beforeEach(() => {
  mockGet.mockClear();
});

describe('BibleService', () => {
  describe('getAllBooks()', () => {
    it('llama al endpoint correcto', async () => {
      const mockBooks = {
        oldTestament: [{ id: 'genesis', name: 'Génesis' }],
        newTestament: [{ id: 'matthew', name: 'San Mateo' }],
      };
      mockGet.mockResolvedValueOnce(mockBooks);

      const result = await bibleService.getAllBooks();

      expect(mockGet).toHaveBeenCalledWith('/bible/books');
      expect(result.oldTestament).toHaveLength(1);
      expect(result.newTestament).toHaveLength(1);
    });
  });

  describe('getOldTestamentBooks()', () => {
    it('llama al endpoint del AT', async () => {
      mockGet.mockResolvedValueOnce([{ id: 'genesis', name: 'Génesis' }]);

      await bibleService.getOldTestamentBooks();

      expect(mockGet).toHaveBeenCalledWith('/bible/books/old-testament');
    });
  });

  describe('getNewTestamentBooks()', () => {
    it('llama al endpoint del NT', async () => {
      mockGet.mockResolvedValueOnce([{ id: 'matthew', name: 'San Mateo' }]);

      await bibleService.getNewTestamentBooks();

      expect(mockGet).toHaveBeenCalledWith('/bible/books/new-testament');
    });
  });

  describe('getBook()', () => {
    it('llama al endpoint con el bookId correcto', async () => {
      mockGet.mockResolvedValueOnce({ id: 'genesis', name: 'Génesis' });

      await bibleService.getBook('genesis');

      expect(mockGet).toHaveBeenCalledWith('/bible/books/genesis');
    });
  });

  describe('getChapter()', () => {
    it('llama al endpoint con bookId y número de capítulo', async () => {
      const mockChapter = {
        book: 'matthew',
        chapter: 5,
        sections: [],
      };
      mockGet.mockResolvedValueOnce(mockChapter);

      const result = await bibleService.getChapter('matthew', 5);

      expect(mockGet).toHaveBeenCalledWith('/bible/books/matthew/chapters/5');
      expect(result.chapter).toBe(5);
    });
  });

  describe('searchVerses()', () => {
    it('busca con solo query', async () => {
      mockGet.mockResolvedValueOnce({ results: [], total: 0 });

      await bibleService.searchVerses('amor');

      const call = mockGet.mock.calls[0][0];
      expect(call).toContain('/bible/search?');
      expect(call).toContain('query=amor');
    });

    it('busca con filtro de testamento', async () => {
      mockGet.mockResolvedValueOnce({ results: [], total: 0 });

      await bibleService.searchVerses('fe', { testament: 'new' });

      const call = mockGet.mock.calls[0][0];
      expect(call).toContain('query=fe');
      expect(call).toContain('testament=new');
    });

    it('busca con filtro de libros', async () => {
      mockGet.mockResolvedValueOnce({ results: [], total: 0 });

      await bibleService.searchVerses('luz', {
        bookIds: ['genesis', 'john'],
      });

      const call = mockGet.mock.calls[0][0];
      expect(call).toContain('bookIds=genesis');
      expect(call).toContain('bookIds=john');
    });

    it('busca con paginación', async () => {
      mockGet.mockResolvedValueOnce({ results: [], total: 0 });

      await bibleService.searchVerses('esperanza', {
        page: 2,
        pageSize: 10,
      });

      const call = mockGet.mock.calls[0][0];
      expect(call).toContain('page=2');
      expect(call).toContain('pageSize=10');
    });

    it('busca con page=0 explícito', async () => {
      mockGet.mockResolvedValueOnce({ results: [], total: 0 });

      await bibleService.searchVerses('gracia', { page: 0 });

      const call = mockGet.mock.calls[0][0];
      expect(call).toContain('page=0');
    });
  });
});
