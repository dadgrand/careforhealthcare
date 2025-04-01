from django.db.models import Q
from django.http import FileResponse, Http404
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    FileCategory, File, FileAccess, FileVerification,
    FileVersion, FileDownloadHistory
)
from .serializers import (
    FileCategorySerializer, FileSerializer, FileAccessSerializer,
    FileVerificationSerializer, FileVersionSerializer,
    FileDownloadHistorySerializer
)
from .permissions import (
    IsFileOwner, HasFileAccess, CanVerifyFile
)


class FileCategoryViewSet(viewsets.ModelViewSet):
    """Представление для работы с категориями файлов."""

    queryset = FileCategory.objects.all()
    serializer_class = FileCategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        """Определение прав доступа."""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]


class FileViewSet(viewsets.ModelViewSet):
    """Представление для работы с файлами."""

    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Фильтрация файлов на основе прав доступа."""
        user = self.request.user

        # Администраторы видят все файлы
        if user.is_superuser:
            queryset = File.objects.all()
        else:
            # Пользователи видят:
            # 1. Публичные файлы
            # 2. Свои файлы
            # 3. Файлы с разрешением на просмотр
            queryset = File.objects.filter(
                Q(access_level='public') |
                Q(owner=user) |
                Q(access_rights__user=user, access_rights__permission_type='view')
            ).distinct()

        # Фильтрация по категории
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)

        # Фильтрация по типу файла
        file_type = self.request.query_params.get('file_type')
        if file_type:
            queryset = queryset.filter(file_type=file_type)

        # Фильтрация по уровню доступа
        access_level = self.request.query_params.get('access_level')
        if access_level:
            queryset = queryset.filter(access_level=access_level)

        # Поиск по названию или описанию
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search)
            )

        return queryset

    def get_permissions(self):
        """Определение прав доступа."""
        if self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsFileOwner]
        elif self.action in ['download', 'download_version']:
            permission_classes = [permissions.IsAuthenticated, HasFileAccess]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """Установка владельца файла."""
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Скачивание файла."""
        file_obj = self.get_object()

        # Запись в историю скачиваний
        FileDownloadHistory.objects.create(
            file=file_obj,
            user=request.user,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )

        # Возвращение файла
        response = FileResponse(file_obj.file)
        response['Content-Disposition'] = f'attachment; filename="{file_obj.file.name.split("/")[-1]}"'
        return response

    @action(detail=True, methods=['get'])
    def download_version(self, request, pk=None):
        """Скачивание конкретной версии файла."""
        file_obj = self.get_object()
        version_id = request.query_params.get('version_id')

        try:
            version = FileVersion.objects.get(id=version_id, file=file_obj)
        except FileVersion.DoesNotExist:
            raise Http404(_("Версия файла не найдена"))

        # Запись в историю скачиваний
        FileDownloadHistory.objects.create(
            file=file_obj,
            user=request.user,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )

        # Возвращение файла
        response = FileResponse(version.file_content)
        response['Content-Disposition'] = f'attachment; filename="{version.file_content.name.split("/")[-1]}"'
        return response

    @action(detail=True, methods=['post'])
    def request_verification(self, request, pk=None):
        """Запрос на верификацию файла."""
        file_obj = self.get_object()

        # Проверка, есть ли уже активные запросы на верификацию
        active_request = FileVerification.objects.filter(
            file=file_obj,
            status=FileVerification.VerificationStatus.PENDING
        ).exists()

        if active_request:
            return Response(
                {'error': _("Для этого файла уже существует запрос на верификацию")},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Создание запроса на верификацию
        verification = FileVerification.objects.create(
            file=file_obj,
            requested_by=request.user,
            comment=request.data.get('comment', '')
        )

        serializer = FileVerificationSerializer(verification)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class FileAccessViewSet(viewsets.ModelViewSet):
    """Представление для работы с доступами к файлам."""

    queryset = FileAccess.objects.all()
    serializer_class = FileAccessSerializer
    permission_classes = [permissions.IsAuthenticated, IsFileOwner]

    def get_queryset(self):
        """Фильтрация доступов к файлам."""
        user = self.request.user

        # Администраторы видят все доступы
        if user.is_superuser:
            queryset = FileAccess.objects.all()
        else:
            # Пользователи видят доступы к своим файлам
            queryset = FileAccess.objects.filter(file__owner=user)

        # Фильтрация по файлу
        file_id = self.request.query_params.get('file')
        if file_id:
            queryset = queryset.filter(file__id=file_id)

        # Фильтрация по пользователю
        user_id = self.request.query_params.get('user')
        if user_id:
            queryset = queryset.filter(user__id=user_id)

        return queryset

    def get_permissions(self):
        """Определение прав доступа."""
        if self.action == 'list':
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated, IsFileOwner]
        return [permission() for permission in permission_classes]


