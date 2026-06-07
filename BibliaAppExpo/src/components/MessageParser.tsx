import React from 'react';
import {Text, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {useTheme} from '../contexts/ThemeContext';

interface MessageParserProps {
  text: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Mapeo estático universal de libros de la Biblia Católica (Español e Inglés)
const bookMap: Record<string, { id: string; name: string; testament: 'old' | 'new' }> = {
  // Pentateuco
  'genesis': { id: 'genesis', name: 'Génesis', testament: 'old' },
  'exodo': { id: 'exodus', name: 'Éxodo', testament: 'old' },
  'exodus': { id: 'exodus', name: 'Éxodo', testament: 'old' },
  'levitico': { id: 'leviticus', name: 'Levítico', testament: 'old' },
  'leviticus': { id: 'leviticus', name: 'Levítico', testament: 'old' },
  'numeros': { id: 'numbers', name: 'Números', testament: 'old' },
  'numbers': { id: 'numbers', name: 'Números', testament: 'old' },
  'deuteronomio': { id: 'deuteronomy', name: 'Deuteronomio', testament: 'old' },
  'deuteronomy': { id: 'deuteronomy', name: 'Deuteronomio', testament: 'old' },
  // Históricos
  'josue': { id: 'joshua', name: 'Josué', testament: 'old' },
  'joshua': { id: 'joshua', name: 'Josué', testament: 'old' },
  'jueces': { id: 'judges', name: 'Jueces', testament: 'old' },
  'judges': { id: 'judges', name: 'Jueces', testament: 'old' },
  'rut': { id: 'ruth', name: 'Rut', testament: 'old' },
  'ruth': { id: 'ruth', name: 'Rut', testament: 'old' },
  '1samuel': { id: '1samuel', name: '1 Samuel', testament: 'old' },
  '2samuel': { id: '2samuel', name: '2 Samuel', testament: 'old' },
  '1reyes': { id: '1kings', name: '1 Reyes', testament: 'old' },
  '1kings': { id: '1kings', name: '1 Reyes', testament: 'old' },
  '2reyes': { id: '2kings', name: '2 Reyes', testament: 'old' },
  '2kings': { id: '2kings', name: '2 Reyes', testament: 'old' },
  '1cronicas': { id: '1chronicles', name: '1 Crónicas', testament: 'old' },
  '1chronicles': { id: '1chronicles', name: '1 Crónicas', testament: 'old' },
  '2cronicas': { id: '2chronicles', name: '2 Crónicas', testament: 'old' },
  '2chronicles': { id: '2chronicles', name: '2 Crónicas', testament: 'old' },
  'esdras': { id: 'ezra', name: 'Esdras', testament: 'old' },
  'ezra': { id: 'ezra', name: 'Esdras', testament: 'old' },
  'nehemias': { id: 'nehemiah', name: 'Nehemías', testament: 'old' },
  'nehemiah': { id: 'nehemiah', name: 'Nehemías', testament: 'old' },
  'tobias': { id: 'tobit', name: 'Tobías', testament: 'old' },
  'tobit': { id: 'tobit', name: 'Tobías', testament: 'old' },
  'judit': { id: 'judith', name: 'Judit', testament: 'old' },
  'judith': { id: 'judith', name: 'Judit', testament: 'old' },
  'ester': { id: 'esther', name: 'Ester', testament: 'old' },
  'esther': { id: 'esther', name: 'Ester', testament: 'old' },
  '1macabeos': { id: '1maccabees', name: '1 Macabeos', testament: 'old' },
  '1maccabees': { id: '1maccabees', name: '1 Macabeos', testament: 'old' },
  '2macabeos': { id: '2maccabees', name: '2 Macabeos', testament: 'old' },
  '2maccabees': { id: '2maccabees', name: '2 Macabeos', testament: 'old' },
  // Poéticos/Sapienciales
  'job': { id: 'job', name: 'Job', testament: 'old' },
  'salmos': { id: 'psalms', name: 'Salmos', testament: 'old' },
  'psalms': { id: 'psalms', name: 'Salmos', testament: 'old' },
  'proverbios': { id: 'proverbs', name: 'Proverbios', testament: 'old' },
  'proverbs': { id: 'proverbs', name: 'Proverbios', testament: 'old' },
  'eclesiastes': { id: 'ecclesiastes', name: 'Eclesiastés', testament: 'old' },
  'ecclesiastes': { id: 'ecclesiastes', name: 'Eclesiastés', testament: 'old' },
  'cantar': { id: 'songofsolomon', name: 'Cantar de los Cantares', testament: 'old' },
  'cantardeloscantares': { id: 'songofsolomon', name: 'Cantar de los Cantares', testament: 'old' },
  'songofsolomon': { id: 'songofsolomon', name: 'Cantar de los Cantares', testament: 'old' },
  'sabiduria': { id: 'wisdom', name: 'Sabiduría', testament: 'old' },
  'wisdom': { id: 'wisdom', name: 'Sabiduría', testament: 'old' },
  'eclesiastico': { id: 'sirach', name: 'Eclesiástico', testament: 'old' },
  'siracida': { id: 'sirach', name: 'Sirácida', testament: 'old' },
  'sirach': { id: 'sirach', name: 'Eclesiástico', testament: 'old' },
  // Profetas Mayores
  'isaias': { id: 'isaiah', name: 'Isaías', testament: 'old' },
  'isaiah': { id: 'isaiah', name: 'Isaías', testament: 'old' },
  'jeremias': { id: 'jeremiah', name: 'Jeremías', testament: 'old' },
  'jeremiah': { id: 'jeremiah', name: 'Jeremías', testament: 'old' },
  'lamentaciones': { id: 'lamentations', name: 'Lamentaciones', testament: 'old' },
  'lamentations': { id: 'lamentations', name: 'Lamentaciones', testament: 'old' },
  'baruc': { id: 'baruch', name: 'Baruc', testament: 'old' },
  'baruch': { id: 'baruch', name: 'Baruc', testament: 'old' },
  'ezequiel': { id: 'ezekiel', name: 'Ezequiel', testament: 'old' },
  'ezekiel': { id: 'ezekiel', name: 'Ezequiel', testament: 'old' },
  'daniel': { id: 'daniel', name: 'Daniel', testament: 'old' },
  // Profetas Menores
  'oseas': { id: 'hosea', name: 'Oseas', testament: 'old' },
  'hosea': { id: 'hosea', name: 'Oseas', testament: 'old' },
  'joel': { id: 'joel', name: 'Joel', testament: 'old' },
  'amos': { id: 'amos', name: 'Amós', testament: 'old' },
  'abdias': { id: 'obadiah', name: 'Abdías', testament: 'old' },
  'obadiah': { id: 'obadiah', name: 'Abdías', testament: 'old' },
  'jonas': { id: 'jonah', name: 'Jonás', testament: 'old' },
  'jonah': { id: 'jonah', name: 'Jonás', testament: 'old' },
  'miqueas': { id: 'micah', name: 'Miqueas', testament: 'old' },
  'micah': { id: 'micah', name: 'Miqueas', testament: 'old' },
  'nahum': { id: 'nahum', name: 'Nahúm', testament: 'old' },
  'habacuc': { id: 'habakkuk', name: 'Habacuc', testament: 'old' },
  'habakkuk': { id: 'habakkuk', name: 'Habacuc', testament: 'old' },
  'sofonias': { id: 'zephaniah', name: 'Sofonías', testament: 'old' },
  'zephaniah': { id: 'zephaniah', name: 'Sofonías', testament: 'old' },
  'hageo': { id: 'haggai', name: 'Hageo', testament: 'old' },
  'haggai': { id: 'haggai', name: 'Hageo', testament: 'old' },
  'zacarias': { id: 'zechariah', name: 'Zacarías', testament: 'old' },
  'zechariah': { id: 'zechariah', name: 'Zacarías', testament: 'old' },
  'malaquias': { id: 'malachi', name: 'Malaquías', testament: 'old' },
  'malachi': { id: 'malachi', name: 'Malaquías', testament: 'old' },

  // Nuevo Testamento - Evangelios
  'mateo': { id: 'matthew', name: 'Mateo', testament: 'new' },
  'sanmateo': { id: 'matthew', name: 'Mateo', testament: 'new' },
  'matthew': { id: 'matthew', name: 'Mateo', testament: 'new' },
  'marcos': { id: 'mark', name: 'Marcos', testament: 'new' },
  'sanmarcos': { id: 'mark', name: 'Marcos', testament: 'new' },
  'mark': { id: 'mark', name: 'Marcos', testament: 'new' },
  'lucas': { id: 'luke', name: 'Lucas', testament: 'new' },
  'sanlucas': { id: 'luke', name: 'Lucas', testament: 'new' },
  'luke': { id: 'luke', name: 'Lucas', testament: 'new' },
  'juan': { id: 'john', name: 'Juan', testament: 'new' },
  'sanjuan': { id: 'john', name: 'Juan', testament: 'new' },
  'john': { id: 'john', name: 'Juan', testament: 'new' },
  // Hechos
  'hechos': { id: 'acts', name: 'Hechos', testament: 'new' },
  'hechosdelosapostoles': { id: 'acts', name: 'Hechos', testament: 'new' },
  'acts': { id: 'acts', name: 'Hechos', testament: 'new' },
  // Cartas de Pablo
  'romanos': { id: 'romans', name: 'Romanos', testament: 'new' },
  'romans': { id: 'romans', name: 'Romanos', testament: 'new' },
  '1corintios': { id: '1corinthians', name: '1 Corintios', testament: 'new' },
  '1corinthians': { id: '1corinthians', name: '1 Corintios', testament: 'new' },
  '2corintios': { id: '2corinthians', name: '2 Corintios', testament: 'new' },
  '2corinthians': { id: '2corinthians', name: '2 Corintios', testament: 'new' },
  'galatas': { id: 'galatians', name: 'Gálatas', testament: 'new' },
  'galatians': { id: 'galatians', name: 'Gálatas', testament: 'new' },
  'efesios': { id: 'ephesians', name: 'Efesios', testament: 'new' },
  'ephesians': { id: 'ephesians', name: 'Efesios', testament: 'new' },
  'filipenses': { id: 'philippians', name: 'Filipenses', testament: 'new' },
  'philippians': { id: 'philippians', name: 'Filipenses', testament: 'new' },
  'colosenses': { id: 'colossians', name: 'Colosenses', testament: 'new' },
  'colossians': { id: 'colossians', name: 'Colosenses', testament: 'new' },
  '1tesalonicenses': { id: '1thessalonians', name: '1 Tesalonicenses', testament: 'new' },
  '1thessalonians': { id: '1thessalonians', name: '1 Tesalonicenses', testament: 'new' },
  '2tesalonicenses': { id: '2thessalonians', name: '2 Tesalonicenses', testament: 'new' },
  '2thessalonians': { id: '2thessalonians', name: '2 Tesalonicenses', testament: 'new' },
  '1timoteo': { id: '1timothy', name: '1 Timoteo', testament: 'new' },
  '1timothy': { id: '1timothy', name: '1 Timoteo', testament: 'new' },
  '2timoteo': { id: '2timothy', name: '2 Timoteo', testament: 'new' },
  '2timothy': { id: '2timothy', name: '2 Timoteo', testament: 'new' },
  'tito': { id: 'titus', name: 'Tito', testament: 'new' },
  'titus': { id: 'titus', name: 'Tito', testament: 'new' },
  'filemon': { id: 'philemon', name: 'Filemón', testament: 'new' },
  'philemon': { id: 'philemon', name: 'Filemón', testament: 'new' },
  'hebreos': { id: 'hebrews', name: 'Hebreos', testament: 'new' },
  'hebrews': { id: 'hebrews', name: 'Hebreos', testament: 'new' },
  // Cartas Católicas
  'santiago': { id: 'james', name: 'Santiago', testament: 'new' },
  'james': { id: 'james', name: 'Santiago', testament: 'new' },
  '1pedro': { id: '1peter', name: '1 Pedro', testament: 'new' },
  '1peter': { id: '1peter', name: '1 Pedro', testament: 'new' },
  '2pedro': { id: '2peter', name: '2 Pedro', testament: 'new' },
  '2peter': { id: '2peter', name: '2 Pedro', testament: 'new' },
  '1juan': { id: '1john', name: '1 Juan', testament: 'new' },
  '1john': { id: '1john', name: '1 Juan', testament: 'new' },
  '2juan': { id: '2john', name: '2 Juan', testament: 'new' },
  '2john': { id: '2john', name: '2 Juan', testament: 'new' },
  '3juan': { id: '3john', name: '3 Juan', testament: 'new' },
  '3john': { id: '3john', name: '3 Juan', testament: 'new' },
  'judas': { id: 'jude', name: 'Judas', testament: 'new' },
  'jude': { id: 'jude', name: 'Judas', testament: 'new' },
  // Apocalipsis
  'apocalipsis': { id: 'revelation', name: 'Apocalipsis', testament: 'new' },
  'revelation': { id: 'revelation', name: 'Apocalipsis', testament: 'new' },
};

// Nombres a buscar en texto plano (ordenados de más largos a más cortos para que el regex los detecte correctamente)
const bookNamesToMatch = [
  'Hechos de los Santos Apóstoles', 'Hechos de los Santos Apostoles',
  'Hechos de los Apóstoles', 'Hechos de los Apostoles',
  'Cantar de los Cantares', 'Cantar', 'Cantares',
  '1 Tesalonicenses', '2 Tesalonicenses', '1 Corintios', '2 Corintios',
  '1 Crónicas', '2 Crónicas', '1 Cronicas', '2 Cronicas',
  '1 Macabeos', '2 Macabeos', '1 Timoteo', '2 Timoteo',
  '1 Samuel', '2 Samuel', '1 Reyes', '2 Reyes',
  '1 Pedro', '2 Pedro', '1 Juan', '2 Juan', '3 Juan',
  '1 Thessalonians', '2 Thessalonians', '1 Corinthians', '2 Corinthians',
  '1 Chronicles', '2 Chronicles', '1 Maccabees', '2 Maccabees',
  '1 Timothy', '2 Timothy', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
  'San Mateo', 'San Marcos', 'San Lucas', 'San Juan',
  'Génesis', 'Genesis', 'Éxodo', 'Exodus', 'Exodo', 'Levítico', 'Levitico', 'Leviticus',
  'Números', 'Numeros', 'Numbers', 'Deuteronomio', 'Deuteronomy',
  'Josué', 'Josue', 'Joshua', 'Jueces', 'Judges', 'Rut', 'Ruth',
  'Esdras', 'Ezra', 'Nehemias', 'Nehemías', 'Nehemiah',
  'Tobías', 'Tobias', 'Tobit', 'Judit', 'Judith', 'Ester', 'Esther',
  'Job', 'Salmos', 'Psalms', 'Proverbios', 'Proverbs', 'Eclesiastés', 'Eclesiastes', 'Ecclesiastes',
  'Sabiduría', 'Sabiduria', 'Wisdom', 'Eclesiástico', 'Eclesiastico', 'Sirácida', 'Siracida', 'Sirach',
  'Isaías', 'Isaias', 'Isaiah', 'Jeremías', 'Jeremias', 'Jeremiah',
  'Lamentaciones', 'Lamentations', 'Baruc', 'Baruch', 'Ezequiel', 'Ezekiel',
  'Daniel', 'Oseas', 'Hosea', 'Joel', 'Amós', 'Amos', 'Abdías', 'Abdias', 'Obadiah',
  'Jonás', 'Jonas', 'Jonah', 'Miqueas', 'Micah', 'Nahúm', 'Nahum', 'Habacuc', 'Habakkuk',
  'Sofonías', 'Sofonias', 'Zephaniah', 'Hageo', 'Haggai', 'Zacarías', 'Zacarias', 'Zechariah',
  'Malaquías', 'Malaquias', 'Malachi',
  'Mateo', 'Matthew', 'Marcos', 'Mark', 'Lucas', 'Luke', 'Juan', 'John',
  'Hechos', 'Acts', 'Romanos', 'Romans', 'Gálatas', 'Galatas', 'Galatians',
  'Efesios', 'Ephesians', 'Filipenses', 'Philippians', 'Colosenses', 'Colossians',
  'Tito', 'Titus', 'Filemón', 'Filemon', 'Philemon', 'Hebreos', 'Hebrews',
  'Santiago', 'James', 'Judas', 'Jude', 'Apocalipsis', 'Revelation'
];

// Auto-linker: detecta libros bíblicos en texto plano, enlazando solo la primera ocurrencia (dedup a nivel de mensaje)
const parseTextWithAutoLinks = (textStr: string, linkedBooks: Set<string>) => {
  const results: Array<{
    type: 'text' | 'ref';
    content: string;
    book: string;
    chapter?: number;
    verse?: number;
  }> = [];

  const sortedNames = [...bookNamesToMatch].sort((a, b) => b.length - a.length);
  const escapedNames = sortedNames.map(name => name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|');
  // Soporta tanto dos puntos (:) como comas (,) como separador capítulo-versículo
  const refRegex = new RegExp(`(${escapedNames})(?:\\s+(\\d+)(?::|,)\\s*(\\d+)(-\\d+)?|\\s+(\\d+))?`, 'g');

  const isLetter = (char: string) => char && char.toLowerCase() !== char.toUpperCase();

  let lastIndex = 0;
  let match;

  while ((match = refRegex.exec(textStr)) !== null) {
    const matchIndex = match.index;
    const matchStr = match[0];
    const book = match[1];

    // Verificar que no sea parte de una palabra más larga
    const charBefore = matchIndex > 0 ? textStr[matchIndex - 1] : '';
    if (isLetter(charBefore)) continue;
    const charAfter = textStr[matchIndex + matchStr.length] ?? '';
    if (isLetter(charAfter)) continue;

    let chapter: number | undefined;
    let verse: number | undefined;
    if (match[2]) {
      chapter = parseInt(match[2], 10);
      verse = parseInt(match[3], 10);
    } else if (match[5]) {
      chapter = parseInt(match[5], 10);
    }

    const lookupKey = book
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s/g, '');

    if (matchIndex > lastIndex) {
      results.push({ type: 'text', content: textStr.substring(lastIndex, matchIndex), book: '' });
    }

    if (!linkedBooks.has(lookupKey)) {
      linkedBooks.add(lookupKey);
      results.push({ type: 'ref', content: matchStr, book, chapter, verse });
    } else {
      results.push({ type: 'text', content: matchStr, book: '' });
    }

    lastIndex = refRegex.lastIndex;
  }

  if (lastIndex < textStr.length) {
    results.push({ type: 'text', content: textStr.substring(lastIndex), book: '' });
  }

  return results;
};

// Función helper para parsear referencias de texto dentro de [[...]]
const parseReference = (cleanRef: string) => {
  const trimmed = cleanRef.trim();

  // Caso 1: Libro Capítulo:Versículo (ej: "Génesis 1:1" o "1 Juan 3:16-18")
  let match = /^([1-3]?\s?[A-Za-zÁ-Úá-ú0-9\s]+?)\s(\d+):(\d+)(-\d+)?$/.exec(trimmed);
  if (match) {
    return {
      book: match[1].trim(),
      chapter: parseInt(match[2], 10),
      verse: parseInt(match[3], 10),
    };
  }

  // Caso 2: Libro Capítulo (ej: "Génesis 2" o "1 Samuel 15")
  match = /^([1-3]?\s?[A-Za-zÁ-Úá-ú0-9\s]+?)\s(\d+)$/.exec(trimmed);
  if (match) {
    return {
      book: match[1].trim(),
      chapter: parseInt(match[2], 10),
      verse: undefined,
    };
  }

  // Caso 3: Solo Libro (ej: "Génesis" o "Hechos")
  return {
    book: trimmed,
    chapter: undefined,
    verse: undefined,
  };
};

export default function MessageParser({text}: MessageParserProps) {
  const {colors, isDarkMode} = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const navigateToReference = (bookNameStr: string, chapterVal?: number, verseVal?: number) => {
    const lookupKey = bookNameStr
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s/g, "");

    const bookInfo = bookMap[lookupKey];
    
    if (bookInfo) {
      navigation.navigate('ChapterReading', {
        bookId: bookInfo.id,
        bookName: bookInfo.name,
        chapter: chapterVal || 1,
        testament: bookInfo.testament,
        favoriteVerseNumber: verseVal,
      });
    } else {
      console.warn(`[MessageParser] Book not found in static map: ${bookNameStr} (normalized: ${lookupKey})`);
    }
  };

  // Renderiza una línea: primero separa negritas, luego aplica auto-linking dentro de cada parte
  const renderFormattedLine = (lineText: string, lineKey: string, linkedBooks: Set<string>) => {
    // Eliminar corchetes sobrantes si la IA usó [[...]] directamente
    const cleanLine = lineText.replace(/\[\[/g, '').replace(/\]\]/g, '');

    // Separar en partes de negritas (**...**)
    const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, index) => {
      const partKey = `${lineKey}-part-${index}`;
      const isBold = part.startsWith('**') && part.endsWith('**');
      const contentText = isBold ? part.slice(2, -2) : part;

      if (!contentText) return null;

      // Aplicar auto-linking sobre el contenido (sea negrita o no)
      const segments = parseTextWithAutoLinks(contentText, linkedBooks);

      return segments.map((segment, segIndex) => {
        const segKey = `${partKey}-seg-${segIndex}`;
        if (segment.type === 'ref') {
          return (
            <Text
              key={segKey}
              onPress={() => navigateToReference(segment.book, segment.chapter, segment.verse)}
              style={[styles.tagText, {
                color: colors.primary.DEFAULT,
                backgroundColor: isDarkMode ? `${colors.primary.DEFAULT}20` : `${colors.primary.DEFAULT}10`,
                fontWeight: isBold ? 'bold' : 'normal',
              }]}
            >
              {segment.content}
            </Text>
          );
        }
        return (
          <Text key={segKey} style={{ color: colors.charcoal.DEFAULT, fontWeight: isBold ? 'bold' : 'normal' }}>
            {segment.content}
          </Text>
        );
      });
    });
  };

  const renderText = () => {
    const lines = text.split('\n');
    // linkedBooks persiste a lo largo de todo el mensaje para evitar enlaces duplicados
    const linkedBooks = new Set<string>();

    return lines.map((line, lineIndex) => {
      const trimmed = line.trim();
      let isBullet = false;
      let isHeader = false;
      let displayLine = line;

      // Detectar viñetas de listas
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        isBullet = true;
        displayLine = trimmed.substring(2);
      }
      // Detectar encabezados Markdown
      else if (trimmed.startsWith('### ')) {
        isHeader = true;
        displayLine = trimmed.substring(4);
      } else if (trimmed.startsWith('## ')) {
        isHeader = true;
        displayLine = trimmed.substring(3);
      } else if (trimmed.startsWith('# ')) {
        isHeader = true;
        displayLine = trimmed.substring(2);
      }

      const content = renderFormattedLine(displayLine, `line-${lineIndex}`, linkedBooks);

      if (isBullet) {
        return (
          <View key={`line-wrap-${lineIndex}`} style={styles.bulletRow}>
            <Text style={[styles.bulletPoint, { color: colors.primary.DEFAULT }]}>• </Text>
            <Text style={[styles.text, { color: colors.charcoal.DEFAULT, flex: 1 }]}>
              {content}
            </Text>
          </View>
        );
      }

      if (isHeader) {
        return (
          <Text key={`line-wrap-${lineIndex}`} style={[styles.headerText, { color: colors.charcoal.DEFAULT }]}>
            {content}
          </Text>
        );
      }

      // Espaciado para líneas vacías (separación de párrafos)
      if (trimmed === '') {
        return <View key={`line-wrap-${lineIndex}`} style={styles.paragraphSpacer} />;
      }

      return (
        <Text key={`line-wrap-${lineIndex}`} style={[styles.text, { color: colors.charcoal.DEFAULT }]}>
          {content}
        </Text>
      );
    });
  };

  return <View style={styles.container}>{renderText()}</View>;
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 2,
    width: '100%',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 4,
  },
  boldText: {
    fontWeight: 'bold',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 6,
    lineHeight: 26,
  },
  tagText: {
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    paddingLeft: 6,
    width: '100%',
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 'bold',
    marginRight: 6,
  },
  paragraphSpacer: {
    height: 8,
  }
});
