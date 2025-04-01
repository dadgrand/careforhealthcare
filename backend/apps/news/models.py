import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()


def news_image_upload_path(instance, filename):
    """Определение пути загрузки изображения новости."""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return f"news/images/{filename}"


class NewsCategory(models.Model):
    """Модель категории новостей."""

    name = models.CharField(_('Название'), max_length=100)
    slug = models.SlugField(_('Slug'), max_length=100, unique=True)
    description = models.TextField(_('Описание'), blank=True)
    is_active = models.BooleanField(_('Активна'), default=True)
    created_at = models.DateTimeField(_('Дата создания'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Дата обновления'), auto_now=True)

    class Meta:
        verbose_name = _('Категория новостей')
        verbose_name_plural = _('Категории новостей')
        ordering = ['name']

    def __str__(self):
        return self.name


class NewsArticle(models.Model):
    """Модель новостной статьи."""

    class ArticleStatus(models.TextChoices):
        DRAFT = 'draft', _('Черновик')
        PUBLISHED = 'published', _('Опубликовано')
        ARCHIVED = 'archived', _('В архиве')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(_('Заголовок'), max_length=255)
    slug = models.SlugField(_('Slug'), max_length=255, unique=True)
    content = models.TextField(_('Содержание'))
    excerpt = models.TextField(_('Краткое описание'), blank=True)
    category = models.ForeignKey(
        NewsCategory,
        verbose_name=_('Категория'),
        related_name='articles',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    author = models.ForeignKey(
        User,
        verbose_name=_('Автор'),
        related_name='articles',
        on_delete=models.CASCADE
    )
    featured_image = models.ImageField(
        _('Главное изображение'),
        upload_to=news_image_upload_path,
        null=True,
        blank=True
    )
    status = models.CharField(
        _('Статус'),
        max_length=20,
        choices=ArticleStatus.choices,
        default=ArticleStatus.DRAFT
    )
    is_featured = models.BooleanField(_('Рекомендуемая'), default=False)
    is_internal = models.BooleanField(_('Только для сотрудников'), default=False)
    views_count = models.PositiveIntegerField(_('Количество просмотров'), default=0)
    created_at = models.DateTimeField(_('Дата создания'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Дата обновления'), auto_now=True)
    published_at = models.DateTimeField(_('Дата публикации'), null=True, blank=True)

    class Meta:
        verbose_name = _('Новостная статья')
        verbose_name_plural = _('Новостные статьи')
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class NewsTag(models.Model):
    """Модель тега новостей."""

    name = models.CharField(_('Название'), max_length=50)
    slug = models.SlugField(_('Slug'), max_length=50, unique=True)
    articles = models.ManyToManyField(
        NewsArticle,
        verbose_name=_('Статьи'),
        related_name='tags'
    )
    created_at = models.DateTimeField(_('Дата создания'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Дата обновления'), auto_now=True)

    class Meta:
        verbose_name = _('Тег новостей')
        verbose_name_plural = _('Теги новостей')
        ordering = ['name']

    def __str__(self):
        return self.name


class NewsComment(models.Model):
    """Модель комментария к новости."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    article = models.ForeignKey(
        NewsArticle,
        verbose_name=_('Статья'),
        related_name='comments',
        on_delete=models.CASCADE
    )
    author = models.ForeignKey(
        User,
        verbose_name=_('Автор'),
        related_name='news_comments',
        on_delete=models.CASCADE
    )
    parent = models.ForeignKey(
        'self',
        verbose_name=_('Родительский комментарий'),
        related_name='replies',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    content = models.TextField(_('Содержание'))
    is_approved = models.BooleanField(_('Одобрен'), default=True)
    created_at = models.DateTimeField(_('Дата создания'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Дата обновления'), auto_now=True)

    class Meta:
        verbose_name = _('Комментарий к новости')
        verbose_name_plural = _('Комментарии к новостям')
        ordering = ['-created_at']

    def __str__(self):
        return f"Комментарий от {self.author} к {self.article}"


class NewsView(models.Model):
    """Модель просмотра новости."""

    article = models.ForeignKey(
        NewsArticle,
        verbose_name=_('Статья'),
        related_name='views',
        on_delete=models.CASCADE
    )
    user = models.ForeignKey(
        User,
        verbose_name=_('Пользователь'),
        related_name='news_views',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    ip_address = models.GenericIPAddressField(_('IP адрес'))
    user_agent = models.TextField(_('User Agent'), blank=True)
    viewed_at = models.DateTimeField(_('Дата просмотра'), auto_now_add=True)

    class Meta:
        verbose_name = _('Просмотр новости')
        verbose_name_plural = _('Просмотры новостей')
        ordering = ['-viewed_at']
        unique_together = ['article', 'user', 'ip_address', 'viewed_at']

    def __str__(self):
        user_str = self.user.email if self.user else 'Анонимный пользователь'
        return f"Просмотр {self.article} пользователем {user_str}"