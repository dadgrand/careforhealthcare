import { apiClient } from './apiClient';
import { AuthTokens, User, UserRole } from '../types';

// Интерфейсы для запросов аутентификации
interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
  patronymic?: string;
  role?: UserRole;
}

interface RefreshTokenRequest {
  refresh: string;
}

interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  new_password2: string;
}

// Класс для работы с API аутентификации
class AuthApi {
  private readonly baseUrl = '/accounts';

  // Вход в систему
  async login(data: LoginRequest) {
    return apiClient.post<AuthTokens>(`${this.baseUrl}/token/`, data);
  }

  // Регистрация нового пользователя
  async register(data: RegisterRequest) {
    return apiClient.post<User>(`${this.baseUrl}/register/`, data);
  }

  // Обновление токена доступа
  async refreshToken(data: RefreshTokenRequest) {
    return apiClient.post<{ access: string }>(`${this.baseUrl}/token/refresh/`, data);
  }

  // Проверка токена
  async verifyToken(token: string) {
    return apiClient.post<{ status: string }>(`${this.baseUrl}/token/verify/`, { token });
  }

  // Получение профиля текущего пользователя
  async getProfile() {
    return apiClient.get<User>(`${this.baseUrl}/users/me/`);
  }

  // Обновление профиля пользователя
  async updateProfile(userId: string, data: Partial<User>) {
    return apiClient.patch<User>(`${this.baseUrl}/users/${userId}/`, data);
  }

  // Смена пароля пользователя
  async changePassword(userId: string, data: ChangePasswordRequest) {
    return apiClient.post<{ message: string }>(`${this.baseUrl}/users/${userId}/change_password/`, data);
  }

  // Получение списка пользователей (для администраторов)
  async getUsers(params?: any) {
    return apiClient.get<User[]>(`${this.baseUrl}/users/`, { params });
  }

  // Получение данных конкретного пользователя
  async getUser(userId: string) {
    return apiClient.get<User>(`${this.baseUrl}/users/${userId}/`);
  }

  // Создание нового пользователя (для администраторов)
  async createUser(data: Partial<User>) {
    return apiClient.post<User>(`${this.baseUrl}/users/`, data);
  }

  // Обновление пользователя (для администраторов)
  async updateUser(userId: string, data: Partial<User>) {
    return apiClient.patch<User>(`${this.baseUrl}/users/${userId}/`, data);
  }

  // Удаление пользователя (для администраторов)
  async deleteUser(userId: string) {
    return apiClient.delete<void>(`${this.baseUrl}/users/${userId}/`);
  }

  // Получение истории входов
  async getLoginHistory(params?: any) {
    return apiClient.get<any[]>(`${this.baseUrl}/users/login_history/`, { params });
  }
}

export const authApi = new AuthApi();