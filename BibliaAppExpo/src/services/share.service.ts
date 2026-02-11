/**
 * ==========================================
 * SERVICIO DE COMPARTIR - SHARE SERVICE
 * ==========================================
 *
 * Servicio centralizado para compartir contenido de la app.
 * Maneja diferentes tipos de contenido con formatos optimizados
 * para cada plataforma y tipo de mensaje.
 *
 * Características:
 * - Formatos de texto profesionales y atractivos
 * - Soporte para diferentes tipos de contenido
 * - Manejo de errores consistente
 * - Analytics de compartir (preparado)
 * - Soporte multi-idioma (preparado)
 *
 * ==========================================
 */

import { Share, Platform } from 'react-native';

// ==========================================
// TIPOS
// ==========================================

export type ShareContentType =
  | 'verse'           // Versículo individual
  | 'verses'          // Múltiples versículos
  | 'chapter'         // Capítulo completo
  | 'daily_reading'   // Lectura del día
  | 'reflection'      // Reflexión personal
  | 'favorite'        // Favorito
  | 'writing';        // Escrito personal

export interface ShareVerseParams {
  bookName: string;
  chapter: number;
  verseNumber: number;
  verseText: string;
}

export interface ShareVersesParams {
  bookName: string;
  chapter: number;
  startVerse: number;
  endVerse: number;
  versesText: string; // Texto formateado de los versículos
}

export interface ShareChapterParams {
  bookName: string;
  chapter: number;
  sections: Array<{
    title?: string;
    verses: Array<{
      number: number;
      text: string;
    }>;
  }>;
}

export interface ShareDailyReadingParams {
  date: string;
  reference: string;
  text: string;
  reflection?: string;
}

export interface ShareReflectionParams {
  title: string;
  content: string;
  reference?: string;
  date: string;
}

export interface ShareWritingParams {
  title: string;
  content: string;
  reference?: string;
}

export interface ShareResult {
  success: boolean;
  action: 'shared' | 'dismissed' | 'error';
  activityType?: string; // Solo iOS
  error?: string;
}

// ==========================================
// CONFIGURACIÓN
// ==========================================

const APP_NAME = 'Biblia App';
const APP_TAGLINE = '📖 Tu compañero de lectura bíblica';
const SHARE_FOOTER = `\n\n— Compartido desde ${APP_NAME}`;

// Emojis para decorar el contenido
const EMOJI = {
  book: '📖',
  pray: '🙏',
  star: '⭐',
  heart: '❤️',
  pen: '✍️',
  calendar: '📅',
  light: '💡',
  cross: '✝️',
  dove: '🕊️',
  scroll: '📜',
};

// ==========================================
// FORMATEADORES DE TEXTO
// ==========================================

/**
 * Formatea la referencia bíblica de manera profesional
 */
const formatReference = (bookName: string, chapter: number, verse?: number, endVerse?: number): string => {
  if (verse && endVerse && verse !== endVerse) {
    return `${bookName} ${chapter}:${verse}-${endVerse}`;
  } else if (verse) {
    return `${bookName} ${chapter}:${verse}`;
  }
  return `${bookName} ${chapter}`;
};

/**
 * Formatea fecha en español
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return date.toLocaleDateString('es-ES', options);
};

/**
 * Trunca texto largo de manera inteligente
 */
const truncateText = (text: string, maxLength: number = 500): string => {
  if (text.length <= maxLength) return text;

  // Buscar el último espacio antes del límite para no cortar palabras
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }
  return truncated + '...';
};

/**
 * Limpia el texto de caracteres especiales problemáticos
 */
const cleanText = (text: string): string => {
  return text
    .replace(/\s+/g, ' ') // Normalizar espacios
    .trim();
};

// ==========================================
// GENERADORES DE MENSAJE
// ==========================================

/**
 * Genera mensaje para versículo individual
 */
