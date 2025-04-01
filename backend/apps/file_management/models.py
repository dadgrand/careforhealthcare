import os
import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()


def file_upload_path(instance, filename):
    """Определение пути загрузки файла."""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('documents', instance.file_type, filename)


class FileCategory(models.Model):
    """Модель категории файлов."""

    name = models.CharField(_('Название'), max_length=100)
    description = models.TextField(_('Описание'), blank=True)
    is_active = models.BooleanField(_('Активна'), default=True)
    created_at = models.DateTimeField(_('Дата создания'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Дата обновления'), auto_now=True)

    class Meta:
        verbose_name = _('Категория файлов')
        verbose_name_plural = _('Категории файлов')
        ordering = ['name']

    def __str__(self):
        return self.name


class File(models.Model):
    """Модель файла."""

    class FileType(models.TextChoices):
        DOCUMENT = 'document', _('Документ')
        IMAGE = 'image', _('Изображение')
        SPREADSHEET = 'spreadsheet', _('Таблица')
        PRESENTATION = 'presentation', _('Презентация')
        PDF = 'pdf', _('PDF')
        VIDEO = 'video', _('Видео')
        AUDIO = 'audio', _('Аудио')
        OTHER = 'other', _('Другое')

    class AccessLevel(models.TextChoices):
        PUBLIC = 'public', _('Публичный')
        RESTRICTED = 'restricted', _('Ограниченный')
        PRIVATE = 'private', _('Приватный')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(_('Название'), max_length=255)
    description = models.TextField(_('Описание'), blank=True)
    file = models.FileField(_('Файл'), upload_to=file_upload_path)
    file_size = models.PositiveIntegerField(_('Размер файла'), default=0)
    file_type = models.CharField(
        _('Тип файла'),
        max_length=20,
        choices=FileType.choices,
        default=FileType.DOCUMENT
    )
    mime_type = models.CharField(_('MIME тип'), max_length=100, blank=True)
    category = models.ForeignKey(
        FileCategory,
        verbose_name=_('Категория'),
        related_name='files',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    access_level = models.CharField(
        _('Уровень доступа'),
        max_length=20,
        choices=AccessLevel.choices,
        default=AccessLevel.RESTRICTED
    )
    owner = models.ForeignKey(
        User,
        verbose_name=_('Владелец'),
        related_name='owned_files',
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(_('Дата создания'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Дата обновления'), auto_now=True)
    checksum = models.CharField(_('Контрольная сумма'), max_length=64, blank=True)

    class Meta:
        verbose_name = _('Файл')
        verbose_name_plural = _('Файлы')
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        """Переопределение метода сохранения для вычисления размера файла."""
        if self.file and not self.file_size and hasattr(self.file, 'size'):
            self.file_size = self.file.size
        super().save(*args, **kwargs)


class FileAccess(models.Model):
    """Модель доступа к файлу."""

    class PermissionType(models.TextChoices):
        VIEW = 'view', _('Просмотр')
        EDIT = 'edit', _('Редактирование')
        DELETE = 'delete', _('Удаление')

    file = models.ForeignKey(
        File,
        verbose_name=_('Файл'),
        related_name='access_rights',
        on_delete=models.CASCADE
    )
    user = models.ForeignKey(
        User,
        verbose_name=_('Пользователь'),
        related_name='file_access',
        on_delete=models.CASCADE
    )
    permission_type = models.CharField(
        _('Тип разрешения'),
        max_length=20,
        choices=PermissionType.choices
    )
    created_at = models.DateTimeField(_('Дата создания'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Дата обновления'), auto_now=True)

    class Meta:
        verbose_name = _('Доступ к файлу')
        verbose_name_plural = _('Доступы к файлам')
        unique_together = ['file', 'user', 'permission_type']
        ordering = ['file', 'user', 'permission_type']

    def __str__(self):
        return f"{self.file} - {self.user} - {self.get_permission_type_display()}"


class FileVerification(models.Model):
    """Модель верификации файла."""

    class VerificationStatus(models.TextChoices):
        PENDING = 'pending', _('В ожидании')
        APPROVED = 'approved', _('Утверждено')
        REJECTED = 'rejected', _('Отклонено')

    file = models.ForeignKey(
        File,
        verbose_name=_('Файл'),
        related_name='verifications',
        on_delete=models.CASCADE
    )
    requested_by = models.ForeignKey(
        User,
        verbose_name=_('Запрошено'),
        related_name='requested_verifications',
        on_delete=models.CASCADE
    )
    verified_by = models.ForeignKey(
        User,
        verbose_name=_('Верифицировано'),
        related_name='verified_files',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    status = models.CharField(
        _('Статус'),
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING
    )
    comment = models.TextField(_('Комментарий'), blank=True)
    requested_at = models.DateTimeField(_('Дата запроса'), auto_now_add=True)
    verified_at = models.DateTimeField(_('Дата верификации'), null=True, blank=True)

    class Meta:
        verbose_name = _('Верификация файла')
        verbose_name_plural = _('Верификации файлов')
        ordering = ['-requested_at']

    def __str__(self):
        return f"{self.file} - {self.get_status_display()}"


class FileVersion(models.Model):
    """Модель версии файла."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.ForeignKey(
        File,
        verbose_name=_('Файл'),
        related_name='versions',
        on_delete=models.CASCADE
    )
    file_content = models.FileField(_('Содержимое файла'), upload_to=file_upload_path)
    version_number = models.PositiveIntegerField(_('Номер версии'))
    created_by = models.ForeignKey(
        User,
        verbose_name=_('Создано'),
        related_name='file_versions',
        on_delete=models.CASCADE
    )
    comment = models.TextField(_('Комментарий'), blank=True)
    created_at = models.DateTimeField(_('Дата создания'), auto_now_add=True)

    class Meta:
        verbose_name = _('Версия файла')
        verbose_name_plural = _('Версии файлов')
        ordering = ['-created_at']
        unique_together = ['file', 'version_number']

    def __str__(self):
        return f"{self.file} - версия {self.version_number}"


class FileDownloadHistory(models.Model):
    """Модель истории скачивания файла."""

    file = models.ForeignKey(
        File,
        verbose_name=_('Файл'),
        related_name='downloads',
        on_delete=models.CASCADE
    )
    user = models.ForeignKey(
        User,
        verbose_name=_('Пользователь'),
        related_name='file_downloads',
        on_delete=models.CASCADE
    )
    downloaded_at = models.DateTimeField(_('Дата скачивания'), auto_now_add=True)
    ip_address = models.GenericIPAddressField(_('IP адрес'), null=True, blank=True)
    user_agent = models.TextField(_('User Agent'), blank=True)

    class Meta:
        verbose_name = _('История скачивания файла')
        verbose_name_plural = _('История скачиваний файлов')
        ordering = ['-downloaded_at']

    def __str__(self):
        return f"{self.file} - {self.user} - {self.downloaded_at}"