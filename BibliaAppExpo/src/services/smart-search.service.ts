/**
 * Servicio de Búsqueda Inteligente
 * Permite buscar libros, capítulos, categorías y versículos de manera inteligente
 */

import { bibleService } from './bible.service';
import { t } from '../locales/i18n';

// Tipos de resultados de búsqueda
export type SmartSearchResultType = 'book' | 'chapter' | 'category' | 'verse';

export interface SmartSearchResult {
  type: SmartSearchResultType;
  title: string;
  subtitle: string;
  bookId?: string;
  bookName?: string;
  chapter?: number;
  verse?: number;
  testament?: 'old' | 'new';
  category?: string;
  text?: string;
}

// Mapeo de nombres de libros en español a IDs
const BOOK_NAMES: Record<string, { id: string; name: string; testament: 'old' | 'new'; category: string }> = {
  // Pentateuco
  'genesis': { id: 'genesis', name: 'Génesis', testament: 'old', category: 'Pentateuco' },
  'génesis': { id: 'genesis', name: 'Génesis', testament: 'old', category: 'Pentateuco' },
  'gen': { id: 'genesis', name: 'Génesis', testament: 'old', category: 'Pentateuco' },
  'gn': { id: 'genesis', name: 'Génesis', testament: 'old', category: 'Pentateuco' },
  'exodo': { id: 'exodus', name: 'Éxodo', testament: 'old', category: 'Pentateuco' },
  'éxodo': { id: 'exodus', name: 'Éxodo', testament: 'old', category: 'Pentateuco' },
  'exodus': { id: 'exodus', name: 'Éxodo', testament: 'old', category: 'Pentateuco' },
  'ex': { id: 'exodus', name: 'Éxodo', testament: 'old', category: 'Pentateuco' },
  'levitico': { id: 'leviticus', name: 'Levítico', testament: 'old', category: 'Pentateuco' },
  'levítico': { id: 'leviticus', name: 'Levítico', testament: 'old', category: 'Pentateuco' },
  'lev': { id: 'leviticus', name: 'Levítico', testament: 'old', category: 'Pentateuco' },
  'lv': { id: 'leviticus', name: 'Levítico', testament: 'old', category: 'Pentateuco' },
  'numeros': { id: 'numbers', name: 'Números', testament: 'old', category: 'Pentateuco' },
  'números': { id: 'numbers', name: 'Números', testament: 'old', category: 'Pentateuco' },
  'num': { id: 'numbers', name: 'Números', testament: 'old', category: 'Pentateuco' },
  'nm': { id: 'numbers', name: 'Números', testament: 'old', category: 'Pentateuco' },
  'deuteronomio': { id: 'deuteronomy', name: 'Deuteronomio', testament: 'old', category: 'Pentateuco' },
  'deut': { id: 'deuteronomy', name: 'Deuteronomio', testament: 'old', category: 'Pentateuco' },
  'dt': { id: 'deuteronomy', name: 'Deuteronomio', testament: 'old', category: 'Pentateuco' },

  // Históricos
  'josue': { id: 'joshua', name: 'Josué', testament: 'old', category: 'Históricos' },
  'josué': { id: 'joshua', name: 'Josué', testament: 'old', category: 'Históricos' },
  'jos': { id: 'joshua', name: 'Josué', testament: 'old', category: 'Históricos' },
  'jueces': { id: 'judges', name: 'Jueces', testament: 'old', category: 'Históricos' },
  'jue': { id: 'judges', name: 'Jueces', testament: 'old', category: 'Históricos' },
  'rut': { id: 'ruth', name: 'Rut', testament: 'old', category: 'Históricos' },
  'ruth': { id: 'ruth', name: 'Rut', testament: 'old', category: 'Históricos' },
  '1 samuel': { id: '1samuel', name: '1 Samuel', testament: 'old', category: 'Históricos' },
  '1samuel': { id: '1samuel', name: '1 Samuel', testament: 'old', category: 'Históricos' },
  '1 sam': { id: '1samuel', name: '1 Samuel', testament: 'old', category: 'Históricos' },
  '2 samuel': { id: '2samuel', name: '2 Samuel', testament: 'old', category: 'Históricos' },
  '2samuel': { id: '2samuel', name: '2 Samuel', testament: 'old', category: 'Históricos' },
  '2 sam': { id: '2samuel', name: '2 Samuel', testament: 'old', category: 'Históricos' },
  '1 reyes': { id: '1kings', name: '1 Reyes', testament: 'old', category: 'Históricos' },
  '1reyes': { id: '1kings', name: '1 Reyes', testament: 'old', category: 'Históricos' },
  '2 reyes': { id: '2kings', name: '2 Reyes', testament: 'old', category: 'Históricos' },
  '2reyes': { id: '2kings', name: '2 Reyes', testament: 'old', category: 'Históricos' },

  // Sapienciales
  'job': { id: 'job', name: 'Job', testament: 'old', category: 'Sapienciales' },
  'salmos': { id: 'psalms', name: 'Salmos', testament: 'old', category: 'Sapienciales' },
  'salmo': { id: 'psalms', name: 'Salmos', testament: 'old', category: 'Sapienciales' },
  'sal': { id: 'psalms', name: 'Salmos', testament: 'old', category: 'Sapienciales' },
  'proverbios': { id: 'proverbs', name: 'Proverbios', testament: 'old', category: 'Sapienciales' },
  'prov': { id: 'proverbs', name: 'Proverbios', testament: 'old', category: 'Sapienciales' },
  'pr': { id: 'proverbs', name: 'Proverbios', testament: 'old', category: 'Sapienciales' },
  'eclesiastes': { id: 'ecclesiastes', name: 'Eclesiastés', testament: 'old', category: 'Sapienciales' },
  'eclesiastés': { id: 'ecclesiastes', name: 'Eclesiastés', testament: 'old', category: 'Sapienciales' },
  'ecl': { id: 'ecclesiastes', name: 'Eclesiastés', testament: 'old', category: 'Sapienciales' },
  'cantar': { id: 'song', name: 'Cantar de los Cantares', testament: 'old', category: 'Sapienciales' },
  'cantar de los cantares': { id: 'song', name: 'Cantar de los Cantares', testament: 'old', category: 'Sapienciales' },
  'cantares': { id: 'song', name: 'Cantar de los Cantares', testament: 'old', category: 'Sapienciales' },
  'sabiduria': { id: 'wisdom', name: 'Sabiduría', testament: 'old', category: 'Sapienciales' },
  'sabiduría': { id: 'wisdom', name: 'Sabiduría', testament: 'old', category: 'Sapienciales' },
  'sab': { id: 'wisdom', name: 'Sabiduría', testament: 'old', category: 'Sapienciales' },
  'eclesiastico': { id: 'sirach', name: 'Eclesiástico', testament: 'old', category: 'Sapienciales' },
  'eclesiástico': { id: 'sirach', name: 'Eclesiástico', testament: 'old', category: 'Sapienciales' },
  'siracides': { id: 'sirach', name: 'Eclesiástico', testament: 'old', category: 'Sapienciales' },

  // Profetas Mayores
  'isaias': { id: 'isaiah', name: 'Isaías', testament: 'old', category: 'Profetas Mayores' },
  'isaías': { id: 'isaiah', name: 'Isaías', testament: 'old', category: 'Profetas Mayores' },
  'is': { id: 'isaiah', name: 'Isaías', testament: 'old', category: 'Profetas Mayores' },
  'jeremias': { id: 'jeremiah', name: 'Jeremías', testament: 'old', category: 'Profetas Mayores' },
  'jeremías': { id: 'jeremiah', name: 'Jeremías', testament: 'old', category: 'Profetas Mayores' },
  'jer': { id: 'jeremiah', name: 'Jeremías', testament: 'old', category: 'Profetas Mayores' },
  'lamentaciones': { id: 'lamentations', name: 'Lamentaciones', testament: 'old', category: 'Profetas Mayores' },
  'lam': { id: 'lamentations', name: 'Lamentaciones', testament: 'old', category: 'Profetas Mayores' },
  'baruc': { id: 'baruch', name: 'Baruc', testament: 'old', category: 'Profetas Mayores' },
  'ezequiel': { id: 'ezekiel', name: 'Ezequiel', testament: 'old', category: 'Profetas Mayores' },
  'ez': { id: 'ezekiel', name: 'Ezequiel', testament: 'old', category: 'Profetas Mayores' },
  'daniel': { id: 'daniel', name: 'Daniel', testament: 'old', category: 'Profetas Mayores' },
  'dan': { id: 'daniel', name: 'Daniel', testament: 'old', category: 'Profetas Mayores' },
  'dn': { id: 'daniel', name: 'Daniel', testament: 'old', category: 'Profetas Mayores' },

  // Profetas Menores
  'oseas': { id: 'hosea', name: 'Oseas', testament: 'old', category: 'Profetas Menores' },
  'os': { id: 'hosea', name: 'Oseas', testament: 'old', category: 'Profetas Menores' },
  'joel': { id: 'joel', name: 'Joel', testament: 'old', category: 'Profetas Menores' },
  'jl': { id: 'joel', name: 'Joel', testament: 'old', category: 'Profetas Menores' },
  'amos': { id: 'amos', name: 'Amós', testament: 'old', category: 'Profetas Menores' },
  'amós': { id: 'amos', name: 'Amós', testament: 'old', category: 'Profetas Menores' },
  'am': { id: 'amos', name: 'Amós', testament: 'old', category: 'Profetas Menores' },
  'abdias': { id: 'obadiah', name: 'Abdías', testament: 'old', category: 'Profetas Menores' },
  'abdías': { id: 'obadiah', name: 'Abdías', testament: 'old', category: 'Profetas Menores' },
  'jonas': { id: 'jonah', name: 'Jonás', testament: 'old', category: 'Profetas Menores' },
  'jonás': { id: 'jonah', name: 'Jonás', testament: 'old', category: 'Profetas Menores' },
  'miqueas': { id: 'micah', name: 'Miqueas', testament: 'old', category: 'Profetas Menores' },
  'miq': { id: 'micah', name: 'Miqueas', testament: 'old', category: 'Profetas Menores' },
  'nahum': { id: 'nahum', name: 'Nahúm', testament: 'old', category: 'Profetas Menores' },
  'nahúm': { id: 'nahum', name: 'Nahúm', testament: 'old', category: 'Profetas Menores' },
  'habacuc': { id: 'habakkuk', name: 'Habacuc', testament: 'old', category: 'Profetas Menores' },
  'hab': { id: 'habakkuk', name: 'Habacuc', testament: 'old', category: 'Profetas Menores' },
  'sofonias': { id: 'zephaniah', name: 'Sofonías', testament: 'old', category: 'Profetas Menores' },
  'sofonías': { id: 'zephaniah', name: 'Sofonías', testament: 'old', category: 'Profetas Menores' },
  'ageo': { id: 'haggai', name: 'Ageo', testament: 'old', category: 'Profetas Menores' },
  'ag': { id: 'haggai', name: 'Ageo', testament: 'old', category: 'Profetas Menores' },
  'zacarias': { id: 'zechariah', name: 'Zacarías', testament: 'old', category: 'Profetas Menores' },
  'zacarías': { id: 'zechariah', name: 'Zacarías', testament: 'old', category: 'Profetas Menores' },
  'zac': { id: 'zechariah', name: 'Zacarías', testament: 'old', category: 'Profetas Menores' },
  'malaquias': { id: 'malachi', name: 'Malaquías', testament: 'old', category: 'Profetas Menores' },
  'malaquías': { id: 'malachi', name: 'Malaquías', testament: 'old', category: 'Profetas Menores' },
  'mal': { id: 'malachi', name: 'Malaquías', testament: 'old', category: 'Profetas Menores' },

  // Evangelios
  'mateo': { id: 'matthew', name: 'San Mateo', testament: 'new', category: 'Evangelios' },
  'san mateo': { id: 'matthew', name: 'San Mateo', testament: 'new', category: 'Evangelios' },
  'mt': { id: 'matthew', name: 'San Mateo', testament: 'new', category: 'Evangelios' },
  'marcos': { id: 'mark', name: 'San Marcos', testament: 'new', category: 'Evangelios' },
  'san marcos': { id: 'mark', name: 'San Marcos', testament: 'new', category: 'Evangelios' },
  'mc': { id: 'mark', name: 'San Marcos', testament: 'new', category: 'Evangelios' },
  'lucas': { id: 'luke', name: 'San Lucas', testament: 'new', category: 'Evangelios' },
  'san lucas': { id: 'luke', name: 'San Lucas', testament: 'new', category: 'Evangelios' },
  'lc': { id: 'luke', name: 'San Lucas', testament: 'new', category: 'Evangelios' },
  'juan': { id: 'john', name: 'San Juan', testament: 'new', category: 'Evangelios' },
  'san juan': { id: 'john', name: 'San Juan', testament: 'new', category: 'Evangelios' },
  'jn': { id: 'john', name: 'San Juan', testament: 'new', category: 'Evangelios' },

  // Hechos
  'hechos': { id: 'acts', name: 'Hechos de los Apóstoles', testament: 'new', category: 'Historia' },
  'hechos de los apostoles': { id: 'acts', name: 'Hechos de los Apóstoles', testament: 'new', category: 'Historia' },
  'hch': { id: 'acts', name: 'Hechos de los Apóstoles', testament: 'new', category: 'Historia' },

  // Cartas de Pablo
  'romanos': { id: 'romans', name: 'Romanos', testament: 'new', category: 'Cartas de San Pablo' },
  'rom': { id: 'romans', name: 'Romanos', testament: 'new', category: 'Cartas de San Pablo' },
  '1 corintios': { id: '1corinthians', name: '1 Corintios', testament: 'new', category: 'Cartas de San Pablo' },
  '1corintios': { id: '1corinthians', name: '1 Corintios', testament: 'new', category: 'Cartas de San Pablo' },
  '1 cor': { id: '1corinthians', name: '1 Corintios', testament: 'new', category: 'Cartas de San Pablo' },
  '2 corintios': { id: '2corinthians', name: '2 Corintios', testament: 'new', category: 'Cartas de San Pablo' },
  '2corintios': { id: '2corinthians', name: '2 Corintios', testament: 'new', category: 'Cartas de San Pablo' },
  '2 cor': { id: '2corinthians', name: '2 Corintios', testament: 'new', category: 'Cartas de San Pablo' },
  'galatas': { id: 'galatians', name: 'Gálatas', testament: 'new', category: 'Cartas de San Pablo' },
  'gálatas': { id: 'galatians', name: 'Gálatas', testament: 'new', category: 'Cartas de San Pablo' },
  'gal': { id: 'galatians', name: 'Gálatas', testament: 'new', category: 'Cartas de San Pablo' },
  'efesios': { id: 'ephesians', name: 'Efesios', testament: 'new', category: 'Cartas de San Pablo' },
  'ef': { id: 'ephesians', name: 'Efesios', testament: 'new', category: 'Cartas de San Pablo' },
  'filipenses': { id: 'philippians', name: 'Filipenses', testament: 'new', category: 'Cartas de San Pablo' },
  'fil': { id: 'philippians', name: 'Filipenses', testament: 'new', category: 'Cartas de San Pablo' },
  'colosenses': { id: 'colossians', name: 'Colosenses', testament: 'new', category: 'Cartas de San Pablo' },
  'col': { id: 'colossians', name: 'Colosenses', testament: 'new', category: 'Cartas de San Pablo' },
  '1 tesalonicenses': { id: '1thessalonians', name: '1 Tesalonicenses', testament: 'new', category: 'Cartas de San Pablo' },
  '1tesalonicenses': { id: '1thessalonians', name: '1 Tesalonicenses', testament: 'new', category: 'Cartas de San Pablo' },
  '1 tes': { id: '1thessalonians', name: '1 Tesalonicenses', testament: 'new', category: 'Cartas de San Pablo' },
  '2 tesalonicenses': { id: '2thessalonians', name: '2 Tesalonicenses', testament: 'new', category: 'Cartas de San Pablo' },
  '2tesalonicenses': { id: '2thessalonians', name: '2 Tesalonicenses', testament: 'new', category: 'Cartas de San Pablo' },
  '2 tes': { id: '2thessalonians', name: '2 Tesalonicenses', testament: 'new', category: 'Cartas de San Pablo' },
  '1 timoteo': { id: '1timothy', name: '1 Timoteo', testament: 'new', category: 'Cartas de San Pablo' },
  '1timoteo': { id: '1timothy', name: '1 Timoteo', testament: 'new', category: 'Cartas de San Pablo' },
  '1 tim': { id: '1timothy', name: '1 Timoteo', testament: 'new', category: 'Cartas de San Pablo' },
  '2 timoteo': { id: '2timothy', name: '2 Timoteo', testament: 'new', category: 'Cartas de San Pablo' },
  '2timoteo': { id: '2timothy', name: '2 Timoteo', testament: 'new', category: 'Cartas de San Pablo' },
  '2 tim': { id: '2timothy', name: '2 Timoteo', testament: 'new', category: 'Cartas de San Pablo' },
  'tito': { id: 'titus', name: 'Tito', testament: 'new', category: 'Cartas de San Pablo' },
  'filemon': { id: 'philemon', name: 'Filemón', testament: 'new', category: 'Cartas de San Pablo' },
  'filemón': { id: 'philemon', name: 'Filemón', testament: 'new', category: 'Cartas de San Pablo' },
  'flm': { id: 'philemon', name: 'Filemón', testament: 'new', category: 'Cartas de San Pablo' },

  // Cartas Católicas
  'hebreos': { id: 'hebrews', name: 'Hebreos', testament: 'new', category: 'Cartas Católicas' },
  'heb': { id: 'hebrews', name: 'Hebreos', testament: 'new', category: 'Cartas Católicas' },
  'santiago': { id: 'james', name: 'Santiago', testament: 'new', category: 'Cartas Católicas' },
  'sant': { id: 'james', name: 'Santiago', testament: 'new', category: 'Cartas Católicas' },
  'stg': { id: 'james', name: 'Santiago', testament: 'new', category: 'Cartas Católicas' },
  '1 pedro': { id: '1peter', name: '1 Pedro', testament: 'new', category: 'Cartas Católicas' },
  '1pedro': { id: '1peter', name: '1 Pedro', testament: 'new', category: 'Cartas Católicas' },
  '1 pe': { id: '1peter', name: '1 Pedro', testament: 'new', category: 'Cartas Católicas' },
  '2 pedro': { id: '2peter', name: '2 Pedro', testament: 'new', category: 'Cartas Católicas' },
  '2pedro': { id: '2peter', name: '2 Pedro', testament: 'new', category: 'Cartas Católicas' },
  '2 pe': { id: '2peter', name: '2 Pedro', testament: 'new', category: 'Cartas Católicas' },
  '1 juan': { id: '1john', name: '1 Juan', testament: 'new', category: 'Cartas Católicas' },
  '1juan': { id: '1john', name: '1 Juan', testament: 'new', category: 'Cartas Católicas' },
  '1 jn': { id: '1john', name: '1 Juan', testament: 'new', category: 'Cartas Católicas' },
  '2 juan': { id: '2john', name: '2 Juan', testament: 'new', category: 'Cartas Católicas' },
  '2juan': { id: '2john', name: '2 Juan', testament: 'new', category: 'Cartas Católicas' },
  '2 jn': { id: '2john', name: '2 Juan', testament: 'new', category: 'Cartas Católicas' },
  '3 juan': { id: '3john', name: '3 Juan', testament: 'new', category: 'Cartas Católicas' },
  '3juan': { id: '3john', name: '3 Juan', testament: 'new', category: 'Cartas Católicas' },
  '3 jn': { id: '3john', name: '3 Juan', testament: 'new', category: 'Cartas Católicas' },
  'judas': { id: 'jude', name: 'Judas', testament: 'new', category: 'Cartas Católicas' },
  'jud': { id: 'jude', name: 'Judas', testament: 'new', category: 'Cartas Católicas' },

  // Apocalipsis
  'apocalipsis': { id: 'revelation', name: 'Apocalipsis', testament: 'new', category: 'Profético' },
  'revelacion': { id: 'revelation', name: 'Apocalipsis', testament: 'new', category: 'Profético' },
  'ap': { id: 'revelation', name: 'Apocalipsis', testament: 'new', category: 'Profético' },
};

