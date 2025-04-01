from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    TestCategoryViewSet, TestViewSet, QuestionViewSet,
    AnswerViewSet, TestAttemptViewSet, TestAssignmentViewSet
)

# Создаем роутер
router = DefaultRouter()
router.register(r'categories', TestCategoryViewSet)
router.register(r'tests', TestViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'answers', AnswerViewSet)
router.register(r'attempts', TestAttemptViewSet)
router.register(r'assignments', TestAssignmentViewSet)

# Определяем URL-паттерны
urlpatterns = [
    # Включаем маршруты из роутера
    path('', include(router.urls)),
]