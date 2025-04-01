from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    FileCategoryViewSet, FileViewSet, FileAccessViewSet,
    FileVerificationViewSet, FileVersionViewSet, FileDownloadHistoryViewSet
)

# Создаем роутер
router = DefaultRouter()
router.register(r'categories', FileCategoryViewSet)
router.register(r'files', FileViewSet)
router.register(r'access', FileAccessViewSet)
router.register(r'verifications', FileVerificationViewSet)
router.register(r'versions', FileVersionViewSet)
router.register(r'downloads', FileDownloadHistoryViewSet)

# Определяем URL-паттерны
urlpatterns = [
    # Включаем маршруты из роутера
    path('', include(router.urls)),
]