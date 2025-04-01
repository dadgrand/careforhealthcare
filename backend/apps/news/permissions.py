from rest_framework import permissions


class IsNewsAuthorOrReadOnly(permissions.BasePermission):
    """
    Разрешение, позволяющее только авторам статьи изменять её.
    """

    def has_object_permission(self, request, view, obj):
        # Разрешены безопасные методы (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return True

        # Проверяем, является ли пользователь автором или администратором
        return obj.author == request.user or request.user.is_superuser


class IsCommentAuthorOrReadOnly(permissions.BasePermission):
    """
    Разрешение, позволяющее только авторам комментария изменять его.
    """

    def has_object_permission(self, request, view, obj):
        # Разрешены безопасные методы (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return True

        # Проверяем, является ли пользователь автором или администратором
        return obj.author == request.user or request.user.is_superuser