import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { AuthTokens, TokenPayload } from '../types';

// Константы для API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
const AUTH_TOKEN_KEY = 'tokens';

// Создаем экземпляр axios с базовым URL
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 секунд таймаут
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Функция для обновления токена доступа
const refreshAccessToken = async (): Promise<string> => {
  try {
    const storedTokens = localStorage.getItem(AUTH_TOKEN_KEY);

    if (!storedTokens) {
      throw new Error('No refresh token available');
    }

    const tokens: AuthTokens = JSON.parse(storedTokens);

    const response = await axios.post(`${API_URL}/accounts/token/refresh/`, {
      refresh: tokens.refresh,
    });

    const newTokens: AuthTokens = {
      ...tokens,
      access: response.data.access,
    };

    localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(newTokens));

    return response.data.access;
  } catch (error) {
    // В случае ошибки очищаем локальное хранилище и перенаправляем на страницу входа
    localStorage.removeItem(AUTH_TOKEN_KEY);
    window.location.href = '/login';
    throw error;
  }
};

// Интерцептор для запросов
axiosInstance.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    const tokens = localStorage.getItem(AUTH_TOKEN_KEY);

    if (tokens) {
      const parsedTokens: AuthTokens = JSON.parse(tokens);

      // Проверяем, не истек ли срок действия токена
      try {
        const decoded = jwtDecode<TokenPayload>(parsedTokens.access);
        const currentTime = Date.now() / 1000;

        // Если токен истекает в ближайшие 5 минут, обновляем его
        if (decoded.exp < currentTime + 300) {
          const newAccessToken = await refreshAccessToken();
          if (config.headers) {
            config.headers.Authorization = `Bearer ${newAccessToken}`;
          }
        } else {
          if (config.headers) {
            config.headers.Authorization = `Bearer ${parsedTokens.access}`;
          }
        }
      } catch (error) {
        // Если с токеном проблемы, пробуем обновить его
        const newAccessToken = await refreshAccessToken();
        if (config.headers) {
          config.headers.Authorization = `Bearer ${newAccessToken}`;
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для ответов
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Если ошибка 401 (Unauthorized) и запрос не был повторен
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Пробуем обновить токен доступа
        const accessToken = await refreshAccessToken();

        // Обновляем заголовок авторизации и повторяем запрос
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Если не удалось обновить токен, перенаправляем на страницу входа
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Класс для работы с API
class ApiClient {
  // GET запрос
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return axiosInstance.get<T>(url, config);
  }

  // POST запрос
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return axiosInstance.post<T>(url, data, config);
  }

  // PUT запрос
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return axiosInstance.put<T>(url, data, config);
  }

  // PATCH запрос
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return axiosInstance.patch<T>(url, data, config);
  }

  // DELETE запрос
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return axiosInstance.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();