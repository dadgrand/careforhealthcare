from django.utils import timezone
from django.utils.text import slugify
from rest_framework import serializers

from .models import NewsCategory, NewsArticle, NewsTag, NewsComment, NewsView


class NewsCategorySerializer(serializers.ModelSerializer):
    """Сериализатор для модели NewsCategory."""

    articles_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = NewsCategory
        fields = ['id', 'name', 'slug', 'description', 'is_active', 'created_at', 'updated_at', 'articles_count']
        read_only_fields = ['created_at', 'updated_at']
        extra_kwargs = {
            'slug': {'required': False}
        }

    def get_articles_count(self, obj):
        """Получение количества статей в категории."""
        return obj.articles.count()

    def create(self, validated_data):
        """Создание категории с автоматическим генерированием slug."""
        if 'slug' not in validated_data:
            validated_data['slug'] = slugify(validated_data['name'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Обновление категории с автоматическим обновлением slug."""
        if 'name' in validated_data and 'slug' not in validated_data:
            validated_data['slug'] = slugify(validated_data['name'])
        return super().update(instance, validated_data)


class NewsTagSerializer(serializers.ModelSerializer):
    """Сериализатор для модели NewsTag."""

    articles_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = NewsTag
        fields = ['id', 'name', 'slug', 'created_at', 'updated_at', 'articles_count']
        read_only_fields = ['created_at', 'updated_at']
        extra_kwargs = {
            'slug': {'required': False}
        }

    def get_articles_count(self, obj):
        """Получение количества статей с данным тегом."""
        return obj.articles.count()

    def create(self, validated_data):
        """Создание тега с автоматическим генерированием slug."""
        if 'slug' not in validated_data:
            validated_data['slug'] = slugify(validated_data['name'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Обновление тега с автоматическим обновлением slug."""
        if 'name' in validated_data and 'slug' not in validated_data:
            validated_data['slug'] = slugify(validated_data['name'])
        return super().update(instance, validated_data)


class NewsCommentSerializer(serializers.ModelSerializer):
    """Сериализатор для модели NewsComment."""

    author_details = serializers.SerializerMethodField(read_only=True)
    replies = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = NewsComment
        fields = [
            'id', 'article', 'author', 'parent', 'content',
            'is_approved', 'created_at', 'updated_at',
            'author_details', 'replies'
        ]
        read_only_fields = ['created_at', 'updated_at', 'is_approved']

    def get_author_details(self, obj):
        """Получение информации об авторе комментария."""
        return {
            'id': obj.author.id,
            'email': obj.author.email,
            'full_name': obj.author.get_full_name(),
            'avatar': obj.author.avatar.url if obj.author.avatar else None
        }

    def get_replies(self, obj):
        """Получение ответов на комментарий."""
        # Только первый уровень ответов, чтобы избежать рекурсии
        replies = obj.replies.filter(is_approved=True)
        return NewsCommentSerializer(replies, many=True, context=self.context).data if replies.exists() else []


class NewsArticleSerializer(serializers.ModelSerializer):
    """Сериализатор для модели NewsArticle."""

    category_details = NewsCategorySerializer(source='category', read_only=True)
    author_details = serializers.SerializerMethodField(read_only=True)
    tags = NewsTagSerializer(many=True, read_only=True)
    comments_count = serializers.SerializerMethodField(read_only=True)
    comments = NewsCommentSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=NewsTag.objects.all(),
        write_only=True,
        many=True,
        required=False,
        source='tags'
    )

    class Meta:
        model = NewsArticle
        fields = [
            'id', 'title', 'slug', 'content', 'excerpt', 'category',
            'author', 'featured_image', 'status', 'is_featured',
            'is_internal', 'views_count', 'created_at', 'updated_at',
            'published_at', 'category_details', 'author_details',
            'tags', 'comments_count', 'comments', 'tag_ids'
        ]
        read_only_fields = ['created_at', 'updated_at', 'views_count', 'author']
        extra_kwargs = {
            'slug': {'required': False}
        }

    def get_author_details(self, obj):
        """Получение информации об авторе статьи."""
        return {
            'id': obj.author.id,
            'email': obj.author.email,
            'full_name': obj.author.get_full_name(),
            'avatar': obj.author.avatar.url if obj.author.avatar else None
        }

    def get_comments_count(self, obj):
        """Получение количества комментариев к статье."""
        return obj.comments.filter(is_approved=True).count()

    def create(self, validated_data):
        """Создание статьи с автоматическим генерированием slug и установкой даты публикации."""
        if 'slug' not in validated_data:
            validated_data['slug'] = slugify(validated_data['title'])

        if validated_data.get('status') == NewsArticle.ArticleStatus.PUBLISHED:
            validated_data['published_at'] = timezone.now()

        tags_data = validated_data.pop('tags', [])
        article = super().create(validated_data)

        # Добавляем теги
        if tags_data:
            article.tags.set(tags_data)

        return article

    def update(self, instance, validated_data):
        """Обновление статьи с автоматическим обновлением slug и даты публикации."""
        if 'title' in validated_data and 'slug' not in validated_data:
            validated_data['slug'] = slugify(validated_data['title'])

        # Если статус меняется на "Опубликовано" и статья не была опубликована ранее
        if (validated_data.get('status') == NewsArticle.ArticleStatus.PUBLISHED and
                (instance.status != NewsArticle.ArticleStatus.PUBLISHED or not instance.published_at)):
            validated_data['published_at'] = timezone.now()

        tags_data = validated_data.pop('tags', None)
        article = super().update(instance, validated_data)

        # Обновляем теги, если они были предоставлены
        if tags_data is not None:
            article.tags.set(tags_data)

        return article


class NewsViewSerializer(serializers.ModelSerializer):
    """Сериализатор для модели NewsView."""

    user_details = serializers.SerializerMethodField(read_only=True)
    article_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = NewsView
        fields = [
            'id', 'article', 'user', 'ip_address', 'user_agent',
            'viewed_at', 'user_details', 'article_details'
        ]
        read_only_fields = fields

    def get_user_details(self, obj):
        """Получение информации о пользователе."""
        if obj.user:
            return {
                'id': obj.user.id,
                'email': obj.user.email,
                'full_name': obj.user.get_full_name()
            }
        return None

    def get_article_details(self, obj):
        """Получение информации о статье."""
        return {
            'id': obj.article.id,
            'title': obj.article.title,
            'slug': obj.article.slug
        }