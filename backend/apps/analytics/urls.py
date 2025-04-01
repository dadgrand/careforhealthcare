from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    PageViewViewSet, UserSessionViewSet, UserActivityViewSet,
    DailyStatisticsViewSet, UserStatisticsViewSet, PopularPageViewSet,
    AnalyticsViewSet
)

# Создаем роутер
router = DefaultRouter()
router.register(r'page-views', PageViewViewSet)
router.register(r'sessions', UserSessionViewSet)
router.register(r'activities', UserActivityViewSet)
router.register(r'daily-statistics', DailyStatisticsViewSet)
router.register(r'user-statistics', UserStatisticsViewSet)
router.register(r'popular-pages', PopularPageViewSet)
router.register(r'analytics', AnalyticsViewSet, basename='analytics')

# Определяем URL-паттерны
urlpatterns = [
    # Включаем маршруты из роутера
    path('', include(router.urls)),
]