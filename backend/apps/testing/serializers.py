from django.utils import timezone
from rest_framework import serializers
from django.db.transaction import atomic

from .models import (
    TestCategory, Test, Question, Answer,
    TestAttempt, UserAnswer, TestAssignment
)


class TestCategorySerializer(serializers.ModelSerializer):
    """Сериализатор для модели TestCategory."""

    tests_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = TestCategory
        fields = ['id', 'name', 'description', 'is_active', 'created_at', 'updated_at', 'tests_count']
        read_only_fields = ['created_at', 'updated_at']

    def get_tests_count(self, obj):
        """Получение количества тестов в категории."""
        return obj.tests.count()


class AnswerSerializer(serializers.ModelSerializer):
    """Сериализатор для модели Answer."""

    class Meta:
        model = Answer
        fields = ['id', 'question', 'text', 'is_correct', 'order', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
        extra_kwargs = {
            'is_correct': {'write_only': True}  # Скрываем признак правильного ответа от пользователей
        }


class AnswerAdminSerializer(serializers.ModelSerializer):
    """Сериализатор для модели Answer с полным доступом."""

    class Meta:
        model = Answer
        fields = ['id', 'question', 'text', 'is_correct', 'order', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class QuestionSerializer(serializers.ModelSerializer):
    """Сериализатор для модели Question."""

    answers = AnswerSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = [
            'id', 'test', 'text', 'question_type', 'image',
            'points', 'order', 'is_required', 'explanation',
            'created_at', 'updated_at', 'answers'
        ]
        read_only_fields = ['created_at', 'updated_at']
        extra_kwargs = {
            'explanation': {'write_only': True}  # Скрываем пояснение от пользователей
        }


class QuestionAdminSerializer(serializers.ModelSerializer):
    """Сериализатор для модели Question с полным доступом."""

    answers = AnswerAdminSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = [
            'id', 'test', 'text', 'question_type', 'image',
            'points', 'order', 'is_required', 'explanation',
            'created_at', 'updated_at', 'answers'
        ]
        read_only_fields = ['created_at', 'updated_at']


class TestSerializer(serializers.ModelSerializer):
    """Сериализатор для модели Test."""

    category_details = TestCategorySerializer(source='category', read_only=True)
    author_details = serializers.SerializerMethodField(read_only=True)
    questions_count = serializers.SerializerMethodField(read_only=True)
    total_points = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Test
        fields = [
            'id', 'title', 'description', 'category', 'author',
            'status', 'test_type', 'time_limit', 'passing_score',
            'max_attempts', 'randomize_questions', 'show_answers',
            'is_required', 'required_departments', 'required_specializations',
            'created_at', 'updated_at', 'published_at', 'deadline',
            'category_details', 'author_details', 'questions_count',
            'total_points'
        ]
        read_only_fields = ['created_at', 'updated_at', 'published_at', 'author']

    def get_author_details(self, obj):
        """Получение информации об авторе теста."""
        return {
            'id': obj.author.id,
            'email': obj.author.email,
            'full_name': obj.author.get_full_name()
        }

    def get_questions_count(self, obj):
        """Получение количества вопросов в тесте."""
        return obj.questions.count()

    def get_total_points(self, obj):
        """Получение общего количества баллов за тест."""
        return obj.questions.aggregate(total=models.Sum('points'))['total'] or 0


class TestDetailSerializer(serializers.ModelSerializer):
    """Расширенный сериализатор для модели Test с вопросами."""

    category_details = TestCategorySerializer(source='category', read_only=True)
    author_details = serializers.SerializerMethodField(read_only=True)
    questions = QuestionSerializer(many=True, read_only=True)
    questions_count = serializers.SerializerMethodField(read_only=True)
    total_points = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Test
        fields = [
            'id', 'title', 'description', 'category', 'author',
            'status', 'test_type', 'time_limit', 'passing_score',
            'max_attempts', 'randomize_questions', 'show_answers',
            'is_required', 'required_departments', 'required_specializations',
            'created_at', 'updated_at', 'published_at', 'deadline',
            'category_details', 'author_details', 'questions',
            'questions_count', 'total_points'
        ]
        read_only_fields = ['created_at', 'updated_at', 'published_at', 'author']

    def get_author_details(self, obj):
        """Получение информации об авторе теста."""
        return {
            'id': obj.author.id,
            'email': obj.author.email,
            'full_name': obj.author.get_full_name()
        }

    def get_questions_count(self, obj):
        """Получение количества вопросов в тесте."""
        return obj.questions.count()

    def get_total_points(self, obj):
        """Получение общего количества баллов за тест."""
        return obj.questions.aggregate(total=models.Sum('points'))['total'] or 0


class TestDetailAdminSerializer(TestDetailSerializer):
    """Сериализатор для модели Test с полным доступом."""

    questions = QuestionAdminSerializer(many=True, read_only=True)


class UserAnswerSerializer(serializers.ModelSerializer):
    """Сериализатор для модели UserAnswer."""

    question_details = QuestionSerializer(source='question', read_only=True)

    class Meta:
        model = UserAnswer
        fields = [
            'id', 'attempt', 'question', 'selected_answers',
            'text_answer', 'numeric_answer', 'is_correct',
            'points_earned', 'created_at', 'updated_at',
            'question_details'
        ]
        read_only_fields = ['created_at', 'updated_at', 'is_correct', 'points_earned']


class SubmitAnswerSerializer(serializers.Serializer):
    """Сериализатор для отправки ответа на вопрос."""

    question_id = serializers.UUIDField(required=True)
    selected_answer_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False
    )
    text_answer = serializers.CharField(required=False, allow_blank=True)
    numeric_answer = serializers.DecimalField(
        required=False,
        max_digits=10,
        decimal_places=2,
        allow_null=True
    )


class TestAttemptSerializer(serializers.ModelSerializer):
    """Сериализатор для модели TestAttempt."""

    test_details = TestSerializer(source='test', read_only=True)
    user_details = serializers.SerializerMethodField(read_only=True)
    user_answers = UserAnswerSerializer(many=True, read_only=True)

    class Meta:
        model = TestAttempt
        fields = [
            'id', 'test', 'user', 'started_at', 'completed_at',
            'status', 'score', 'max_score', 'score_percentage',
            'passed', 'time_spent', 'attempt_number',
            'test_details', 'user_details', 'user_answers'
        ]
        read_only_fields = [
            'id', 'started_at', 'completed_at', 'status', 'score',
            'max_score', 'score_percentage', 'passed', 'time_spent',
            'attempt_number'
        ]

    def get_user_details(self, obj):
        """Получение информации о пользователе."""
        return {
            'id': obj.user.id,
            'email': obj.user.email,
            'full_name': obj.user.get_full_name()
        }


class TestAssignmentSerializer(serializers.ModelSerializer):
    """Сериализатор для модели TestAssignment."""

    test_details = TestSerializer(source='test', read_only=True)
    user_details = serializers.SerializerMethodField(read_only=True)
    assigned_by_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = TestAssignment
        fields = [
            'id', 'test', 'user', 'assigned_by', 'status',
            'due_date', 'assigned_at', 'completed_at', 'notify_user',
            'message', 'test_details', 'user_details', 'assigned_by_details'
        ]
        read_only_fields = ['assigned_at', 'completed_at']

    def get_user_details(self, obj):
        """Получение информации о пользователе."""
        return {
            'id': obj.user.id,
            'email': obj.user.email,
            'full_name': obj.user.get_full_name()
        }

    def get_assigned_by_details(self, obj):
        """Получение информации о пользователе, назначившем тест."""
        if obj.assigned_by:
            return {
                'id': obj.assigned_by.id,
                'email': obj.assigned_by.email,
                'full_name': obj.assigned_by.get_full_name()
            }
        return None


class BulkTestAssignmentSerializer(serializers.Serializer):
    """Сериализатор для массового назначения тестов."""

    test_id = serializers.UUIDField(required=True)
    user_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=True
    )
    due_date = serializers.DateTimeField(required=False, allow_null=True)
    notify_users = serializers.BooleanField(default=True)
    message = serializers.CharField(required=False, allow_blank=True)