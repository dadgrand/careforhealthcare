from django.db.models import Q, Count
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import NewsCategory, NewsArticle, NewsTag, NewsComment, NewsView
from .serializers import (
    NewsCategorySerializer, NewsArticleSerializer, NewsTagSerializer,
    NewsCommentSerializer, NewsViewSerializer
)
from .permissions import IsNewsAuthorOrReadOnly, IsCommentAuthorOrReadOnly


class NewsCategoryViewSet(viewsets.ModelViewSet):
    """Представление для работы с категориями новостей."""

    queryset = NewsCategory.objects.all()
    serializer_class = NewsCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

    def get_permissions(self):
        """Определение прав доступа."""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticatedOrReadOnly]
        return [permission() for permission in permission_classes]


class NewsTagViewSet(viewsets.ModelViewSet):
    """Представление для работы с тегами новостей."""

    queryset = NewsTag.objects.all()
    serializer_class = NewsTagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

    def get_permissions(self):
        """Определение прав доступа."""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticatedOrReadOnly]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Получение популярных тегов."""
        limit = int(request.query_params.get('limit', 10))
        tags = NewsTag.objects.annotate(
            articles_count=Count('articles')
        ).order_by('-articles_count')[:limit]

        serializer = self.get_serializer(tags, many=True)
        return Response(serializer.data)


class NewsArticleViewSet(viewsets.ModelViewSet):
    """Представление для работы с новостными статьями."""

    queryset = NewsArticle.objects.all()
    serializer_class = NewsArticleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsNewsAuthorOrReadOnly]
    lookup_field = 'slug'

    def get_queryset(self):
        """Фильтрация статей."""
        user = self.request.user

        # Базовый запрос
        queryset = NewsArticle.objects.all()

        # Для неавторизованных пользователей показываем только опубликованные и не внутренние статьи
        if not user.is_authenticated:
            queryset = queryset.filter(
                status=NewsArticle.ArticleStatus.PUBLISHED,
                is_internal=False
            )
        # Для авторизованных, но не администраторов, показываем опубликованные и их собственные статьи
        elif not user.is_superuser:
            queryset = queryset.filter(
                Q(status=NewsArticle.ArticleStatus.PUBLISHED) |
                Q(author=user)
            )

        # Фильтрация по категории
        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)

        # Фильтрация по тегу
        tag_slug = self.request.query_params.get('tag')
        if tag_slug:
            queryset = queryset.filter(tags__slug=tag_slug)

        # Фильтрация по статусу
        status_filter = self.request.query_params.get('status')
        if status_filter and (user.is_superuser or user.is_staff):
            queryset = queryset.filter(status=status_filter)

        # Фильтрация по рекомендуемым
        featured = self.request.query_params.get('featured')
        if featured:
            queryset = queryset.filter(is_featured=True)

        # Поиск по заголовку или содержанию
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(content__icontains=search)
            )

        return queryset

    def perform_create(self, serializer):
        """Установка автора статьи."""
        serializer.save(author=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        """Переопределение метода для учета просмотров."""
        article = self.get_object()

        # Учет просмотра, если пользователь не является автором
        if request.user != article.author:
            # Получаем IP-адрес
            ip_address = request.META.get('REMOTE_ADDR', '')
            user_agent = request.META.get('HTTP_USER_AGENT', '')

            # Создаем запись о просмотре
            NewsView.objects.create(
                article=article,
                user=request.user if request.user.is_authenticated else None,
                ip_address=ip_address,
                user_agent=user_agent
            )

            # Увеличиваем счетчик просмотров
            article.views_count += 1
            article.save(update_fields=['views_count'])

        serializer = self.get_serializer(article)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Получение популярных статей."""
        limit = int(request.query_params.get('limit', 5))
        articles = self.get_queryset().order_by('-views_count')[:limit]

        serializer = self.get_serializer(articles, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Получение рекомендуемых статей."""
        articles = self.get_queryset().filter(is_featured=True)

        serializer = self.get_serializer(articles, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Получение последних статей."""
        limit = int(request.query_params.get('limit', 5))
        articles = self.get_queryset().order_by('-published_at')[:limit]

        serializer = self.get_serializer(articles, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_articles(self, request):
        """Получение статей текущего пользователя."""
        if not request.user.is_authenticated:
            return Response(
                {'error': _('Необходима аутентификация.')},
                status=status.HTTP_401_UNAUTHORIZED
            )

        articles = NewsArticle.objects.filter(author=request.user)

        # Фильтрация по статусу
        status_filter = request.query_params.get('status')
        if status_filter:
            articles = articles.filter(status=status_filter)

        serializer = self.get_serializer(articles, many=True)
        return Response(serializer.data)


class NewsCommentViewSet(viewsets.ModelViewSet):
    """Представление для работы с комментариями к новостям."""

    queryset = NewsComment.objects.all()
    serializer_class = NewsCommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsCommentAuthorOrReadOnly]

    def get_queryset(self):
        """Фильтрация комментариев."""
        queryset = NewsComment.objects.filter(is_approved=True)

        # Администраторы видят все комментарии
        if self.request.user.is_superuser:
            queryset = NewsComment.objects.all()

        # Фильтрация по статье
        article_id = self.request.query_params.get('article')
        if article_id:
            queryset = queryset.filter(article__id=article_id)

        # Фильтрация по родительскому комментарию
        parent_id = self.request.query_params.get('parent')
        if parent_id:
            queryset = queryset.filter(parent__id=parent_id)
        else:
            # По умолчанию показываем только комментарии верхнего уровня
            queryset = queryset.filter(parent__isnull=True)

        # Фильтрация по автору
        author_id = self.request.query_params.get('author')
        if author_id:
            queryset = queryset.filter(author__id=author_id)

        return queryset

    def perform_create(self, serializer):
        """Установка автора комментария."""
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Одобрение комментария."""
        if not request.user.is_superuser and not request.user.is_staff:
            return Response(
                {'error': _('У вас нет прав для выполнения этого действия.')},
                status=status.HTTP_403_FORBIDDEN
            )

        comment = self.get_object()
        comment.is_approved = True
        comment.save()

        serializer = self.get_serializer(comment)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Отклонение комментария."""
        if not request.user.is_superuser and not request.user.is_staff:
            return Response(
                {'error': _('У вас нет прав для выполнения этого действия.')},
                status=status.HTTP_403_FORBIDDEN
            )

        comment = self.get_object()
        comment.is_approved = False
        comment.save()

        serializer = self.get_serializer(comment)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        """Ответ на комментарий."""
        parent_comment = self.get_object()

        # Проверяем, что родительский комментарий одобрен
        if not parent_comment.is_approved:
            return Response(
                {'error': _('Нельзя ответить на неодобренный комментарий.')},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Создаем новый комментарий
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(
            author=request.user,
            article=parent_comment.article,
            parent=parent_comment
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class NewsViewViewSet(viewsets.ReadOnlyModelViewSet):
    """Представление для просмотра статистики просмотров новостей."""

    queryset = NewsView.objects.all()
    serializer_class = NewsViewSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get_queryset(self):
        """Фильтрация просмотров."""
        queryset = NewsView.objects.all()

        # Фильтрация по статье
        article_id = self.request.query_params.get('article')
        if article_id:
            queryset = queryset.filter(article__id=article_id)

        # Фильтрация по пользователю
        user_id = self.request.query_params.get('user')
        if user_id:
            queryset = queryset.filter(user__id=user_id)

        # Фильтрация по IP-адресу
        ip_address = self.request.query_params.get('ip_address')
        if ip_address:
            queryset = queryset.filter(ip_address=ip_address)

        # Фильтрация по дате
        date_from = self.request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(viewed_at__gte=date_from)

        date_to = self.request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(viewed_at__lte=date_to)

        return queryset