// Categorías y sus libros
const CATEGORIES: Record<string, { name: string; testament: 'old' | 'new'; bookIds: string[] }> = {
  'pentateuco': {
    name: 'Pentateuco',
    testament: 'old',
    bookIds: ['genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy']
  },
  'historicos': {
    name: 'Libros Históricos',
    testament: 'old',
    bookIds: ['joshua', 'judges', 'ruth', '1samuel', '2samuel', '1kings', '2kings', '1chronicles', '2chronicles', 'ezra', 'nehemiah', 'tobit', 'judith', 'esther', '1maccabees', '2maccabees']
  },
  'sapienciales': {
    name: 'Libros Sapienciales',
    testament: 'old',
    bookIds: ['job', 'psalms', 'proverbs', 'ecclesiastes', 'song', 'wisdom', 'sirach']
  },
  'profetas mayores': {
    name: 'Profetas Mayores',
    testament: 'old',
    bookIds: ['isaiah', 'jeremiah', 'lamentations', 'baruch', 'ezekiel', 'daniel']
  },
  'profetas menores': {
    name: 'Profetas Menores',
    testament: 'old',
    bookIds: ['hosea', 'joel', 'amos', 'obadiah', 'jonah', 'micah', 'nahum', 'habakkuk', 'zephaniah', 'haggai', 'zechariah', 'malachi']
  },
  'evangelios': {
    name: 'Evangelios',
    testament: 'new',
    bookIds: ['matthew', 'mark', 'luke', 'john']
  },
  'cartas de pablo': {
    name: 'Cartas de San Pablo',
    testament: 'new',
    bookIds: ['romans', '1corinthians', '2corinthians', 'galatians', 'ephesians', 'philippians', 'colossians', '1thessalonians', '2thessalonians', '1timothy', '2timothy', 'titus', 'philemon']
  },
  'cartas catolicas': {
    name: 'Cartas Católicas',
    testament: 'new',
    bookIds: ['hebrews', 'james', '1peter', '2peter', '1john', '2john', '3john', 'jude']
  },
};

