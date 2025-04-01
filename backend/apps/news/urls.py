from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    NewsCategoryViewSet, NewsArticleViewSet, NewsTagViewSet,
    NewsCommentViewSet, NewsViewViewSet
)

# Создаем роутер
router = DefaultRouter()
router.register(r'categories', NewsCategoryViewSet)
router.register(r'articles', NewsArticleViewSet)
router.register(r'tags', NewsTagViewSet)
router.register(r'comments', NewsCommentViewSet)
router.register(r'views', NewsViewViewSet)

# Определяем URL-паттерны
urlpatterns = [
    # Включаем маршруты из роутера
    path('', include(router.urls)),
]