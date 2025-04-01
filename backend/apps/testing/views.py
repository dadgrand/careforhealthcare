import random
from datetime import timedelta
from django.db.models import Q, Count, Avg, Sum
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction

from .models import (
    TestCategory, Test, Question, Answer,
    TestAttempt, UserAnswer, TestAssignment
)
from .serializers import (
    TestCategorySerializer, TestSerializer, TestDetailSerializer,
    TestDetailAdminSerializer, QuestionSerializer, QuestionAdminSerializer,
    AnswerSerializer, AnswerAdminSerializer, TestAttemptSerializer,
    UserAnswerSerializer, SubmitAnswerSerializer, TestAssignmentSerializer,
    BulkTestAssignmentSerializer
)
from .permissions import (
    IsTestAuthorOrReadOnly, IsQuestionAuthorOrReadOnly,
    IsTestAssignmentCreatorOrReadOnly
)


class TestCategoryViewSet(viewsets.ModelViewSet):
    """Представление для работы с категориями тестов."""

    queryset = TestCategory.objects.all()
    serializer_class = TestCategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        """Определение прав доступа."""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]


class TestViewSet(viewsets.ModelViewSet):
    """Представление для работы с тестами."""

    queryset = Test.objects.all()
    serializer_class = TestSerializer
    permission_classes = [permissions.IsAuthenticated, IsTestAuthorOrReadOnly]

    def get_serializer_class(self):
        """Выбор сериализатора в зависимости от действия."""
        if self.action == 'retrieve':
            if self.request.user.is_superuser or self.request.user.is_staff:
                return TestDetailAdminSerializer
            return TestDetailSerializer
        return super().get_serializer_class()

    def get_queryset(self):
        """Фильтрация тестов."""
        user = self.request.user

        # Базовый запрос
        queryset = Test.objects.all()

        # Для обычных пользователей показываем только опубликованные тесты
        if not user.is_superuser and not user.is_staff:
            if self.action == 'list':
                queryset = queryset.filter(status=Test.TestStatus.PUBLISHED)

        # Фильтрация по категории
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category__id=category_id)

        # Фильтрация по типу теста
        test_type = self.request.query_params.get('test_type')
        if test_type:
            queryset = queryset.filter(test_type=test_type)

        # Фильтрация по статусу
        status_filter = self.request.query_params.get('status')
        if status_filter and (user.is_superuser or user.is_staff):
            queryset = queryset.filter(status=status_filter)

        # Фильтрация по обязательным тестам
        required = self.request.query_params.get('required')
        if required:
            queryset = queryset.filter(
                is_required=True,
                status=Test.TestStatus.PUBLISHED
            )

            # Фильтрация по отделению пользователя
            if user.department:
                queryset = queryset.filter(
                    Q(required_departments=user.department) |
                    Q(required_departments__isnull=True)
                )

            # Фильтрация по специализации пользователя
            if user.specialization:
                queryset = queryset.filter(
                    Q(required_specializations=user.specialization) |
                    Q(required_specializations__isnull=True)
                )

        # Поиск по заголовку или описанию
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search)
            )

        return queryset

    def perform_create(self, serializer):
        """Установка автора теста."""
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Публикация теста."""
        test = self.get_object()

        # Проверка, что тест находится в черновиках
        if test.status != Test.TestStatus.DRAFT:
            return Response(
                {'error': _("Только тесты в статусе 'Черновик' могут быть опубликованы")},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Проверка, что в тесте есть вопросы
        if test.questions.count() == 0:
            return Response(
                {'error': _("Невозможно опубликовать тест без вопросов")},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Публикация теста
        test.status = Test.TestStatus.PUBLISHED
        test.published_at = timezone.now()
        test.save()

        serializer = self.get_serializer(test)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """Архивация теста."""
        test = self.get_object()

        # Архивация теста
        test.status = Test.TestStatus.ARCHIVED
        test.save()

        serializer = self.get_serializer(test)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def start_attempt(self, request, pk=None):
        """Начало попытки прохождения теста."""
        test = self.get_object()
        user = request.user

        # Проверка, что тест опубликован
        if test.status != Test.TestStatus.PUBLISHED:
            return Response(
                {'error': _("Можно проходить только опубликованные тесты")},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Проверка, что не превышено максимальное количество попыток
        if test.max_attempts > 0:
            attempts_count = TestAttempt.objects.filter(
                test=test,
                user=user
            ).count()

            if attempts_count >= test.max_attempts:
                return Response(
                    {'error': _("Превышено максимальное количество попыток прохождения теста")},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Проверка, что нет незавершенных попыток
        existing_attempt = TestAttempt.objects.filter(
            test=test,
            user=user,
            status=TestAttempt.AttemptStatus.IN_PROGRESS
        ).first()

        if existing_attempt:
            serializer = TestAttemptSerializer(existing_attempt)
            return Response(serializer.data)

        # Определение номера попытки
        attempt_number = TestAttempt.objects.filter(
            test=test,
            user=user
        ).count() + 1

        # Создание новой попытки
        max_score = test.questions.aggregate(total=Sum('points'))['total'] or 0

        attempt = TestAttempt.objects.create(
            test=test,
            user=user,
            attempt_number=attempt_number,
            max_score=max_score
        )

        # Обновление статуса назначения теста, если оно есть
        TestAssignment.objects.filter(
            test=test,
            user=user,
            status=TestAssignment.AssignmentStatus.PENDING
        ).update(
            status=TestAssignment.AssignmentStatus.COMPLETED,
            completed_at=timezone.now()
        )

        serializer = TestAttemptSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def submit_answer(self, request, pk=None):
        """Отправка ответа на вопрос."""
        test = self.get_object()
        user = request.user

        # Валидация данных
        serializer = SubmitAnswerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Получение параметров
        question_id = serializer.validated_data['question_id']
        selected_answer_ids = serializer.validated_data.get('selected_answer_ids', [])
        text_answer = serializer.validated_data.get('text_answer', '')
        numeric_answer = serializer.validated_data.get('numeric_answer')

        # Проверка существования вопроса
        try:
            question = Question.objects.get(id=question_id, test=test)
        except Question.DoesNotExist:
            return Response(
                {'error': _("Вопрос не найден")},
                status=status.HTTP_404_NOT_FOUND
            )

        # Проверка существования попытки
        attempt = TestAttempt.objects.filter(
            test=test,
            user=user,
            status=TestAttempt.AttemptStatus.IN_PROGRESS
        ).first()

        if not attempt:
            return Response(
                {'error': _("Нет активной попытки прохождения теста")},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Проверка, что ответ на этот вопрос еще не был дан
        if UserAnswer.objects.filter(attempt=attempt, question=question).exists():
            return Response(
                {'error': _("Ответ на этот вопрос уже был отправлен")},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Создание ответа пользователя
        user_answer = UserAnswer.objects.create(
            attempt=attempt,
            question=question,
            text_answer=text_answer,
            numeric_answer=numeric_answer
        )

        # Добавление выбранных ответов
        if selected_answer_ids:
            selected_answers = Answer.objects.filter(
                id__in=selected_answer_ids,
                question=question
            )
            user_answer.selected_answers.set(selected_answers)

        # Проверка правильности ответа
        is_correct = False
        points_earned = 0

        if question.question_type == Question.QuestionType.SINGLE:
            # Для вопроса с одним вариантом ответа
            if len(selected_answer_ids) == 1:
                is_correct = Answer.objects.filter(
                    id=selected_answer_ids[0],
                    question=question,
                    is_correct=True
                ).exists()
                if is_correct:
                    points_earned = question.points

        elif question.question_type == Question.QuestionType.MULTIPLE:
            # Для вопроса с несколькими вариантами ответа
            correct_answers = set(Answer.objects.filter(
                question=question,
                is_correct=True
            ).values_list('id', flat=True))

            selected_set = set(selected_answer_ids)

            # Все правильные ответы должны быть выбраны, и неправильные не должны быть выбраны
            is_correct = (correct_answers == selected_set)
            if is_correct:
                points_earned = question.points

        elif question.question_type == Question.QuestionType.TEXT:
            # Для текстового ответа - сравнение с правильными ответами
            correct_answers = Answer.objects.filter(
                question=question,
                is_correct=True
            )
            for answer in correct_answers:
                if text_answer.lower() == answer.text.lower():
                    is_correct = True
                    points_earned = question.points
                    break

        elif question.question_type == Question.QuestionType.NUMERIC:
            # Для числового ответа - сравнение с правильными ответами
            if numeric_answer is not None:
                correct_answers = Answer.objects.filter(
                    question=question,
                    is_correct=True
                )
                for answer in correct_answers:
                    try:
                        correct_value = float(answer.text)
                        if abs(numeric_answer - correct_value) < 0.01:  # Допустимая погрешность
                            is_correct = True
                            points_earned = question.points
                            break
                    except ValueError:
                        pass  # Игнорируем неправильные числовые значения

        # Обновление ответа пользователя
        user_answer.is_correct = is_correct
        user_answer.points_earned = points_earned
        user_answer.save()

        # Обновление прогресса попытки
        self._update_attempt_progress(attempt)

        serializer = UserAnswerSerializer(user_answer)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete_attempt(self, request, pk=None):
        """Завершение попытки прохождения теста."""
        test = self.get_object()
        user = request.user

        # Проверка существования попытки
        attempt = TestAttempt.objects.filter(
            test=test,
            user=user,
            status=TestAttempt.AttemptStatus.IN_PROGRESS
        ).first()

        if not attempt:
            return Response(
                {'error': _("Нет активной попытки прохождения теста")},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Завершение попытки
        attempt.status = TestAttempt.AttemptStatus.COMPLETED
        attempt.completed_at = timezone.now()

        # Вычисление затраченного времени
        time_spent = (attempt.completed_at - attempt.started_at).total_seconds()
        attempt.time_spent = int(time_spent)

        # Обновление результатов
        total_score = UserAnswer.objects.filter(
            attempt=attempt
        ).aggregate(total=Sum('points_earned'))['total'] or 0

        attempt.score = total_score

        # Вычисление процента правильных ответов
        if attempt.max_score > 0:
            score_percentage = (total_score / attempt.max_score) * 100
            attempt.score_percentage = score_percentage

            # Определение, пройден ли тест
            attempt.passed = (score_percentage >= test.passing_score)

        attempt.save()

        serializer = TestAttemptSerializer(attempt)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def my_attempts(self, request, pk=None):
        """Получение попыток прохождения теста пользователем."""
        test = self.get_object()
        user = request.user

        attempts = TestAttempt.objects.filter(
            test=test,
            user=user
        ).order_by('-started_at')

        serializer = TestAttemptSerializer(attempts, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Получение статистики по тесту."""
        test = self.get_object()

        # Проверка прав доступа
        if not request.user.is_superuser and not request.user.is_staff and request.user != test.author:
            return Response(
                {'error': _("У вас нет прав для просмотра статистики")},
                status=status.HTTP_403_FORBIDDEN
            )

        # Общая статистика
        total_attempts = TestAttempt.objects.filter(test=test).count()
        completed_attempts = TestAttempt.objects.filter(
            test=test,
            status=TestAttempt.AttemptStatus.COMPLETED
        ).count()

        # Статистика по результатам
        avg_score = TestAttempt.objects.filter(
            test=test,
            status=TestAttempt.AttemptStatus.COMPLETED
        ).aggregate(avg=Avg('score_percentage'))['avg'] or 0

        passed_count = TestAttempt.objects.filter(
            test=test,
            status=TestAttempt.AttemptStatus.COMPLETED,
            passed=True
        ).count()

        passing_rate = 0
        if completed_attempts > 0:
            passing_rate = (passed_count / completed_attempts) * 100

        # Статистика по вопросам
        questions_stats = []
        for question in test.questions.all():
            total_answers = UserAnswer.objects.filter(question=question).count()
            correct_answers = UserAnswer.objects.filter(
                question=question,
                is_correct=True
            ).count()

            correct_percentage = 0
            if total_answers > 0:
                correct_percentage = (correct_answers / total_answers) * 100

            questions_stats.append({
                'id': question.id,
                'text': question.text,
                'total_answers': total_answers,
                'correct_answers': correct_answers,
                'correct_percentage': correct_percentage
            })

        # Формирование результата
        result = {
            'total_attempts': total_attempts,
            'completed_attempts': completed_attempts,
            'avg_score': avg_score,
            'passed_count': passed_count,
            'passing_rate': passing_rate,
            'questions_stats': questions_stats
        }

        return Response(result)

    def _update_attempt_progress(self, attempt):
        """Обновление прогресса попытки."""
        # Подсчет набранных баллов
        total_score = UserAnswer.objects.filter(
            attempt=attempt
        ).aggregate(total=Sum('points_earned'))['total'] or 0

        attempt.score = total_score

        # Вычисление процента правильных ответов
        if attempt.max_score > 0:
            score_percentage = (total_score / attempt.max_score) * 100
            attempt.score_percentage = score_percentage

            # Определение, пройден ли тест
            attempt.passed = (score_percentage >= attempt.test.passing_score)

        attempt.save()


