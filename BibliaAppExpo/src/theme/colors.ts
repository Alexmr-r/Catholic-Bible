// 🎨 Paleta de colores - CatholicVerse
// Basado en el diseño HTML con colores litúrgicos y sobrios

export type ThemeColors = {
  ivory: { DEFAULT: string; shade: string; border: string; };
  cream: string;
  paper: string;
  charcoal: { DEFAULT: string; muted: string; dark: string; };
  ink: { DEFAULT: string; light: string; };
  primary: { DEFAULT: string; dark: string; light: string; };
  secondary: string;
  gold: { DEFAULT: string; light: string; dim: string; accent: string; };
  burgundy: { DEFAULT: string; dark: string; accent: string; };
  sky: string;
  background: { light: string; dark: string; };
  surface: { light: string; dark: string; highlight: string; };
};

export const lightColors: ThemeColors = {
  ivory: {
    DEFAULT: '#FAF9F6',
    shade: '#F2EFE9',
    border: '#E6E2D8',
  },
  cream: '#FAFAF5',
  paper: '#F4F1EA',
  charcoal: {
    DEFAULT: '#374151',
    muted: '#6B7280',
    dark: '#1F2937',
  },
  ink: {
    DEFAULT: '#374151',
    light: '#6B7280',
  },
  primary: {
    DEFAULT: '#6B9080',   // ✅ Mantenemos su Sage Green original
    dark: '#4A665A',
    light: '#E8F0F0',
  },
  secondary: '#A4C3B2',
  gold: {
    DEFAULT: '#D4AF37',
    light: '#EBD698',
    dim: '#B09050',
    accent: '#D4A373',
  },
  burgundy: {
    DEFAULT: '#903040',
    dark: '#70202C',
    accent: '#9D5C63',
  },
  sky: '#8ECAE6',
  background: {
    light: '#FAFAF5',
    dark: '#1C1C1E',
  },
  surface: {
    light: '#FFFFFF',
    dark: '#2C2C2E',
    highlight: '#2C2C2E',
  },
};

export const darkColors: ThemeColors = {
  // Fondos extraídos del HTML
  ivory: {
    DEFAULT: '#1a160d', // background-dark
    shade: '#211d11',   // Input background
    border: '#2a2415',
  },
  cream: '#1a160d',
  paper: '#2a2415',

  // Textos adaptados para fondos oscuros
  charcoal: {
    DEFAULT: '#f1f5f9', // text-slate-100
    muted: '#94a3b8',   // text-slate-400
    dark: '#ffffff',
  },
  ink: {
    DEFAULT: '#f1f5f9',
    light: '#94a3b8',
  },

  // Color primario: Dorado brillante #e6b319 del HTML
  primary: {
    DEFAULT: '#e6b319',
    dark: '#cda017',
    light: 'rgba(230, 179, 25, 0.1)',
  },
  secondary: '#bba269',

  // Acentos (los oros del HTML solo sustituyen al gold original)
  gold: {
    DEFAULT: '#e6b319', // primary dorado del HTML
    light: '#f0ce6b',
    dim: '#8f7010',
    accent: '#cca116',
  },
  burgundy: {
    DEFAULT: '#D9777F', // Rosa Coral vibrante para mejor legibilidad
    dark: '#B36D71',
    accent: '#E58E97',
  },
  sky: '#8ECAE6',

  // Fondos estructurales
  background: {
    light: '#FAFAF5',
    dark: '#1a160d',
  },
  surface: {
    light: '#FFFFFF',
    dark: '#1a160d', // fondo oscuro principal
    highlight: '#2a2415',
  },
};

export const colors = lightColors;
