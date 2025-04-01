from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from rest_framework import viewsets, generics, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Department, Specialization, UserProfile, LoginHistory
from .serializers import (
    UserSerializer, DepartmentSerializer, SpecializationSerializer,
    UserProfileSerializer, RegisterSerializer, ChangePasswordSerializer,
    CustomTokenObtainPairSerializer, LoginHistorySerializer
)
from .permissions import IsOwnerOrAdmin, IsAdminUser

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """Кастомное представление для получения JWT токенов."""

    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """Представление для регистрации пользователя."""

    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class UserViewSet(viewsets.ModelViewSet):
    """Представление для работы с пользователями."""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        """Фильтрация пользователей."""
        queryset = User.objects.all()

        # Фильтрация по роли
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)

        # Фильтрация по отделению
        department = self.request.query_params.get('department')
        if department:
            queryset = queryset.filter(department=department)

        # Фильтрация по специализации
        specialization = self.request.query_params.get('specialization')
        if specialization:
            queryset = queryset.filter(specialization=specialization)

        # Поиск по имени или email
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(first_name__icontains=search) |
                models.Q(last_name__icontains=search) |
                models.Q(email__icontains=search)
            )

        return queryset

    def get_permissions(self):
        """Определение прав доступа."""
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['create', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Получение информации о текущем пользователе."""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def change_password(self, request, pk=None):
        """Изменение пароля пользователя."""
        user = self.get_object()
        serializer = ChangePasswordSerializer(data=request.data)

        if serializer.is_valid():
            # Проверяем старый пароль
            if not user.check_password(serializer.data.get('old_password')):
                return Response(
                    {'old_password': [_('Неверный пароль.')]},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Устанавливаем новый пароль
            user.set_password(serializer.data.get('new_password'))
            user.save()
            return Response(
                {'message': _('Пароль успешно изменен.')},
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def login_history(self, request):
        """Получение истории входов текущего пользователя."""
        if request.user.is_superuser:
            # Администраторы видят историю всех пользователей
            history = LoginHistory.objects.all().order_by('-login_time')
        else:
            # Обычные пользователи видят только свою историю
            history = LoginHistory.objects.filter(user=request.user).order_by('-login_time')

        page = self.paginate_queryset(history)
        if page is not None:
            serializer = LoginHistorySerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = LoginHistorySerializer(history, many=True)
        return Response(serializer.data)


class DepartmentViewSet(viewsets.ModelViewSet):
    """Представление для работы с отделениями."""

    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        """Определение прав доступа."""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]


class SpecializationViewSet(viewsets.ModelViewSet):
    """Представление для работы со специализациями."""

    queryset = Specialization.objects.all()
    serializer_class = SpecializationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        """Определение прав доступа."""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]


class ProfileViewSet(viewsets.ModelViewSet):
    """Представление для работы с профилями пользователей."""

    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        """Фильтрация профилей."""
        if self.request.user.is_superuser:
            return UserProfile.objects.all()
        return UserProfile.objects.filter(user=self.request.user)