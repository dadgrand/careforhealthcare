import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _


class BaseModel(models.Model):
    """Базовая модель с общими полями."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(_('Дата создания'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Дата обновления'), auto_now=True)

    class Meta:
        abstract = True


class SystemSetting(models.Model):
    """Модель настроек системы."""

    key = models.CharField(_('Ключ'), max_length=100, unique=True)
    value = models.TextField(_('Значение'))
    description = models.TextField(_('Описание'), blank=True)
    is_public = models.BooleanField(_('Публичная'), default=False)
    created_at = models.DateTimeField(_('Дата создания'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Дата обновления'), auto_now=True)

    class Meta:
        verbose_name = _('Настройка системы')
        verbose_name_plural = _('Настройки системы')
        ordering = ['key']

    def __str__(self):
        return self.key


class SystemBackup(models.Model):
    """Модель резервного копирования системы."""

    class BackupType(models.TextChoices):
        FULL = 'full', _('Полное')
        DATABASE = 'database', _('База данных')
        FILES = 'files', _('Файлы')

    class BackupStatus(models.TextChoices):
        IN_PROGRESS = 'in_progress', _('В процессе')
        COMPLETED = 'completed', _('Завершено')
        FAILED = 'failed', _('Ошибка')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    backup_type = models.CharField(
        _('Тип резервной копии'),
        max_length=20,
        choices=BackupType.choices,
        default=BackupType.FULL
    )
    status = models.CharField(
        _('Статус'),
        max_length=20,
        choices=BackupStatus.choices,
        default=BackupStatus.IN_PROGRESS
    )
    backup_file = models.FileField(_('Файл резервной копии'), upload_to='backups/')
    size = models.PositiveIntegerField(_('Размер (байт)'), default=0)
    checksum = models.CharField(_('Контрольная сумма'), max_length=64, blank=True)
    error_message = models.TextField(_('Сообщение об ошибке'), blank=True)
    created_at = models.DateTimeField(_('Дата создания'), auto_now_add=True)
    completed_at = models.DateTimeField(_('Дата завершения'), null=True, blank=True)

    class Meta:
        verbose_name = _('Резервная копия')
        verbose_name_plural = _('Резервные копии')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_backup_type_display()} - {self.created_at}"


class SystemLog(models.Model):
    """Модель системного журнала."""

    class LogLevel(models.TextChoices):
        DEBUG = 'debug', _('Отладка')
        INFO = 'info', _('Информация')
        WARNING = 'warning', _('Предупреждение')
        ERROR = 'error', _('Ошибка')
        CRITICAL = 'critical', _('Критическая ошибка')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    level = models.CharField(
        _('Уровень'),
        max_length=20,
        choices=LogLevel.choices,
        default=LogLevel.INFO
    )
    module = models.CharField(_('Модуль'), max_length=100)
    message = models.TextField(_('Сообщение'))
    stack_trace = models.TextField(_('Трассировка стека'), blank=True)
    created_at = models.DateTimeField(_('Дата создания'), auto_now_add=True)

    class Meta:
        verbose_name = _('Системный журнал')
        verbose_name_plural = _('Системные журналы')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_level_display()} - {self.module} - {self.created_at}"


class SystemHealth(models.Model):
    """Модель здоровья системы."""

    class HealthStatus(models.TextChoices):
        HEALTHY = 'healthy', _('Здоровая')
        WARNING = 'warning', _('Предупреждение')
        CRITICAL = 'critical', _('Критическая')

    component = models.CharField(_('Компонент'), max_length=100)
    status = models.CharField(
        _('Статус'),
        max_length=20,
        choices=HealthStatus.choices,
        default=HealthStatus.HEALTHY
    )
    details = models.TextField(_('Детали'), blank=True)
    last_checked = models.DateTimeField(_('Последняя проверка'), auto_now=True)
    created_at = models.DateTimeField(_('Дата создания'), auto_now_add=True)

    class Meta:
        verbose_name = _('Здоровье системы')
        verbose_name_plural = _('Здоровье системы')
        unique_together = ['component']
        ordering = ['component']

    def __str__(self):
        return f"{self.component} - {self.get_status_display()}"