import os
import platform
import psutil
import django
from django.conf import settings
from django.db import connection
from django.db.models import Q
from django.utils.translation import gettext_lazy as _
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import SystemSetting, SystemBackup, SystemLog, SystemHealth
from .serializers import (
    SystemSettingSerializer, SystemBackupSerializer,
    SystemLogSerializer, SystemHealthSerializer
)
from .tasks import backup_database


class SystemSettingViewSet(viewsets.ModelViewSet):
    """Представление для работы с настройками системы."""

    queryset = SystemSetting.objects.all()
    serializer_class = SystemSettingSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get_queryset(self):
        """Фильтрация настроек системы."""
        user = self.request.user

        # Администраторы видят все настройки
        if user.is_superuser or user.is_staff:
            queryset = SystemSetting.objects.all()
        else:
            # Обычные пользователи видят только публичные настройки
            queryset = SystemSetting.objects.filter(is_public=True)

        # Фильтрация по ключу
        key = self.request.query_params.get('key')
        if key:
            queryset = queryset.filter(key__icontains=key)

        return queryset

    @action(detail=False, methods=['get'])
    def public(self, request):
        """Получение публичных настроек системы."""
        settings = SystemSetting.objects.filter(is_public=True)
        serializer = self.get_serializer(settings, many=True)
        return Response(serializer.data)


class SystemBackupViewSet(viewsets.ModelViewSet):
    """Представление для работы с резервными копиями системы."""

    queryset = SystemBackup.objects.all()
    serializer_class = SystemBackupSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get_queryset(self):
        """Фильтрация резервных копий системы."""
        queryset = SystemBackup.objects.all()

        # Фильтрация по типу
        backup_type = self.request.query_params.get('backup_type')
        if backup_type:
            queryset = queryset.filter(backup_type=backup_type)

        # Фильтрация по статусу
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Фильтрация по дате
        date_from = self.request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)

        date_to = self.request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)

        return queryset

    @action(detail=False, methods=['post'])
    def create_backup(self, request):
        """Создание резервной копии системы."""
        backup_type = request.data.get('backup_type', SystemBackup.BackupType.DATABASE)

        # Запуск задачи для создания резервной копии
        backup_database.delay(backup_type)

        return Response(
            {'message': _("Задача на создание резервной копии запущена.")},
            status=status.HTTP_202_ACCEPTED
        )


class SystemLogViewSet(viewsets.ModelViewSet):
    """Представление для работы с системными журналами."""

    queryset = SystemLog.objects.all()
    serializer_class = SystemLogSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get_queryset(self):
        """Фильтрация системных журналов."""
        queryset = SystemLog.objects.all()

        # Фильтрация по уровню
        level = self.request.query_params.get('level')
        if level:
            queryset = queryset.filter(level=level)

        # Фильтрация по модулю
        module = self.request.query_params.get('module')
        if module:
            queryset = queryset.filter(module__icontains=module)

        # Фильтрация по сообщению
        message = self.request.query_params.get('message')
        if message:
            queryset = queryset.filter(message__icontains=message)

        # Фильтрация по дате
        date_from = self.request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)

        date_to = self.request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)

        return queryset


class SystemHealthViewSet(viewsets.ModelViewSet):
    """Представление для работы со здоровьем системы."""

    queryset = SystemHealth.objects.all()
    serializer_class = SystemHealthSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get_queryset(self):
        """Фильтрация здоровья системы."""
        queryset = SystemHealth.objects.all()

        # Фильтрация по компоненту
        component = self.request.query_params.get('component')
        if component:
            queryset = queryset.filter(component__icontains=component)

        # Фильтрация по статусу
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset

    @action(detail=False, methods=['get'])
    def check(self, request):
        """Проверка здоровья системы."""
        # Проверка базы данных
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                db_status = SystemHealth.HealthStatus.HEALTHY
                db_details = "База данных работает нормально"
        except Exception as e:
            db_status = SystemHealth.HealthStatus.CRITICAL
            db_details = f"Ошибка базы данных: {str(e)}"

        # Проверка дискового пространства
        try:
            disk_usage = psutil.disk_usage(os.path.dirname(settings.BASE_DIR))
            disk_percent = disk_usage.percent

            if disk_percent > 90:
                disk_status = SystemHealth.HealthStatus.CRITICAL
                disk_details = f"Критически мало места на диске: {disk_percent}%"
            elif disk_percent > 70:
                disk_status = SystemHealth.HealthStatus.WARNING
                disk_details = f"Мало места на диске: {disk_percent}%"
            else:
                disk_status = SystemHealth.HealthStatus.HEALTHY
                disk_details = f"Достаточно места на диске: {disk_percent}%"
        except Exception as e:
            disk_status = SystemHealth.HealthStatus.WARNING
            disk_details = f"Ошибка при проверке диска: {str(e)}"

        # Проверка оперативной памяти
        try:
            memory = psutil.virtual_memory()
            memory_percent = memory.percent

            if memory_percent > 90:
                memory_status = SystemHealth.HealthStatus.CRITICAL
                memory_details = f"Критически мало оперативной памяти: {memory_percent}%"
            elif memory_percent > 70:
                memory_status = SystemHealth.HealthStatus.WARNING
                memory_details = f"Мало оперативной памяти: {memory_percent}%"
            else:
                memory_status = SystemHealth.HealthStatus.HEALTHY
                memory_details = f"Достаточно оперативной памяти: {memory_percent}%"
        except Exception as e:
            memory_status = SystemHealth.HealthStatus.WARNING
            memory_details = f"Ошибка при проверке оперативной памяти: {str(e)}"

        # Обновляем или создаем компоненты здоровья системы
        db_health, _ = SystemHealth.objects.update_or_create(
            component='database',
            defaults={
                'status': db_status,
                'details': db_details
            }
        )

        disk_health, _ = SystemHealth.objects.update_or_create(
            component='disk',
            defaults={
                'status': disk_status,
                'details': disk_details
            }
        )

        memory_health, _ = SystemHealth.objects.update_or_create(
            component='memory',
            defaults={
                'status': memory_status,
                'details': memory_details
            }
        )

        # Получаем список всех компонентов
        components = SystemHealth.objects.all()
        serializer = self.get_serializer(components, many=True)

        # Формируем общую информацию о системе
        system_info = {
            'python_version': platform.python_version(),
            'django_version': django.__version__,
            'os': platform.system(),
            'os_version': platform.version(),
            'cpu_count': psutil.cpu_count(),
            'cpu_usage': psutil.cpu_percent(interval=0.1),
            'memory_total': memory.total,
            'memory_available': memory.available,
            'disk_total': disk_usage.total,
            'disk_free': disk_usage.free
        }

        return Response({
            'components': serializer.data,
            'system_info': system_info,
            'overall_status': self._get_overall_status(components)
        })

    def _get_overall_status(self, components):
        """Получение общего статуса здоровья системы."""
        if any(component.status == SystemHealth.HealthStatus.CRITICAL for component in components):
            return SystemHealth.HealthStatus.CRITICAL
        elif any(component.status == SystemHealth.HealthStatus.WARNING for component in components):
            return SystemHealth.HealthStatus.WARNING
        else:
            return SystemHealth.HealthStatus.HEALTHY


class HealthCheckView(viewsets.ViewSet):
    """Представление для проверки здоровья системы."""

    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'])
    def ping(self, request):
        """Простая проверка доступности API."""
        return Response({'status': 'ok'})