class FileVerificationViewSet(viewsets.ModelViewSet):
    """Представление для работы с верификациями файлов."""

    queryset = FileVerification.objects.all()
    serializer_class = FileVerificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Фильтрация верификаций файлов."""
        user = self.request.user

        # Администраторы видят все верификации
        if user.is_superuser:
            queryset = FileVerification.objects.all()
        else:
            # Пользователи видят:
            # 1. Верификации своих файлов
            # 2. Верификации, запрошенные ими
            queryset = FileVerification.objects.filter(
                Q(file__owner=user) |
                Q(requested_by=user)
            ).distinct()

        # Фильтрация по файлу
        file_id = self.request.query_params.get('file')
        if file_id:
            queryset = queryset.filter(file__id=file_id)

        # Фильтрация по статусу
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset

    def get_permissions(self):
        """Определение прав доступа."""
        if self.action in ['update', 'partial_update']:
            permission_classes = [permissions.IsAuthenticated, CanVerifyFile]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_update(self, serializer):
        """Обновление статуса верификации."""
        verification = serializer.instance
        status_value = serializer.validated_data.get('status')

        # Если меняется статус на "Утверждено" или "Отклонено"
        if status_value in [FileVerification.VerificationStatus.APPROVED, FileVerification.VerificationStatus.REJECTED]:
            serializer.save(verified_by=self.request.user, verified_at=timezone.now())
        else:
            serializer.save()


class FileVersionViewSet(viewsets.ModelViewSet):
    """Представление для работы с версиями файлов."""

    queryset = FileVersion.objects.all()
    serializer_class = FileVersionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Фильтрация версий файлов."""
        user = self.request.user

        # Администраторы видят все версии
        if user.is_superuser:
            queryset = FileVersion.objects.all()
        else:
            # Пользователи видят версии файлов, к которым у них есть доступ
            queryset = FileVersion.objects.filter(
                Q(file__owner=user) |
                Q(file__access_level='public') |
                Q(file__access_rights__user=user, file__access_rights__permission_type='view')
            ).distinct()

        # Фильтрация по файлу
        file_id = self.request.query_params.get('file')
        if file_id:
            queryset = queryset.filter(file__id=file_id)

        return queryset

    def get_permissions(self):
        """Определение прав доступа."""
        if self.action == 'create':
            permission_classes = [permissions.IsAuthenticated, HasFileAccess]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, IsFileOwner]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """Установка пользователя, создавшего версию."""
        serializer.save(created_by=self.request.user)


class FileDownloadHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Представление для просмотра истории скачиваний файлов."""

    queryset = FileDownloadHistory.objects.all()
    serializer_class = FileDownloadHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Фильтрация истории скачиваний."""
        user = self.request.user

        # Администраторы видят всю историю
        if user.is_superuser:
            queryset = FileDownloadHistory.objects.all()
        else:
            # Пользователи видят историю скачиваний своих файлов
            queryset = FileDownloadHistory.objects.filter(file__owner=user)

        # Фильтрация по файлу
        file_id = self.request.query_params.get('file')
        if file_id:
            queryset = queryset.filter(file__id=file_id)

        # Фильтрация по пользователю
        user_id = self.request.query_params.get('user')
        if user_id and user.is_superuser:  # Только администраторы могут фильтровать по пользователю
            queryset = queryset.filter(user__id=user_id)

        # Фильтрация по дате
        date_from = self.request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(downloaded_at__gte=date_from)

        date_to = self.request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(downloaded_at__lte=date_to)

        return queryset