// Función para normalizar texto (quitar acentos y minúsculas)
const normalize = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

// Expresión regular para detectar referencias bíblicas (ej: "Juan 3:16", "Genesis 1", "Salmo 23:1-5")
const REFERENCE_REGEX = /^(.+?)\s*(\d+)(?::(\d+)(?:-(\d+))?)?$/i;

class SmartSearchService {
  /**
   * Búsqueda inteligente que detecta:
   * - Nombres de libros → navegar al libro
   * - Referencias (libro + capítulo) → navegar al capítulo
   * - Referencias con versículo → navegar al versículo
   * - Categorías → mostrar libros de esa categoría
   * - Texto libre → buscar en versículos
   */
  async search(query: string): Promise<SmartSearchResult[]> {
    const results: SmartSearchResult[] = [];
    const normalizedQuery = normalize(query);

    if (!normalizedQuery || normalizedQuery.length < 2) {
      return results;
    }

    // 1. Detectar si es una referencia bíblica (ej: "Genesis 1:3" o "Juan 3")
    const referenceMatch = query.match(REFERENCE_REGEX);
    if (referenceMatch) {
      const [, bookPart, chapterStr, verseStart, verseEnd] = referenceMatch;
      const bookInfo = this.findBook(bookPart.trim());

      if (bookInfo) {
        const chapter = parseInt(chapterStr);

        if (verseStart) {
          // Es una referencia a versículo(s)
          results.push({
            type: 'verse',
            title: `${bookInfo.name} ${chapter}:${verseStart}${verseEnd ? `-${verseEnd}` : ''}`,
            subtitle: t('search.goToVerse'),
            bookId: bookInfo.id,
            bookName: bookInfo.name,
            chapter,
            verse: parseInt(verseStart),
            testament: bookInfo.testament,
          });
        } else {
          // Es una referencia a capítulo
          results.push({
            type: 'chapter',
            title: `${bookInfo.name} ${chapter}`,
            subtitle: `${t('search.chapter')} ${chapter}`,
            bookId: bookInfo.id,
            bookName: bookInfo.name,
            chapter,
            testament: bookInfo.testament,
          });
        }
      }
    }

    // 2. Buscar libros que coincidan
    const matchingBooks = this.searchBooks(normalizedQuery);
    matchingBooks.forEach(book => {
      results.push({
        type: 'book',
        title: book.name,
        subtitle: `${book.category} • ${book.testament === 'old' ? t('search.oldTestament') : t('search.newTestament')}`,
        bookId: book.id,
        bookName: book.name,
        testament: book.testament,
        category: book.category,
      });
    });

    // 3. Buscar categorías que coincidan
    const matchingCategories = this.searchCategories(normalizedQuery);
    matchingCategories.forEach(cat => {
      results.push({
        type: 'category',
        title: cat.name,
        subtitle: `${cat.bookIds.length} ${t('search.books')} • ${cat.testament === 'old' ? t('search.oldTestament') : t('search.newTestament')}`,
        category: cat.name,
        testament: cat.testament,
      });
    });

    // 4. Si no encontramos nada estructurado, buscar en texto de versículos
    if (results.length === 0 || !referenceMatch) {
      try {
        const verseResults = await bibleService.searchVerses(query, { pageSize: 10 });
        verseResults.results.forEach(result => {
          results.push({
            type: 'verse',
            title: `${result.bookName} ${result.chapter}:${result.verse}`,
            subtitle: result.text.substring(0, 80) + (result.text.length > 80 ? '...' : ''),
            bookId: result.bookId,
            bookName: result.bookName,
            chapter: result.chapter,
            verse: result.verse,
            text: result.text,
          });
        });
      } catch (err) {
        console.error('[SmartSearch] Error buscando versículos:', err);
      }
    }

    // Eliminar duplicados por bookId+chapter+verse
    const seen = new Set<string>();
    return results.filter(r => {
      const key = `${r.type}-${r.bookId || ''}-${r.chapter || ''}-${r.verse || ''}-${r.category || ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Buscar un libro por nombre o abreviación
   */
  private findBook(name: string): { id: string; name: string; testament: 'old' | 'new'; category: string } | null {
    const normalized = normalize(name);
    return BOOK_NAMES[normalized] || null;
  }

  /**
   * Buscar libros que coincidan parcialmente
   */
  private searchBooks(query: string): { id: string; name: string; testament: 'old' | 'new'; category: string }[] {
    const results: { id: string; name: string; testament: 'old' | 'new'; category: string }[] = [];
    const seen = new Set<string>();

    // Buscar coincidencias exactas primero
    const exactMatch = BOOK_NAMES[query];
    if (exactMatch && !seen.has(exactMatch.id)) {
      results.push(exactMatch);
      seen.add(exactMatch.id);
    }

    // Buscar coincidencias parciales
    Object.entries(BOOK_NAMES).forEach(([key, book]) => {
      if (!seen.has(book.id)) {
        if (key.includes(query) || normalize(book.name).includes(query)) {
          results.push(book);
          seen.add(book.id);
        }
      }
    });

    return results.slice(0, 5); // Máximo 5 libros
  }

  /**
   * Buscar categorías que coincidan
   */
  private searchCategories(query: string): { name: string; testament: 'old' | 'new'; bookIds: string[] }[] {
    return Object.entries(CATEGORIES)
      .filter(([key, cat]) =>
        key.includes(query) || normalize(cat.name).includes(query)
      )
      .map(([, cat]) => cat)
      .slice(0, 3); // Máximo 3 categorías
  }

  /**
   * Obtener sugerencias rápidas mientras se escribe
   */
  getSuggestions(query: string): SmartSearchResult[] {
    const results: SmartSearchResult[] = [];
    const normalizedQuery = normalize(query);

    if (!normalizedQuery || normalizedQuery.length < 1) {
      return results;
    }

    // Buscar libros que empiecen con la query
    Object.entries(BOOK_NAMES).forEach(([key, book]) => {
      if (key.startsWith(normalizedQuery) || normalize(book.name).startsWith(normalizedQuery)) {
        if (!results.find(r => r.bookId === book.id)) {
          results.push({
            type: 'book',
            title: book.name,
            subtitle: book.category,
            bookId: book.id,
            bookName: book.name,
            testament: book.testament,
          });
        }
      }
    });

    // Buscar categorías
    Object.entries(CATEGORIES).forEach(([key, cat]) => {
      if (key.startsWith(normalizedQuery) || normalize(cat.name).startsWith(normalizedQuery)) {
        results.push({
          type: 'category',
          title: cat.name,
          subtitle: `${cat.bookIds.length} ${t('search.books')}`,
          category: cat.name,
          testament: cat.testament,
        });
      }
    });

    return results.slice(0, 8); // Máximo 8 sugerencias
  }
}

export const smartSearchService = new SmartSearchService();
