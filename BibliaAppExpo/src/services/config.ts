import { Platform } from 'react-native';

/**
 * Configuración de la API
 *
 * IMPORTANTE: Cambia LOCAL_IP a la IP de tu Mac si cambias de red
 * Para obtener tu IP: ifconfig | grep "inet " | grep -v 127.0.0.1
 */

// ⚠️ CAMBIA ESTA IP SI CAMBIAS DE RED WIFI
const LOCAL_IP = '192.168.1.135';


// Detectar el entorno y seleccionar la URL correcta
const getApiBaseUrl = (): string => {
  // En desarrollo, siempre usa la IP local para que funcione en:
  // - Expo Go (dispositivo físico)
  // - Simuladores
  // - Web

  if (__DEV__) {
    // Modo desarrollo
    if (Platform.OS === 'web') {
      return 'http://localhost:8080/api/v1';
    }
    // Para iOS y Android (tanto simulador como dispositivo físico)
    return `http://${LOCAL_IP}:8080/api/v1`;
  }

  // Producción (cuando tengas un servidor)
  return 'https://api.tudominio.com/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

// Log para debug (solo en desarrollo)
if (__DEV__) {
  console.log('🌐 API URL:', API_BASE_URL);
}

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 4000,           // 4 segundos para el resto de la app
  TIMEOUT_AI: 0,           // 0 = Infinito para la IA
};

export default API_CONFIG;
