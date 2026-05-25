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
import {Platform, ActivityIndicator} from 'react-native';
import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import {syncService} from '../services/sync.service';
import {API_CONFIG} from '../services/config';
import {EnglishBibleDownloadService} from '../services/english-bible-download.service';

// Configurar NetInfo para que en Android detecte más rápido la pérdida real de internet
// (no solo cuando se apaga el Wi-Fi/Modo avión)
NetInfo.configure({
  reachabilityUrl: 'https://clients3.google.com/generate_204',
  reachabilityTest: async (response) => response.status === 204,
  reachabilityLongTimeout: 30 * 1000, // Check every 30s when online
  reachabilityShortTimeout: 5 * 1000, // Check every 5s when offline
  reachabilityRequestTimeout: 5 * 1000, // Timeout requests after 5s
  reachabilityShouldRun: () => true,
});

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
  const isConnectedRef = useRef(true);
  const isServerAvailableRef = useRef(false);

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
      if (!isConnected || !isServerAvailable) {
        // Verificamos si hay biblia (usamos el estado actual y un re-check rápido)
        const downloaded = await refreshDownloadStatus();
        
        if (downloaded) {
          console.log('[Network] 🤖 Auto-activando modo offline (Biblia detectada y servidor caído)');
          if (!isForcedOffline) setIsForcedOffline(true);
        }
      } else if (isConnected && isServerAvailable) {
        // ✅ AUTO-DESACTIVACIÓN: Si todo vuelve a la normalidad, volver a Online
        if (isForcedOffline) {
          console.log('[Network] 🚀 Restaurando modo online automáticamente');
          setIsForcedOffline(false);
        }
      }
    };

    autoToggleOffline();
  }, [isConnected, isServerAvailable, isBibleDownloaded]); // Reaccionar a cambios de red O si la biblia se descarga/elimina

  const handleNetworkChange = async (state: NetInfoState) => {
    const nowConnected = state.isConnected ?? false;
    const nowReachable = state.isInternetReachable !== false;

    // Actualizar Refs inmediatamente (verdad absoluta)
    isConnectedRef.current = nowConnected;
    
    // Actualizar estados para la UI
    setIsConnected(nowConnected);
    setIsInternetReachable(state.isInternetReachable);
    setConnectionType(state.type);

    // ✅ SINCRONIZACIÓN AUTOMÁTICA
    if (wasOffline.current && nowConnected && nowReachable) {
      syncService.syncAll().catch(err => console.error('[Network] Sync error:', err));
    }

    wasOffline.current = !nowConnected || !nowReachable;

    if (nowConnected) {
      refreshServerStatus(true);
      if (Platform.OS === 'android') {
        setTimeout(() => refreshServerStatus(true), 3000);
        setTimeout(() => refreshServerStatus(true), 6000);
      }
    } else {
      isServerAvailableRef.current = false;
      setIsServerAvailable(false);
    }
  };

  const checkConnection = async (): Promise<boolean> => {
    const state = await NetInfo.fetch();
    handleNetworkChange(state);
    return state.isConnected ?? false;
  };

  const refreshServerStatus = async (force = false): Promise<boolean> => {
    // Usar el Ref para evitar clausuras obsoletas
    if (!isConnectedRef.current) {
      isServerAvailableRef.current = false;
      setIsServerAvailable(false);
      return false;
    }

    const now = Date.now();
    if (!force && (now - lastCheckTime.current < 10000)) {
      return isServerAvailableRef.current;
    }
    
    lastCheckTime.current = now;

    const healthUrl = `${API_CONFIG.BASE_URL}/health`;

    try {
      const controller = new AbortController();
      // Usar el timeout configurado o 5s por defecto
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT || 4000);
      
      // Intentamos un HEAD al endpoint de health para evitar redirecciones 302 a HTTP
      const response = await fetch(healthUrl, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store',
      }).catch(() => {
        return fetch(healthUrl, {
          method: 'GET',
          signal: controller.signal,
          cache: 'no-store',
        });
      });

      clearTimeout(timeoutId);
      
      // Si recibimos una respuesta del servidor (incluso 404 o 401), el servidor está AHÍ.
      // Solo falla si hay un Error de Red o Timeout.
      const isAvailable = response.status >= 200 && response.status < 500;
      isServerAvailableRef.current = isAvailable;
      setIsServerAvailable(isAvailable);
      return isAvailable;
    } catch (error: any) {
      console.warn('[Network] Servidor no responde en:', healthUrl, 'Error:', error.message);
      isServerAvailableRef.current = false;
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
    }, 30000); // 30 segundos: Equilibrio perfecto entre detección rápida y escalabilidad
    return () => clearInterval(interval);
  }, [isConnected]);

  const setForcedOffline = (forced: boolean) => {
    setIsForcedOffline(forced);
    if (!forced) {
      refreshServerStatus(true);
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
  const {isConnected, isForcedOffline, isServerAvailable} = useNetwork();
  
  // 1. Prioridad: Desconectado si el usuario lo forzó o no hay red física
  if (isForcedOffline || !isConnected) return false;
  
  // 2. Estado Online dependiente de si el servidor de la app responde
  // Ignoramos isInternetReachable porque en Android es muy poco fiable y a veces
  // se queda en 'false' aunque el WiFi ya funcione. Nuestro ping al servidor es la verdad absoluta.
  return isServerAvailable;
};

export default NetworkContext;
