import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()


class PageView(models.Model):
    """Модель просмотра страницы."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        verbose_name=_('Пользователь'),
        related_name='page_views',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    url = models.CharField(_('URL'), max_length=255)
    path = models.CharField(_('Путь'), max_length=255)
    referer = models.CharField(_('Referrer'), max_length=255, blank=True)
    ip_address = models.GenericIPAddressField(_('IP адрес'), null=True, blank=True)
    user_agent = models.TextField(_('User Agent'), blank=True)
    browser = models.CharField(_('Браузер'), max_length=100, blank=True)
    os = models.CharField(_('Операционная система'), max_length=100, blank=True)
    device = models.CharField(_('Устройство'), max_length=100, blank=True)
    session_id = models.CharField(_('ID сессии'), max_length=100, blank=True)
    viewed_at = models.DateTimeField(_('Время просмотра'), auto_now_add=True)

    class Meta:
        verbose_name = _('Просмотр страницы')
        verbose_name_plural = _('Просмотры страниц')
        ordering = ['-viewed_at']

    def __str__(self):
        return f"{self.url} - {self.viewed_at}"


class UserSession(models.Model):
    """Модель сессии пользователя."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        verbose_name=_('Пользователь'),
        related_name='sessions',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    session_id = models.CharField(_('ID сессии'), max_length=100)
    ip_address = models.GenericIPAddressField(_('IP адрес'), null=True, blank=True)
    user_agent = models.TextField(_('User Agent'), blank=True)
    browser = models.CharField(_('Браузер'), max_length=100, blank=True)
    os = models.CharField(_('Операционная система'), max_length=100, blank=True)
    device = models.CharField(_('Устройство'), max_length=100, blank=True)
    start_time = models.DateTimeField(_('Время начала'), auto_now_add=True)
    end_time = models.DateTimeField(_('Время окончания'), null=True, blank=True)
    duration = models.PositiveIntegerField(_('Длительность (сек)'), default=0)

    class Meta:
        verbose_name = _('Сессия пользователя')
        verbose_name_plural = _('Сессии пользователей')
        ordering = ['-start_time']

    def __str__(self):
        return f"Сессия {self.session_id} - {self.start_time}"


class UserActivity(models.Model):
    """Модель активности пользователя."""

    class ActivityType(models.TextChoices):
        LOGIN = 'login', _('Вход')
        LOGOUT = 'logout', _('Выход')
        REGISTRATION = 'registration', _('Регистрация')
        PASSWORD_CHANGE = 'password_change', _('Смена пароля')
        PROFILE_UPDATE = 'profile_update', _('Обновление профиля')
        CONTENT_CREATE = 'content_create', _('Создание контента')
        CONTENT_UPDATE = 'content_update', _('Обновление контента')
        CONTENT_DELETE = 'content_delete', _('Удаление контента')
        FILE_UPLOAD = 'file_upload', _('Загрузка файла')
        FILE_DOWNLOAD = 'file_download', _('Скачивание файла')
        TEST_START = 'test_start', _('Начало теста')
        TEST_COMPLETE = 'test_complete', _('Завершение теста')
        OTHER = 'other', _('Другое')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        verbose_name=_('Пользователь'),
        related_name='activities',
        on_delete=models.CASCADE
    )
    activity_type = models.CharField(
        _('Тип активности'),
        max_length=20,
        choices=ActivityType.choices
    )
    description = models.TextField(_('Описание'), blank=True)
    ip_address = models.GenericIPAddressField(_('IP адрес'), null=True, blank=True)
    user_agent = models.TextField(_('User Agent'), blank=True)
    created_at = models.DateTimeField(_('Время создания'), auto_now_add=True)

    # Ссылка на связанный объект (полиморфная связь)
    content_type = models.CharField(_('Тип контента'), max_length=100, blank=True)
    object_id = models.CharField(_('ID объекта'), max_length=100, blank=True)

    class Meta:
        verbose_name = _('Активность пользователя')
        verbose_name_plural = _('Активности пользователей')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} - {self.get_activity_type_display()} - {self.created_at}"


class DailyStatistics(models.Model):
    """Модель ежедневной статистики."""

    date = models.DateField(_('Дата'), unique=True)
    total_views = models.PositiveIntegerField(_('Всего просмотров'), default=0)
    unique_visitors = models.PositiveIntegerField(_('Уникальные посетители'), default=0)
    registered_users = models.PositiveIntegerField(_('Зарегистрированные пользователи'), default=0)
    new_users = models.PositiveIntegerField(_('Новые пользователи'), default=0)
    active_users = models.PositiveIntegerField(_('Активные пользователи'), default=0)
    average_session_duration = models.PositiveIntegerField(_('Средняя продолжительность сессии (сек)'), default=0)
    total_sessions = models.PositiveIntegerField(_('Всего сессий'), default=0)
    files_uploaded = models.PositiveIntegerField(_('Загружено файлов'), default=0)
    files_downloaded = models.PositiveIntegerField(_('Скачано файлов'), default=0)
    tests_started = models.PositiveIntegerField(_('Начато тестов'), default=0)
    tests_completed = models.PositiveIntegerField(_('Завершено тестов'), default=0)

    class Meta:
        verbose_name = _('Ежедневная статистика')
        verbose_name_plural = _('Ежедневная статистика')
        ordering = ['-date']

    def __str__(self):
        return f"Статистика за {self.date}"


class UserStatistics(models.Model):
    """Модель статистики пользователя."""

    user = models.OneToOneField(
        User,
        verbose_name=_('Пользователь'),
        related_name='statistics',
        on_delete=models.CASCADE
    )
    last_login = models.DateTimeField(_('Последний вход'), null=True, blank=True)
    login_count = models.PositiveIntegerField(_('Количество входов'), default=0)
    total_session_duration = models.PositiveIntegerField(_('Общая длительность сессий (сек)'), default=0)
    average_session_duration = models.PositiveIntegerField(_('Средняя продолжительность сессии (сек)'), default=0)
    total_page_views = models.PositiveIntegerField(_('Всего просмотров страниц'), default=0)
    files_uploaded = models.PositiveIntegerField(_('Загружено файлов'), default=0)
    files_downloaded = models.PositiveIntegerField(_('Скачано файлов'), default=0)
    tests_started = models.PositiveIntegerField(_('Начато тестов'), default=0)
    tests_completed = models.PositiveIntegerField(_('Завершено тестов'), default=0)
    tests_passed = models.PositiveIntegerField(_('Пройдено тестов'), default=0)

    class Meta:
        verbose_name = _('Статистика пользователя')
        verbose_name_plural = _('Статистика пользователей')

    def __str__(self):
        return f"Статистика пользователя {self.user}"


class PopularPage(models.Model):
    """Модель популярной страницы."""

    url = models.CharField(_('URL'), max_length=255)
    title = models.CharField(_('Заголовок'), max_length=255, blank=True)
    views_count = models.PositiveIntegerField(_('Количество просмотров'), default=0)
    unique_visitors = models.PositiveIntegerField(_('Уникальные посетители'), default=0)
    date = models.DateField(_('Дата'))

    class Meta:
        verbose_name = _('Популярная страница')
        verbose_name_plural = _('Популярные страницы')
        ordering = ['-date', '-views_count']
        unique_together = ['url', 'date']

    def __str__(self):
        return f"{self.url} - {self.views_count} просмотров ({self.date})"