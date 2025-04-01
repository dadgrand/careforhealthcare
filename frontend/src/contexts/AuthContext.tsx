import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useSnackbar } from 'notistack';

import { AuthTokens, TokenPayload, User, UserRole } from '../types';
import { authApi } from '../services/authService';

interface AuthContextProps {
  isAuthenticated: boolean;
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  getTokens: () => AuthTokens | null;
  updateUser: (userData: Partial<User>) => Promise<void>;
  updateTokens: (tokens: AuthTokens) => void;
}

const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  user: null,
  userRole: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  getTokens: () => null,
  updateUser: async () => {},
  updateTokens: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    // Проверка аутентификации при загрузке приложения
    const checkAuth = async () => {
      try {
        const tokens = getTokens();

        if (tokens) {
          // Проверка, не истек ли срок действия токена
          const decoded = jwtDecode<TokenPayload>(tokens.access);
          const currentTime = Date.now() / 1000;

          if (decoded.exp < currentTime) {
            // Токен истек, пробуем обновить
            await refreshToken();
          } else {
            // Токен действителен, получаем информацию о пользователе
            const { data } = await authApi.getProfile();
            setUser(data);
            setUserRole(data.role);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Ошибка аутентификации:', error);
        // Чистим токены в случае ошибки
        localStorage.removeItem('tokens');
        setIsAuthenticated(false);
        setUser(null);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const getTokens = (): AuthTokens | null => {
    const tokensString = localStorage.getItem('tokens');
    return tokensString ? JSON.parse(tokensString) : null;
  };

  const updateTokens = (tokens: AuthTokens) => {
    localStorage.setItem('tokens', JSON.stringify(tokens));
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const tokens = getTokens();
      if (!tokens || !tokens.refresh) {
        throw new Error('Refresh token not found');
      }

      const { data } = await authApi.refreshToken({ refresh: tokens.refresh });

      // Обновляем токены в localStorage
      updateTokens({
        ...tokens,
        access: data.access,
      });

      // Получаем информацию о пользователе с новым токеном
      const userResponse = await authApi.getProfile();
      setUser(userResponse.data);
      setUserRole(userResponse.data.role);
      setIsAuthenticated(true);
    } catch (error) {
      // В случае ошибки обновления токена, выполняем выход
      console.error('Error refreshing token:', error);
      localStorage.removeItem('tokens');
      setIsAuthenticated(false);
      setUser(null);
      setUserRole(null);
      navigate('/login');
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const { data } = await authApi.login({ email, password });

      // Сохраняем токены
      updateTokens(data);

      // Получаем информацию о пользователе
      const userResponse = await authApi.getProfile();
      setUser(userResponse.data);
      setUserRole(userResponse.data.role);
      setIsAuthenticated(true);

      enqueueSnackbar('Вход выполнен успешно', { variant: 'success' });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Ошибка входа:', error);
      const errorMessage = error.response?.data?.detail || 'Ошибка при входе в систему';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Чистим токены и состояние
      localStorage.removeItem('tokens');
      setIsAuthenticated(false);
      setUser(null);
      setUserRole(null);

      enqueueSnackbar('Выход выполнен успешно', { variant: 'success' });
      navigate('/login');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      enqueueSnackbar('Ошибка при выходе из системы', { variant: 'error' });
    }
  };

  const register = async (userData: any): Promise<void> => {
    try {
      await authApi.register(userData);
      enqueueSnackbar('Регистрация выполнена успешно. Теперь вы можете войти в систему.', { variant: 'success' });
      navigate('/login');
    } catch (error: any) {
      console.error('Ошибка регистрации:', error);
      const errorMessage = error.response?.data?.detail || 'Ошибка при регистрации';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      throw error;
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    try {
      if (!user) throw new Error('User not found');

      const { data } = await authApi.updateProfile(user.id, userData);
      setUser(data);
      enqueueSnackbar('Профиль обновлен успешно', { variant: 'success' });
    } catch (error: any) {
      console.error('Ошибка обновления профиля:', error);
      const errorMessage = error.response?.data?.detail || 'Ошибка при обновлении профиля';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        userRole,
        loading,
        login,
        logout,
        register,
        getTokens,
        updateUser,
        updateTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};