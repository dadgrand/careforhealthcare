from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

from .views import (
    CustomTokenObtainPairView, RegisterView, UserViewSet,
    DepartmentViewSet, SpecializationViewSet, ProfileViewSet
)

# Создаем роутер
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'departments', DepartmentViewSet)
router.register(r'specializations', SpecializationViewSet)
router.register(r'profiles', ProfileViewSet)

# Определяем URL-паттерны
urlpatterns = [
    # Маршруты для JWT аутентификации
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # Маршрут для регистрации
    path('register/', RegisterView.as_view(), name='register'),

    # Включаем маршруты из роутера
    path('', include(router.urls)),
]