class QuestionViewSet(viewsets.ModelViewSet):
    """Представление для работы с вопросами тестов."""

    queryset = Question.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsQuestionAuthorOrReadOnly]

    def get_serializer_class(self):
        """Выбор сериализатора в зависимости от прав пользователя."""
        if self.request.user.is_superuser or self.request.user.is_staff:
            return QuestionAdminSerializer
        return QuestionSerializer

    def get_queryset(self):
        """Фильтрация вопросов."""
        # Фильтрация по тесту
        test_id = self.request.query_params.get('test')
        if test_id:
            return Question.objects.filter(test__id=test_id)
        return Question.objects.all()

    def perform_create(self, serializer):
        """Проверка прав доступа при создании вопроса."""
        test = serializer.validated_data['test']
        user = self.request.user

        # Проверка, что пользователь является автором теста или администратором
        if user != test.author and not user.is_superuser and not user.is_staff:
            raise permissions.PermissionDenied(
                _("Вы не можете добавлять вопросы к этому тесту")
            )

        serializer.save()


class AnswerViewSet(viewsets.ModelViewSet):
    """Представление для работы с вариантами ответов."""

    queryset = Answer.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsQuestionAuthorOrReadOnly]

    def get_serializer_class(self):
        """Выбор сериализатора в зависимости от прав пользователя."""
        if self.request.user.is_superuser or self.request.user.is_staff:
            return AnswerAdminSerializer
        return AnswerSerializer

    def get_queryset(self):
        """Фильтрация вариантов ответов."""
        # Фильтрация по вопросу
        question_id = self.request.query_params.get('question')
        if question_id:
            return Answer.objects.filter(question__id=question_id)
        return Answer.objects.all()

    def perform_create(self, serializer):
        """Проверка прав доступа при создании варианта ответа."""
        question = serializer.validated_data['question']
        user = self.request.user

        # Проверка, что пользователь является автором теста или администратором
        if user != question.test.author and not user.is_superuser and not user.is_staff:
            raise permissions.PermissionDenied(
                _("Вы не можете добавлять варианты ответов к этому вопросу")
            )

        serializer.save()


