/**
 * ==========================================
 * TEXT SETTINGS CONTEXT
 * ==========================================
 * Maneja configuración de texto (tamaño y fuente)
 * Persiste en AsyncStorage
 */

import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tipos
export type FontFamily = 'Lora_400Regular' | 'sans';

export interface TextSettings {
  fontSize: number; // Porcentaje: 80-150
  fontFamily: FontFamily;
}

interface TextSettingsContextType {
  settings: TextSettings;
  updateFontSize: (size: number) => Promise<void>;
  updateFontFamily: (family: FontFamily) => Promise<void>;
  resetSettings: () => Promise<void>;
}

// Valores por defecto
const DEFAULT_SETTINGS: TextSettings = {
  fontSize: 100, // 100%
  fontFamily: 'Lora_400Regular',
};

const STORAGE_KEY = '@biblia_text_settings';

// Context
const TextSettingsContext = createContext<TextSettingsContextType | undefined>(undefined);

// Provider
export const TextSettingsProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [settings, setSettings] = useState<TextSettings>(DEFAULT_SETTINGS);

  // Cargar settings desde AsyncStorage al montar
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as TextSettings;
        setSettings(parsed);
        console.log('[TextSettings] Cargados desde caché:', parsed);
      }
    } catch (error) {
      console.error('[TextSettings] Error cargando:', error);
    }
  };

  const saveSettings = async (newSettings: TextSettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
      console.log('[TextSettings] Guardados:', newSettings);
    } catch (error) {
      console.error('[TextSettings] Error guardando:', error);
    }
  };

  const updateFontSize = async (size: number) => {
    const clamped = Math.min(Math.max(size, 80), 150); // 80-150%
    await saveSettings({...settings, fontSize: clamped});
  };

  const updateFontFamily = async (family: FontFamily) => {
    await saveSettings({...settings, fontFamily: family});
  };

  const resetSettings = async () => {
    await saveSettings(DEFAULT_SETTINGS);
  };

  return (
    <TextSettingsContext.Provider
      value={{
        settings,
        updateFontSize,
        updateFontFamily,
        resetSettings,
      }}>
      {children}
    </TextSettingsContext.Provider>
  );
};

// Hook
export const useTextSettings = () => {
  const context = useContext(TextSettingsContext);
  if (!context) {
    throw new Error('useTextSettings debe usarse dentro de TextSettingsProvider');
  }
  return context;
};
