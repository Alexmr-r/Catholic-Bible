import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, User, LoginRequest, RegisterRequest, AuthResponse } from '../services/auth.service';

// ========== Types ==========

interface AuthContextType {
  user: User | null;
  profilePhoto: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<AuthResponse>;
  register: (data: RegisterRequest) => Promise<AuthResponse>;
  loginWithGoogle: (idToken: string) => Promise<AuthResponse>;
  loginWithApple: (identityToken: string, fullName?: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateProfilePhoto: (uri: string) => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

// ========== Context ==========

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ========== Provider ==========

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuario al iniciar la app
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      // 1. Intentar cargar el usuario de la caché local primero (Persistencia Inmediata)
      const savedUser = await authService.getSavedUser();
      const token = await AsyncStorage.getItem('accessToken');

      if (savedUser && token) {
        // Establecemos el usuario localmente para que la navegación sea instantánea
        setUser(savedUser);
        
        // Cargar foto de perfil cacheada
        try {
          const cachedPhoto = await AsyncStorage.getItem(`@biblia_profile_photo_${savedUser.id}`);
          if (cachedPhoto) setProfilePhoto(cachedPhoto);
        } catch (e) {
          console.warn('Error loading cached photo', e);
        }
        
        // --- 🚀 OPTIMIZACIÓN: Ocultar Splash si ya tenemos usuario local ---
        setIsLoading(false);
        
        // 2. Verificar en segundo plano si el token sigue siendo válido
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser); // Actualizamos con datos frescos si es posible
        } catch (error: any) {
          console.warn('Background auth check failed:', error.message);
          
          // Solo si es un error de autenticación (401) limpiamos la sesión
          if (error.status === 401) {
            try {
              const response = await authService.refreshToken();
              setUser(response.user);
            } catch (refreshError) {
              await authService.clearTokens();
              setUser(null);
            }
          }
          // Nota: Si es error de RED (500, timeout), mantenemos al usuario local
        }
      } else {
        setUser(null);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setUser(null);
      setIsLoading(false);
    }
  };

  const login = async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await authService.login(data);
    setUser(response.user);
    return response;
  };

  const register = async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await authService.register(data);
    setUser(response.user);
    return response;
  };

  const loginWithGoogle = async (idToken: string): Promise<AuthResponse> => {
    const response = await authService.loginWithGoogle(idToken);
    setUser(response.user);
    return response;
  };

  const loginWithApple = async (identityToken: string, fullName?: string): Promise<AuthResponse> => {
    const response = await authService.loginWithApple(identityToken, fullName);
    setUser(response.user);
    return response;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setProfilePhoto(null);
    }
  };

  const refreshAuth = async () => {
    await checkAuthState();
  };

  const updateProfilePhoto = async (uri: string) => {
    setProfilePhoto(uri);
    if (user) {
      await AsyncStorage.setItem(`@biblia_profile_photo_${user.id}`, uri);
    }
  };

  const value: AuthContextType = {
    user,
    profilePhoto,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    loginWithGoogle,
    loginWithApple,
    logout,
    refreshAuth,
    updateProfilePhoto,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ========== Hook ==========

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
