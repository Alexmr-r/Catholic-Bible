/**
 * CONTEXTO: Estado de Conexión a Internet
 *
 * Proporciona información sobre el estado de la conexión de red
 * a toda la aplicación. Permite que las pantallas reaccionen
 * al cambio de conexión (online/offline).
 *
 * También sincroniza automáticamente datos pendientes cuando
 * se recupera la conexión.
 */

import React, {createContext, useContext, useState, useEffect, useRef, ReactNode} from 'react';
import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import {syncService} from '../services/sync.service';
import {API_CONFIG} from '../services/config';
import {EnglishBibleDownloadService} from '../services/english-bible-download.service';

interface NetworkContextType {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string | null;
  isServerAvailable: boolean;
  isForcedOffline: boolean;
  isBibleDownloaded: boolean;
  // Método para forzar re-check
  checkConnection: () => Promise<boolean>;
  refreshServerStatus: () => Promise<boolean>;
  refreshDownloadStatus: () => Promise<boolean>;
  setForcedOffline: (forced: boolean) => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({children}) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  const [isServerAvailable, setIsServerAvailable] = useState(false);
  const [isForcedOffline, setIsForcedOffline] = useState(false);
  const [isBibleDownloaded, setIsBibleDownloaded] = useState(false);
  const wasOffline = useRef(false);
  const lastCheckTime = useRef(0);

  // Cargar estado inicial de descarga
  useEffect(() => {
    refreshDownloadStatus();
  }, []);

  const refreshDownloadStatus = async () => {
    try {
      const downloaded = await EnglishBibleDownloadService.isDownloaded();
      setIsBibleDownloaded(downloaded);
      return downloaded;
    } catch (error) {
      console.error('[Network] Error checking download status:', error);
      return false;
    }
  };

