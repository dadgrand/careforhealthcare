import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    """Менеджер пользователей для кастомной модели User."""

    def create_user(self, email, password=None, **extra_fields):
        """Создание и сохранение обычного пользователя с email и паролем."""
        if not email:
            raise ValueError(_('У пользователя должен быть email адрес'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Создание и сохранение суперпользователя с email и паролем."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', User.Role.ADMIN)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Суперпользователь должен иметь is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Суперпользователь должен иметь is_superuser=True.'))

        return self.create_user(email, password, **extra_fields)


class Department(models.Model):
    """Модель отделения больницы."""

    name = models.CharField(_('Название'), max_length=100)
    description = models.TextField(_('Описание'), blank=True)
    is_active = models.BooleanField(_('Активно'), default=True)
    created_at = models.DateTimeField(_('Дата создания'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Дата обновления'), auto_now=True)

    class Meta:
        verbose_name = _('Отделение')
        verbose_name_plural = _('Отделения')
        ordering = ['name']

    def __str__(self):
        return self.name


class Specialization(models.Model):
    """Модель специализации врача."""

    name = models.CharField(_('Название'), max_length=100)
    description = models.TextField(_('Описание'), blank=True)
    is_active = models.BooleanField(_('Активна'), default=True)
    created_at = models.DateTimeField(_('Дата создания'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Дата обновления'), auto_now=True)

    class Meta:
        verbose_name = _('Специализация')
        verbose_name_plural = _('Специализации')
        ordering = ['name']

    def __str__(self):
        return self.name


class User(AbstractBaseUser, PermissionsMixin):
    """Кастомная модель пользователя."""

    class Role(models.TextChoices):
        ADMIN = 'admin', _('Администратор')
        DOCTOR = 'doctor', _('Врач')
        NURSE = 'nurse', _('Медсестра')
        MANAGER = 'manager', _('Руководитель')
        STAFF = 'staff', _('Персонал')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_('Email адрес'), unique=True)
    first_name = models.CharField(_('Имя'), max_length=150, blank=True)
    last_name = models.CharField(_('Фамилия'), max_length=150, blank=True)
    patronymic = models.CharField(_('Отчество'), max_length=150, blank=True)
    role = models.CharField(
        _('Роль'),
        max_length=20,
        choices=Role.choices,
        default=Role.STAFF
    )
    department = models.ForeignKey(
        Department,
        verbose_name=_('Отделение'),
        related_name='users',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    specialization = models.ForeignKey(
        Specialization,
        verbose_name=_('Специализация'),
        related_name='users',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    phone = models.CharField(_('Телефон'), max_length=20, blank=True)
    avatar = models.ImageField(_('Аватар'), upload_to='avatars/', null=True, blank=True)
    is_active = models.BooleanField(_('Активен'), default=True)
    is_staff = models.BooleanField(_('Персонал'), default=False)
    date_joined = models.DateTimeField(_('Дата регистрации'), default=timezone.now)
    last_login = models.DateTimeField(_('Последний вход'), null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        verbose_name = _('Пользователь')
        verbose_name_plural = _('Пользователи')
        ordering = ['email']

    def __str__(self):
        if self.first_name and self.last_name:
            return f'{self.last_name} {self.first_name}'
        return self.email

    def get_full_name(self):
        """Возвращает полное имя пользователя."""
        full_name = f'{self.last_name} {self.first_name}'
        if self.patronymic:
            full_name = f'{full_name} {self.patronymic}'
        return full_name.strip()

    def get_short_name(self):
        """Возвращает короткое имя пользователя."""
        if self.first_name:
            return self.first_name
        return self.email.split('@')[0]


class UserProfile(models.Model):
    """Расширенный профиль пользователя."""

    user = models.OneToOneField(
        User,
        verbose_name=_('Пользователь'),
        related_name='profile',
        on_delete=models.CASCADE
    )
    bio = models.TextField(_('О себе'), blank=True)
    birth_date = models.DateField(_('Дата рождения'), null=True, blank=True)
    address = models.CharField(_('Адрес'), max_length=255, blank=True)
    position = models.CharField(_('Должность'), max_length=100, blank=True)
    experience_years = models.PositiveIntegerField(_('Опыт работы (лет)'), default=0)
    education = models.TextField(_('Образование'), blank=True)
    certificates = models.TextField(_('Сертификаты'), blank=True)
    created_at = models.DateTimeField(_('Дата создания'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Дата обновления'), auto_now=True)

    class Meta:
        verbose_name = _('Профиль пользователя')
        verbose_name_plural = _('Профили пользователей')

    def __str__(self):
        return f'Профиль {self.user}'


class LoginHistory(models.Model):
    """История входов пользователя."""

    user = models.ForeignKey(
        User,
        verbose_name=_('Пользователь'),
        related_name='login_history',
        on_delete=models.CASCADE
    )
    ip_address = models.GenericIPAddressField(_('IP адрес'))
    user_agent = models.TextField(_('User Agent'))
    login_time = models.DateTimeField(_('Время входа'), auto_now_add=True)
    successful = models.BooleanField(_('Успешно'), default=True)

    class Meta:
        verbose_name = _('История входа')
        verbose_name_plural = _('История входов')
        ordering = ['-login_time']

    def __str__(self):
        status = "успешный" if self.successful else "неудачный"
        return f"{self.user} - {status} вход {self.login_time}"