const generateVerseMessage = (params: ShareVerseParams): { message: string; title: string } => {
  const reference = formatReference(params.bookName, params.chapter, params.verseNumber);

  const message = `${EMOJI.book} ${reference}\n\n"${cleanText(params.verseText)}"${SHARE_FOOTER}`;

  return { message, title: reference };
};

/**
 * Genera mensaje para múltiples versículos
 */
const generateVersesMessage = (params: ShareVersesParams): { message: string; title: string } => {
  const reference = formatReference(params.bookName, params.chapter, params.startVerse, params.endVerse);

  const message = `${EMOJI.book} ${reference}\n\n${cleanText(params.versesText)}${SHARE_FOOTER}`;

  return { message, title: reference };
};

/**
 * Genera mensaje para capítulo completo
 */
const generateChapterMessage = (params: ShareChapterParams): { message: string; title: string } => {
  const reference = formatReference(params.bookName, params.chapter);

  let chapterText = '';
  params.sections.forEach(section => {
    if (section.title) {
      chapterText += `\n${EMOJI.scroll} ${section.title}\n\n`;
    }
    section.verses.forEach(verse => {
      chapterText += `${verse.number}. ${cleanText(verse.text)}\n`;
    });
  });

  // Para capítulos largos, truncar inteligentemente
  const maxChapterLength = 3000; // Límite para evitar problemas en algunas apps
  const truncatedText = chapterText.length > maxChapterLength
    ? truncateText(chapterText, maxChapterLength) + '\n\n[Capítulo completo disponible en la app]'
    : chapterText;

  const message = `${EMOJI.book} ${reference}\n${truncatedText}${SHARE_FOOTER}`;

  return { message, title: reference };
};

/**
 * Genera mensaje para lectura del día
 */
const generateDailyReadingMessage = (params: ShareDailyReadingParams): { message: string; title: string } => {
  const formattedDate = formatDate(params.date);
  const title = `Lectura del día - ${params.reference}`;

  let message = `${EMOJI.calendar} Lectura del día\n${formattedDate}\n\n`;
  message += `${EMOJI.book} ${params.reference}\n\n`;
  message += `"${truncateText(cleanText(params.text), 800)}"`;

  if (params.reflection) {
    message += `\n\n${EMOJI.pen} Mi reflexión:\n${truncateText(params.reflection, 300)}`;
  }

  message += SHARE_FOOTER;

  return { message, title };
};

/**
 * Genera mensaje para reflexión personal
 */
const generateReflectionMessage = (params: ShareReflectionParams): { message: string; title: string } => {
  const formattedDate = formatDate(params.date);
  const title = params.title || 'Mi reflexión';

  let message = `${EMOJI.pen} ${title}\n${formattedDate}\n\n`;

  if (params.reference) {
    message += `${EMOJI.book} ${params.reference}\n\n`;
  }

  message += truncateText(cleanText(params.content), 1000);
  message += SHARE_FOOTER;

  return { message, title };
};

/**
 * Genera mensaje para escrito personal
 */
const generateWritingMessage = (params: ShareWritingParams): { message: string; title: string } => {
  const title = params.title || 'Mi escrito';

  let message = `${EMOJI.pen} ${title}\n\n`;

  if (params.reference) {
    message += `${EMOJI.book} Basado en: ${params.reference}\n\n`;
  }

  message += truncateText(cleanText(params.content), 1500);
  message += SHARE_FOOTER;

  return { message, title };
};

// ==========================================
// SERVICIO PRINCIPAL
// ==========================================

class ShareService {
  /**
   * Compartir versículo individual
   */
  async shareVerse(params: ShareVerseParams): Promise<ShareResult> {
    const { message, title } = generateVerseMessage(params);
    return this.share(message, title, 'verse');
  }

  /**
   * Compartir múltiples versículos
   */
  async shareVerses(params: ShareVersesParams): Promise<ShareResult> {
    const { message, title } = generateVersesMessage(params);
    return this.share(message, title, 'verses');
  }

