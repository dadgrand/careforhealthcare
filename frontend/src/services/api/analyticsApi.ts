import axios from 'axios';
import {
  AnalyticsDateParams,
  DashboardData,
  DepartmentStatistics,
  UserStatistics,
  FileStatistics,
  TestingStatistics,
} from '../../types/analytics';
import { API_BASE_URL } from '../../config/constants';

// API-клиент для модуля аналитики
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/analytics`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик для добавления токена аутентификации
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Преобразование параметров даты в query-параметры
 */
const getDateQueryParams = (params: AnalyticsDateParams) => {
  const queryParams: Record<string, string> = {};

  if (params.dateRange) {
    queryParams.date_range = params.dateRange;
  }

  if (params.startDate) {
    queryParams.start_date = params.startDate;
  }

  if (params.endDate) {
    queryParams.end_date = params.endDate;
  }

  return queryParams;
};

/**
 * API-методы для модуля аналитики
 */
export const analyticsApi = {
  /**
   * Получение данных для дашборда
   */
  async getDashboardData(params: AnalyticsDateParams): Promise<DashboardData> {
    const response = await apiClient.get('/dashboard', {
      params: getDateQueryParams(params),
    });
    return response.data;
  },

  /**
   * Получение статистики по отделениям
   */
  async getDepartmentStatistics(params: AnalyticsDateParams): Promise<DepartmentStatistics[]> {
    const response = await apiClient.get('/departments', {
      params: getDateQueryParams(params),
    });
    return response.data;
  },

  /**
   * Получение статистики по пользователям
   */
  async getUserStatistics(params: AnalyticsDateParams): Promise<UserStatistics> {
    const response = await apiClient.get('/users', {
      params: getDateQueryParams(params),
    });
    return response.data;
  },

  /**
   * Получение статистики по файлам
   */
  async getFileStatistics(params: AnalyticsDateParams): Promise<FileStatistics> {
    const response = await apiClient.get('/files', {
      params: getDateQueryParams(params),
    });
    return response.data;
  },

  /**
   * Получение статистики по тестированию
   */
  async getTestingStatistics(params: AnalyticsDateParams): Promise<TestingStatistics> {
    const response = await apiClient.get('/testing', {
      params: getDateQueryParams(params),
    });
    return response.data;
  },

  /**
   * Экспорт данных аналитики
   */
  async exportAnalyticsData(params: AnalyticsDateParams): Promise<ArrayBuffer> {
    const response = await apiClient.get('/export', {
      params: getDateQueryParams(params),
      responseType: 'arraybuffer',
    });
    return response.data;
  },

  /**
   * Получение подробной статистики по конкретному отделению
   */
  async getDepartmentDetails(departmentId: number, params: AnalyticsDateParams): Promise<any> {
    const response = await apiClient.get(`/departments/${departmentId}`, {
      params: getDateQueryParams(params),
    });
    return response.data;
  },

  /**
   * Получение подробной статистики по конкретному пользователю
   */
  async getUserDetails(userId: number, params: AnalyticsDateParams): Promise<any> {
    const response = await apiClient.get(`/users/${userId}`, {
      params: getDateQueryParams(params),
    });
    return response.data;
  },
};