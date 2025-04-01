import { apiClient } from './apiClient';
import {
  File,
  FileCategory,
  FileAccess,
  FileVerification,
  FileVersion,
  FileDownloadHistory,
  AccessLevel,
  PermissionType,
  VerificationStatus,
} from '../types';

// Класс для работы с API файлового менеджера
class FileApi {
  private readonly baseUrl = '/files';

  // Получение списка категорий файлов
  async getCategories() {
    return apiClient.get<FileCategory[]>(`${this.baseUrl}/categories/`);
  }

  // Получение категории по ID
  async getCategory(categoryId: number) {
    return apiClient.get<FileCategory>(`${this.baseUrl}/categories/${categoryId}/`);
  }

  // Создание новой категории
  async createCategory(data: Partial<FileCategory>) {
    return apiClient.post<FileCategory>(`${this.baseUrl}/categories/`, data);
  }

  // Обновление категории
  async updateCategory(categoryId: number, data: Partial<FileCategory>) {
    return apiClient.patch<FileCategory>(`${this.baseUrl}/categories/${categoryId}/`, data);
  }

  // Удаление категории
  async deleteCategory(categoryId: number) {
    return apiClient.delete<void>(`${this.baseUrl}/categories/${categoryId}/`);
  }

  // Получение списка файлов
  async getFiles(params?: any) {
    return apiClient.get<File[]>(`${this.baseUrl}/files/`, { params });
  }

  // Получение файла по ID
  async getFile(fileId: string) {
    return apiClient.get<File>(`${this.baseUrl}/files/${fileId}/`);
  }

  // Загрузка нового файла
  async uploadFile(data: FormData) {
    return apiClient.post<File>(`${this.baseUrl}/files/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Обновление информации о файле
  async updateFile(fileId: string, data: Partial<File>) {
    return apiClient.patch<File>(`${this.baseUrl}/files/${fileId}/`, data);
  }

  // Удаление файла
  async deleteFile(fileId: string) {
    return apiClient.delete<void>(`${this.baseUrl}/files/${fileId}/`);
  }

  // Скачивание файла
  async downloadFile(fileId: string) {
    return apiClient.get<Blob>(`${this.baseUrl}/files/${fileId}/download/`, {
      responseType: 'blob',
    });
  }

  // Запрос на верификацию файла
  async requestVerification(fileId: string, data: { comment?: string }) {
    return apiClient.post<FileVerification>(`${this.baseUrl}/files/${fileId}/request_verification/`, data);
  }

  // Управление доступом к файлу
  // Получение прав доступа к файлу
  async getFileAccess(fileId: string) {
    return apiClient.get<FileAccess[]>(`${this.baseUrl}/access/`, { params: { file: fileId } });
  }

  // Предоставление доступа к файлу
  async grantAccess(data: { file: string; user: string; permission_type: PermissionType }) {
    return apiClient.post<FileAccess>(`${this.baseUrl}/access/`, data);
  }

  // Изменение прав доступа
  async updateAccess(accessId: number, data: { permission_type: PermissionType }) {
    return apiClient.patch<FileAccess>(`${this.baseUrl}/access/${accessId}/`, data);
  }

  // Отзыв доступа
  async revokeAccess(accessId: number) {
    return apiClient.delete<void>(`${this.baseUrl}/access/${accessId}/`);
  }

  // Работа с верификациями файлов
  // Получение верификаций
  async getVerifications(params?: any) {
    return apiClient.get<FileVerification[]>(`${this.baseUrl}/verifications/`, { params });
  }

  // Получение верификации по ID
  async getVerification(verificationId: number) {
    return apiClient.get<FileVerification>(`${this.baseUrl}/verifications/${verificationId}/`);
  }

  // Обновление статуса верификации
  async updateVerification(verificationId: number, data: { status: VerificationStatus; comment?: string }) {
    return apiClient.patch<FileVerification>(`${this.baseUrl}/verifications/${verificationId}/`, data);
  }

  // Работа с версиями файлов
  // Получение версий файла
  async getFileVersions(fileId: string) {
    return apiClient.get<FileVersion[]>(`${this.baseUrl}/versions/`, { params: { file: fileId } });
  }

  // Получение версии по ID
  async getFileVersion(versionId: string) {
    return apiClient.get<FileVersion>(`${this.baseUrl}/versions/${versionId}/`);
  }

  // Создание новой версии файла
  async createFileVersion(data: FormData) {
    return apiClient.post<FileVersion>(`${this.baseUrl}/versions/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Скачивание версии файла
  async downloadFileVersion(fileId: string, versionId: string) {
    return apiClient.get<Blob>(`${this.baseUrl}/files/${fileId}/download_version/`, {
      params: { version_id: versionId },
      responseType: 'blob',
    });
  }

  // Получение истории скачиваний
  async getDownloadHistory(params?: any) {
    return apiClient.get<FileDownloadHistory[]>(`${this.baseUrl}/downloads/`, { params });
  }
}

export const fileApi = new FileApi();