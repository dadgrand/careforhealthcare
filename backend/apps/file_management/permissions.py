from rest_framework import permissions


class IsFileOwner(permissions.BasePermission):
    """
    Разрешение, проверяющее, является ли пользователь владельцем файла.
    """

    def has_object_permission(self, request, view, obj):
        # Проверяем, имеет ли файл атрибут owner
        if hasattr(obj, 'owner'):
            return obj.owner == request.user

        # Если объект - доступ к файлу, проверяем владельца файла
        if hasattr(obj, 'file'):
            return obj.file.owner == request.user

        return False


class HasFileAccess(permissions.BasePermission):
    """
    Разрешение, проверяющее, имеет ли пользователь доступ к файлу.
    """

    def has_object_permission(self, request, view, obj):
        user = request.user

        # Администраторы имеют доступ ко всем файлам
        if user.is_superuser:
            return True

        # Если объект - файл
        if hasattr(obj, 'access_level'):
            # Владелец файла имеет полный доступ
            if obj.owner == user:
                return True

            # Проверяем уровень доступа файла
            if obj.access_level == 'public':
                return True

            # Проверяем наличие права доступа
            if view.action == 'download':
                return obj.access_rights.filter(user=user, permission_type='view').exists()

            if view.action in ['update', 'partial_update']:
                return obj.access_rights.filter(user=user, permission_type='edit').exists()

            if view.action == 'destroy':
                return obj.access_rights.filter(user=user, permission_type='delete').exists()

            # Для просмотра достаточно любого права доступа
            return obj.access_rights.filter(user=user).exists()

        # Если объект - версия файла
        if hasattr(obj, 'file'):
            file_obj = obj.file

            # Владелец файла имеет полный доступ
            if file_obj.owner == user:
                return True

            # Проверяем уровень доступа файла
            if file_obj.access_level == 'public':
                return True

            # Для создания новой версии нужно право на редактирование
            if view.action == 'create':
                return file_obj.access_rights.filter(user=user, permission_type='edit').exists()

            # Для просмотра достаточно права на просмотр
            return file_obj.access_rights.filter(user=user, permission_type='view').exists()

        return False


class CanVerifyFile(permissions.BasePermission):
    """
    Разрешение, проверяющее, может ли пользователь верифицировать файл.
    """

    def has_object_permission(self, request, view, obj):
        user = request.user

        # Администраторы могут верифицировать все файлы
        if user.is_superuser:
            return True

        # Пользователь не может верифицировать свой собственный запрос
        if obj.requested_by == user:
            return False

        # Пользователь с ролью руководителя может верифицировать файлы
        if user.role == 'manager':
            return True

        # Пользователи с ролью врача могут верифицировать файлы своего отделения
        if user.role == 'doctor' and user.department:
            if obj.file.owner.department == user.department:
                return True

        return False