  /**
   * Compartir capítulo completo
   */
  async shareChapter(params: ShareChapterParams): Promise<ShareResult> {
    console.log('[ShareService] shareChapter llamado con:', params.bookName, params.chapter);
    const { message, title } = generateChapterMessage(params);
    console.log('[ShareService] Mensaje generado, longitud:', message.length);
    return this.share(message, title, 'chapter');
  }

  /**
   * Compartir lectura del día
   */
  async shareDailyReading(params: ShareDailyReadingParams): Promise<ShareResult> {
    const { message, title } = generateDailyReadingMessage(params);
    return this.share(message, title, 'daily_reading');
  }

  /**
   * Compartir reflexión
   */
  async shareReflection(params: ShareReflectionParams): Promise<ShareResult> {
    const { message, title } = generateReflectionMessage(params);
    return this.share(message, title, 'reflection');
  }

  /**
   * Compartir escrito personal
   */
  async shareWriting(params: ShareWritingParams): Promise<ShareResult> {
    const { message, title } = generateWritingMessage(params);
    return this.share(message, title, 'writing');
  }

  /**
   * Método principal de compartir
   */
  private async share(
    message: string,
    title: string,
    contentType: ShareContentType
  ): Promise<ShareResult> {
    try {
      console.log('[ShareService] share() llamado');
      console.log('[ShareService] Platform:', Platform.OS);

      const shareOptions: { message: string; title?: string; subject?: string } = {
        message,
      };

      // En iOS, title se usa como subject en algunos casos
      if (Platform.OS === 'ios') {
        shareOptions.title = title;
      } else {
        // En Android, subject se usa para el asunto en emails
        shareOptions.subject = title;
        shareOptions.title = title;
      }

      console.log('[ShareService] Llamando a Share.share()...');
      const result = await Share.share(shareOptions);
      console.log('[ShareService] Share.share() resultado:', result);

      if (result.action === Share.sharedAction) {
        // Éxito al compartir
        this.logShareEvent(contentType, 'shared', result.activityType);

        return {
          success: true,
          action: 'shared',
          activityType: result.activityType,
        };
      } else if (result.action === Share.dismissedAction) {
        // Usuario canceló
        this.logShareEvent(contentType, 'dismissed');

        return {
          success: false,
          action: 'dismissed',
        };
      }

      return {
        success: false,
        action: 'error',
        error: 'Unknown action',
      };
    } catch (error: any) {
      console.error('[ShareService] Error compartiendo:', error);
      this.logShareEvent(contentType, 'error', undefined, error.message);

      return {
        success: false,
        action: 'error',
        error: error.message || 'Error desconocido',
      };
    }
  }

  /**
   * Log de eventos de compartir (preparado para analytics)
   */
  private logShareEvent(
    contentType: ShareContentType,
    action: string,
    activityType?: string,
    error?: string
  ): void {
    const event = {
      event: 'share',
      contentType,
      action,
      activityType,
      error,
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
    };

    // Log en desarrollo
    if (__DEV__) {
      console.log('[ShareService] Event:', event);
    }

    // TODO: Enviar a analytics en producción
    // analytics.logEvent('share', event);
  }

  /**
   * Genera preview del texto que se compartirá (útil para mostrar al usuario)
   */
  getSharePreview(contentType: ShareContentType, params: any): string {
    switch (contentType) {
      case 'verse':
        return generateVerseMessage(params).message;
      case 'verses':
        return generateVersesMessage(params).message;
      case 'chapter':
        return generateChapterMessage(params).message;
      case 'daily_reading':
        return generateDailyReadingMessage(params).message;
      case 'reflection':
        return generateReflectionMessage(params).message;
      case 'writing':
        return generateWritingMessage(params).message;
      default:
        return '';
    }
  }
}

// Exportar instancia singleton
export const shareService = new ShareService();

// Exportar tipos para uso en componentes
export type {
  ShareVerseParams,
  ShareVersesParams,
  ShareChapterParams,
  ShareDailyReadingParams,
  ShareReflectionParams,
  ShareWritingParams,
};
