// @ts-ignore
import en from './en';
// @ts-ignore
import es from './es';

const translations: Record<string, any> = { en, es };

// Actualmente forzamos inglés para que toda la app mute a inglés como por arte de magia
let locale = 'en';

export const setLocale = (newLocale: string) => {
    locale = newLocale;
};

export const getLocale = () => locale;

export const t = (path: string, params?: Record<string, string>): string => {
    const keys = path.split('.');
    let current: any = translations[locale];

    for (const key of keys) {
        if (current[key] === undefined) {
            console.warn(`Translation missing for key: ${path}`);
            return path; // Retorna el path si no existe
        }
        current = current[key];
    }

    let result = current as string;
    if (params) {
        for (const [key, value] of Object.entries(params)) {
            result = result.replace(`{{${key}}}`, value);
        }
    }

    return result;
};
