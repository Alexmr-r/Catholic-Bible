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

interface NetworkContextType {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string | null;
  // Método para forzar re-check
  checkConnection: () => Promise<boolean>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({children}) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  const wasOffline = useRef(false);

  useEffect(() => {
    // Obtener estado inicial
    NetInfo.fetch().then(handleNetworkChange);

    // Suscribirse a cambios de conexión
    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);

    return () => {
      unsubscribe();
    };
  }, []);

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

  return (
    <NetworkContext.Provider
      value={{
        isConnected,
        isInternetReachable,
        connectionType,
        checkConnection,
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
  const {isConnected, isInternetReachable} = useNetwork();
  // Consideramos online solo si hay conexión Y internet es alcanzable
  // Si isInternetReachable es null, confiamos en isConnected
  return isConnected && (isInternetReachable !== false);
};

export default NetworkContext;
