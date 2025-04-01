from rest_framework import permissions


class IsTestAuthorOrReadOnly(permissions.BasePermission):
    """
    Разрешение, позволяющее только авторам теста изменять его.
    """

    def has_object_permission(self, request, view, obj):
        # Разрешены безопасные методы (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return True

        # Проверяем, является ли пользователь автором теста или администратором
        return obj.author == request.user or request.user.is_superuser


class IsQuestionAuthorOrReadOnly(permissions.BasePermission):
    """
    Разрешение, позволяющее только авторам вопроса (или теста) изменять его.
    """

    def has_object_permission(self, request, view, obj):
        # Разрешены безопасные методы (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return True

        # Проверяем, является ли пользователь автором теста или администратором
        return obj.test.author == request.user or request.user.is_superuser


class IsTestAssignmentCreatorOrReadOnly(permissions.BasePermission):
    """
    Разрешение, позволяющее только создателям назначения изменять его.
    """

    def has_object_permission(self, request, view, obj):
        # Разрешены безопасные методы (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            # Пользователь, которому назначен тест, также может просматривать назначение
            if obj.user == request.user:
                return True

        # Проверяем, является ли пользователь создателем назначения или администратором
        return obj.assigned_by == request.user or request.user.is_superuser