class TestAttemptViewSet(viewsets.ReadOnlyModelViewSet):
    """Представление для просмотра попыток прохождения тестов."""

    queryset = TestAttempt.objects.all()
    serializer_class = TestAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Фильтрация попыток прохождения тестов."""
        user = self.request.user

        # Администраторы и персонал видят все попытки
        if user.is_superuser or user.is_staff:
            queryset = TestAttempt.objects.all()
        else:
            # Обычные пользователи видят только свои попытки
            queryset = TestAttempt.objects.filter(user=user)

        # Фильтрация по тесту
        test_id = self.request.query_params.get('test')
        if test_id:
            queryset = queryset.filter(test__id=test_id)

        # Фильтрация по пользователю
        user_id = self.request.query_params.get('user')
        if user_id and (user.is_superuser or user.is_staff):
            queryset = queryset.filter(user__id=user_id)

        # Фильтрация по статусу
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Фильтрация по результату
        passed = self.request.query_params.get('passed')
        if passed is not None:
            passed_bool = passed.lower() == 'true'
            queryset = queryset.filter(passed=passed_bool)

        return queryset

    @action(detail=False, methods=['get'])
    def my_attempts(self, request):
        """Получение попыток прохождения тестов текущим пользователем."""
        queryset = TestAttempt.objects.filter(user=request.user)

        # Фильтрация по статусу
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Фильтрация по результату
        passed = request.query_params.get('passed')
        if passed is not None:
            passed_bool = passed.lower() == 'true'
            queryset = queryset.filter(passed=passed_bool)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class TestAssignmentViewSet(viewsets.ModelViewSet):
    """Представление для работы с назначениями тестов."""

    queryset = TestAssignment.objects.all()
    serializer_class = TestAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsTestAssignmentCreatorOrReadOnly]

    def get_queryset(self):
        """Фильтрация назначений тестов."""
        user = self.request.user

        # Администраторы и персонал видят все назначения
        if user.is_superuser or user.is_staff:
            queryset = TestAssignment.objects.all()
        else:
            # Обычные пользователи видят назначения, которые они создали, и назначения для них
            queryset = TestAssignment.objects.filter(
                Q(assigned_by=user) |
                Q(user=user)
            )

        # Фильтрация по тесту
        test_id = self.request.query_params.get('test')
        if test_id:
            queryset = queryset.filter(test__id=test_id)

        # Фильтрация по пользователю
        user_id = self.request.query_params.get('user')
        if user_id:
            queryset = queryset.filter(user__id=user_id)

        # Фильтрация по статусу
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset

    def perform_create(self, serializer):
        """Установка пользователя, назначившего тест."""
        serializer.save(assigned_by=self.request.user)

    @action(detail=False, methods=['get'])
    def my_assignments(self, request):
        """Получение назначений тестов для текущего пользователя."""
        queryset = TestAssignment.objects.filter(user=request.user)

        # Фильтрация по статусу
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def bulk_assign(self, request):
        """Массовое назначение тестов."""
        # Проверка прав доступа
        if not request.user.is_superuser and not request.user.is_staff:
            return Response(
                {'error': _("У вас нет прав для массового назначения тестов")},
                status=status.HTTP_403_FORBIDDEN
            )

        # Валидация данных
        serializer = BulkTestAssignmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Получение параметров
        test_id = serializer.validated_data['test_id']
        user_ids = serializer.validated_data['user_ids']
        due_date = serializer.validated_data.get('due_date')
        notify_users = serializer.validated_data.get('notify_users', True)
        message = serializer.validated_data.get('message', '')

        # Проверка существования теста
        try:
            test = Test.objects.get(id=test_id)
        except Test.DoesNotExist:
            return Response(
                {'error': _("Тест не найден")},
                status=status.HTTP_404_NOT_FOUND
            )

        # Проверка статуса теста
        if test.status != Test.TestStatus.PUBLISHED:
            return Response(
                {'error': _("Можно назначать только опубликованные тесты")},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Создание назначений для каждого пользователя
        created_assignments = []
        errors = []

        with transaction.atomic():
            for user_id in user_ids:
                try:
                    # Проверка существования пользователя
                    user = User.objects.get(id=user_id)

                    # Проверка, что назначение уже существует
                    existing_assignment = TestAssignment.objects.filter(
                        test=test,
                        user=user
                    ).first()

                    if existing_assignment:
                        # Обновление существующего назначения
                        existing_assignment.due_date = due_date
                        existing_assignment.notify_user = notify_users
                        existing_assignment.message = message
                        existing_assignment.assigned_by = request.user
                        existing_assignment.assigned_at = timezone.now()
                        existing_assignment.status = TestAssignment.AssignmentStatus.PENDING
                        existing_assignment.completed_at = None
                        existing_assignment.save()

                        created_assignments.append(existing_assignment)
                    else:
                        # Создание нового назначения
                        assignment = TestAssignment.objects.create(
                            test=test,
                            user=user,
                            assigned_by=request.user,
                            due_date=due_date,
                            notify_user=notify_users,
                            message=message
                        )

                        created_assignments.append(assignment)

                except User.DoesNotExist:
                    errors.append({
                        'user_id': user_id,
                        'error': _("Пользователь не найден")
                    })

        # Формирование результата
        result = {
            'created_count': len(created_assignments),
            'errors': errors
        }

        return Response(result, status=status.HTTP_201_CREATED if created_assignments else status.HTTP_400_BAD_REQUEST)