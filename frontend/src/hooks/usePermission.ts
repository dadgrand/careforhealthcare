import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

/**
 * Хук для управления правами доступа пользователя
 */
export const usePermission = () => {
  const { user, userRole, isAuthenticated } = useAuth();

  /**
   * Проверяет, имеет ли пользователь одну из указанных ролей
   * @param roles Массив ролей для проверки
   * @returns true, если у пользователя есть хотя бы одна из указанных ролей
   */
  const hasRole = (roles: UserRole[]): boolean => {
    if (!isAuthenticated || !userRole) return false;
    return roles.includes(userRole);
  };

  /**
   * Проверяет, является ли пользователь администратором
   * @returns true, если пользователь имеет роль администратора
   */
  const isAdmin = (): boolean => {
    return hasRole(['admin']);
  };

  /**
   * Проверяет, является ли пользователь врачом
   * @returns true, если пользователь имеет роль врача
   */
  const isDoctor = (): boolean => {
    return hasRole(['doctor']);
  };

  /**
   * Проверяет, является ли пользователь медсестрой
   * @returns true, если пользователь имеет роль медсестры
   */
  const isNurse = (): boolean => {
    return hasRole(['nurse']);
  };

  /**
   * Проверяет, является ли пользователь менеджером
   * @returns true, если пользователь имеет роль менеджера
   */
  const isManager = (): boolean => {
    return hasRole(['manager']);
  };

  /**
   * Проверяет, является ли пользователь персоналом
   * @returns true, если пользователь имеет роль персонала
   */
  const isStaff = (): boolean => {
    return hasRole(['staff']);
  };

  /**
   * Проверяет, является ли пользователь админом или менеджером
   * @returns true, если пользователь имеет роль админа или менеджера
   */
  const isAdminOrManager = (): boolean => {
    return hasRole(['admin', 'manager']);
  };

  /**
   * Проверяет, является ли пользователь медицинским работником
   * @returns true, если пользователь имеет роль врача или медсестры
   */
  const isMedicalStaff = (): boolean => {
    return hasRole(['doctor', 'nurse']);
  };

  /**
   * Проверяет, является ли пользователь владельцем ресурса
   * @param resourceOwnerId ID владельца ресурса
   * @returns true, если пользователь является владельцем ресурса
   */
  const isOwner = (resourceOwnerId: string): boolean => {
    if (!isAuthenticated || !user) return false;
    return user.id === resourceOwnerId;
  };

  /**
   * Проверяет, может ли пользователь создавать ресурс
   * @param resourceType Тип ресурса
   * @returns true, если пользователь может создавать ресурс
   */
  const canCreate = (resourceType: string): boolean => {
    if (!isAuthenticated) return false;

    switch (resourceType) {
      case 'user':
        return isAdmin();
      case 'department':
        return isAdminOrManager();
      case 'specialization':
        return isAdminOrManager();
      case 'file':
        return true; // Все аутентифицированные пользователи могут загружать файлы
      case 'news':
        return isAdminOrManager();
      case 'test':
        return isAdminOrManager() || isDoctor();
      case 'analytics':
        return isAdmin();
      default:
        return false;
    }
  };

  /**
   * Проверяет, может ли пользователь редактировать ресурс
   * @param resourceType Тип ресурса
   * @param resourceOwnerId ID владельца ресурса
   * @returns true, если пользователь может редактировать ресурс
   */
  const canEdit = (resourceType: string, resourceOwnerId?: string): boolean => {
    if (!isAuthenticated) return false;

    // Администратор может редактировать всё
    if (isAdmin()) return true;

    // Менеджер может редактировать некоторые типы ресурсов
    if (isManager()) {
      switch (resourceType) {
        case 'department':
        case 'specialization':
        case 'news':
        case 'test':
          return true;
        default:
          // Для остальных ресурсов - только если является владельцем
          return resourceOwnerId ? isOwner(resourceOwnerId) : false;
      }
    }

    // Доктор может редактировать свои тесты и файлы
    if (isDoctor()) {
      if (resourceType === 'test' || resourceType === 'file') {
        return resourceOwnerId ? isOwner(resourceOwnerId) : false;
      }
      return false;
    }

    // Остальные пользователи могут редактировать только свои ресурсы
    return resourceOwnerId ? isOwner(resourceOwnerId) : false;
  };

  /**
   * Проверяет, может ли пользователь удалять ресурс
   * @param resourceType Тип ресурса
   * @param resourceOwnerId ID владельца ресурса
   * @returns true, если пользователь может удалять ресурс
   */
  const canDelete = (resourceType: string, resourceOwnerId?: string): boolean => {
    if (!isAuthenticated) return false;

    // Администратор может удалять всё
    if (isAdmin()) return true;

    // Менеджер может удалять некоторые типы ресурсов
    if (isManager()) {
      switch (resourceType) {
        case 'news':
        case 'test':
          return true;
        default:
          // Для остальных ресурсов - только если является владельцем
          return resourceOwnerId ? isOwner(resourceOwnerId) : false;
      }
    }

    // Остальные пользователи могут удалять только свои ресурсы
    return resourceOwnerId ? isOwner(resourceOwnerId) : false;
  };

  /**
   * Проверяет, может ли пользователь просматривать ресурс
   * @param resourceType Тип ресурса
   * @param isInternal Является ли ресурс внутренним (только для сотрудников)
   * @returns true, если пользователь может просматривать ресурс
   */
  const canView = (resourceType: string, isInternal: boolean = false): boolean => {
    // Анонимные пользователи могут просматривать только публичные ресурсы
    if (!isAuthenticated) {
      if (resourceType === 'news' && !isInternal) {
        return true;
      }
      return false;
    }

    // Авторизованные пользователи могут просматривать большинство ресурсов
    if (isInternal) {
      // Внутренние ресурсы доступны только сотрудникам
      return true;
    }

    // Аналитика доступна только администраторам и менеджерам
    if (resourceType === 'analytics') {
      return isAdminOrManager();
    }

    // Все остальные ресурсы доступны авторизованным пользователям
    return true;
  };

  return {
    hasRole,
    isAdmin,
    isDoctor,
    isNurse,
    isManager,
    isStaff,
    isAdminOrManager,
    isMedicalStaff,
    isOwner,
    canCreate,
    canEdit,
    canDelete,
    canView,
  };
};