  useEffect(() => {
    // Obtener estado inicial
    NetInfo.fetch().then(handleNetworkChange);

    // Suscribirse a cambios de conexión
    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);

    return () => {
      unsubscribe();
    };
  }, []);

  // ✅ AUTO-ACTIVACIÓN MODO OFFLINE
  // Cuando perdemos la conexión real, si tenemos la biblia descargada,
  // activamos automáticamente el modo offline para que la app se comporte
  // como "Local Activo" inmediatamente.
  useEffect(() => {
    const autoToggleOffline = async () => {
      // 1. Si perdemos conexión real, no hay internet, O EL SERVIDOR NO RESPONDE
      if (!isConnected || isInternetReachable === false || !isServerAvailable) {
        // Verificamos si hay biblia (usamos el estado actual y un re-check rápido)
        const downloaded = await refreshDownloadStatus();
        
        if (downloaded) {
          console.log('[Network] 🤖 Auto-activando modo offline (Biblia detectada y servidor caído)');
          if (!isForcedOffline) setIsForcedOffline(true);
        }
      }
      // NOTA: Eliminamos la lógica de "auto-desactivar" aquí. 
      // Si el usuario lo fuerza manualmente a ON, o se activó solo al perder red,
      // queremos que siga activo hasta que el usuario decida apagarlo o esté implícito
      // en la navegación, para evitar que el useEffect pise el botón manual del Perfil.
    };

    autoToggleOffline();
  }, [isConnected, isServerAvailable, isBibleDownloaded]); // Reaccionar a cambios de red O si la biblia se descarga/elimina

  const handleNetworkChange = async (state: NetInfoState) => {
    const nowConnected = state.isConnected ?? false;
    const nowReachable = state.isInternetReachable !== false;

    setIsConnected(nowConnected);
    setIsInternetReachable(state.isInternetReachable);
    setConnectionType(state.type);

    // ✅ SINCRONIZACIÓN AUTOMÁTICA
    // Si estábamos offline y ahora estamos online, sincronizar
    if (wasOffline.current && nowConnected && nowReachable) {
      console.log('[Network] 🔄 Conexión recuperada, sincronizando datos pendientes...');
      try {
        const synced = await syncService.syncAll();
        if (synced > 0) {
          console.log(`[Network] ✅ ${synced} operaciones sincronizadas`);
        }
      } catch (error) {
        console.error('[Network] ❌ Error en sincronización automática:', error);
      }
    }

    // Actualizar estado de offline
    wasOffline.current = !nowConnected || !nowReachable;

    // Verificar servidor si estamos online
    if (nowConnected && nowReachable) {
      refreshServerStatus();
    } else {
      setIsServerAvailable(false);
    }

    // Log para debugging
    if (__DEV__) {
      console.log('[Network] Estado:', {
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
    }
  };

  const checkConnection = async (): Promise<boolean> => {
    const state = await NetInfo.fetch();
    handleNetworkChange(state);
    return state.isConnected ?? false;
  };

  const refreshServerStatus = async (): Promise<boolean> => {
    // Si no hay internet de base, ni intentamos
    if (!isConnected) {
      setIsServerAvailable(false);
      return false;
    }

    const now = Date.now();
    // No saturar con peticiones si acabamos de chequear (cada 10s mínimo)
    if (now - lastCheckTime.current < 10000) {
      return isServerAvailable;
    }
    
    lastCheckTime.current = now;

    try {
      const controller = new AbortController();
      // Usar el timeout configurado o 5s por defecto
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT || 4000);
      
      // Intentamos un HEAD al root o health
      // Si el servidor responde con CUALQUIER COSA, es que está vivo.
      const response = await fetch(API_CONFIG.BASE_URL, {
        method: 'HEAD',
        signal: controller.signal,
      }).catch(() => {
        return fetch(API_CONFIG.BASE_URL, {
          method: 'GET',
          signal: controller.signal,
        });
      });

      clearTimeout(timeoutId);
      
      // Si recibimos una respuesta del servidor (incluso 404 o 401), el servidor está AHÍ.
      // Solo falla si hay un Error de Red o Timeout.
      const isAvailable = response.status >= 200 && response.status < 500;
      setIsServerAvailable(isAvailable);
      return isAvailable;
    } catch (error) {
      console.warn('[Network] Servidor no responde en:', API_CONFIG.BASE_URL);
      setIsServerAvailable(false);
      return false;
    }
  };

  // Re-chequeo periódico
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        refreshServerStatus();
      }
    }, 60000); // Cada minuto chequeo de "salud"
    return () => clearInterval(interval);
  }, [isConnected]);

  const setForcedOffline = (forced: boolean) => {
    setIsForcedOffline(forced);
    if (!forced) {
      refreshServerStatus();
    }
  };

  return (
    <NetworkContext.Provider
      value={{
        isConnected,
        isInternetReachable,
        connectionType,
        isServerAvailable,
        isForcedOffline,
        isBibleDownloaded,
        checkConnection,
        refreshServerStatus,
        refreshDownloadStatus: async () => await refreshDownloadStatus(),
        setForcedOffline,
      }}>
      {children}
    </NetworkContext.Provider>
  );
};

/**
 * Hook para acceder al estado de conexión
 */
export const useNetwork = (): NetworkContextType => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork debe usarse dentro de NetworkProvider');
  }
  return context;
};

/**
 * Hook simplificado que solo devuelve si hay conexión
 */
export const useIsOnline = (): boolean => {
  const {isConnected, isInternetReachable, isForcedOffline, isServerAvailable} = useNetwork();
  
  // 1. Prioridad: Desconectado si el usuario lo forzó o no hay red física
  if (isForcedOffline || !isConnected) return false;
  
  // 2. Desconectado si NetInfo confirma que internet no es alcanzable
  if (isInternetReachable === false) return false;
  
  // 3. Estado Online dependiente de si el servidor de la app responde
  return isServerAvailable;
};

export default NetworkContext;
