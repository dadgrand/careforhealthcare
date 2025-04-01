from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    SystemSettingViewSet, SystemBackupViewSet,
    SystemLogViewSet, SystemHealthViewSet, HealthCheckView
)

# Создаем роутер
router = DefaultRouter()
router.register(r'settings', SystemSettingViewSet)
router.register(r'backups', SystemBackupViewSet)
router.register(r'logs', SystemLogViewSet)
router.register(r'health', SystemHealthViewSet)
router.register(r'healthcheck', HealthCheckView, basename='healthcheck')

# Определяем URL-паттерны
urlpatterns = [
    # Включаем маршруты из роутера
    path('', include(router.urls)),
]