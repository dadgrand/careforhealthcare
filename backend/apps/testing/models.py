import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()


class TestCategory(models.Model):
    """Модель категории тестов."""

    name = models.CharField(_('Название'), max_length=100)
    description = models.TextField(_('Описание'), blank=True)
    is_active = models.BooleanField(_('Активна'), default=True)
    created_at = models.DateTimeField(_('Дата создания'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Дата обновления'), auto_now=True)

    class Meta:
        verbose_name = _('Категория тестов')
        verbose_name_plural = _('Категории тестов')
        ordering = ['name']

    def __str__(self):
        return self.name


class Test(models.Model):
    """Модель теста."""

    class TestStatus(models.TextChoices):
        DRAFT = 'draft', _('Черновик')
        PUBLISHED = 'published', _('Опубликован')
        ARCHIVED = 'archived', _('В архиве')

    class TestType(models.TextChoices):
        KNOWLEDGE = 'knowledge', _('Проверка знаний')
        CERTIFICATION = 'certification', _('Сертификация')
        SURVEY = 'survey', _('Опрос')
        TRAINING = 'training', _('Обучение')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(_('Заголовок'), max_length=255)
    description = models.TextField(_('Описание'), blank=True)
    category = models.ForeignKey(
        TestCategory,
        verbose_name=_('Категория'),
        related_name='tests',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    author = models.ForeignKey(
        User,
        verbose_name=_('Автор'),
        related_name='created_tests',
        on_delete=models.CASCADE
    )
    status = models.CharField(
        _('Статус'),
        max_length=20,
        choices=TestStatus.choices,
        default=TestStatus.DRAFT
    )
    test_type = models.CharField(
        _('Тип теста'),
        max_length=20,
        choices=TestType.choices,
        default=TestType.KNOWLEDGE
    )
    time_limit = models.PositiveIntegerField(
        _('Ограничение по времени (мин)'),
        default=0,
        help_text=_('0 означает отсутствие ограничения по времени')
    )
    passing_score = models.PositiveIntegerField(
        _('Проходной балл (%)'),
        default=70
    )
    max_attempts = models.PositiveIntegerField(
        _('Максимальное количество попыток'),
        default=0,
        help_text=_('0 означает неограниченное количество попыток')
    )
    randomize_questions = models.BooleanField(
        _('Перемешивать вопросы'),
        default=True
    )
    show_answers = models.BooleanField(
        _('Показывать правильные ответы'),
        default=True
    )
    is_required = models.BooleanField(
        _('Обязательный'),
        default=False
    )
    required_departments = models.ManyToManyField(
        'accounts.Department',
        verbose_name=_('Обязательно для отделений'),
        related_name='required_tests',
        blank=True
    )
    required_specializations = models.ManyToManyField(
        'accounts.Specialization',
        verbose_name=_('Обязательно для специализаций'),
        related_name='required_tests',
        blank=True
    )
    created_at = models.DateTimeField(_('Дата создания'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Дата обновления'), auto_now=True)
    published_at = models.DateTimeField(_('Дата публикации'), null=True, blank=True)
    deadline = models.DateTimeField(_('Срок сдачи'), null=True, blank=True)

    class Meta:
        verbose_name = _('Тест')
        verbose_name_plural = _('Тесты')
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Question(models.Model):
    """Модель вопроса теста."""

    class QuestionType(models.TextChoices):
        SINGLE = 'single', _('Один вариант')
        MULTIPLE = 'multiple', _('Несколько вариантов')
        TEXT = 'text', _('Текстовый ответ')
        NUMERIC = 'numeric', _('Числовой ответ')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    test = models.ForeignKey(
        Test,
        verbose_name=_('Тест'),
        related_name='questions',
        on_delete=models.CASCADE
    )
    text = models.TextField(_('Текст вопроса'))
    question_type = models.CharField(
        _('Тип вопроса'),
        max_length=20,
        choices=QuestionType.choices,
        default=QuestionType.SINGLE
    )
    image = models.ImageField(
        _('Изображение'),
        upload_to='tests/questions/',
        null=True,
        blank=True
    )
    points = models.PositiveIntegerField(_('Баллы'), default=1)
    order = models.PositiveIntegerField(_('Порядок'), default=0)
    is_required = models.BooleanField(_('Обязательный'), default=True)
    explanation = models.TextField(_('Пояснение'), blank=True)
    created_at = models.DateTimeField(_('Дата создания'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Дата обновления'), auto_now=True)

    class Meta:
        verbose_name = _('Вопрос')
        verbose_name_plural = _('Вопросы')
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.test.title} - {self.text[:50]}"


class Answer(models.Model):
    """Модель варианта ответа."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.ForeignKey(
        Question,
        verbose_name=_('Вопрос'),
        related_name='answers',
        on_delete=models.CASCADE
    )
    text = models.TextField(_('Текст ответа'))
    is_correct = models.BooleanField(_('Правильный'), default=False)
    order = models.PositiveIntegerField(_('Порядок'), default=0)
    created_at = models.DateTimeField(_('Дата создания'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Дата обновления'), auto_now=True)

    class Meta:
        verbose_name = _('Вариант ответа')
        verbose_name_plural = _('Варианты ответов')
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.question.text[:30]} - {self.text[:30]}"


class TestAttempt(models.Model):
    """Модель попытки прохождения теста."""

    class AttemptStatus(models.TextChoices):
        IN_PROGRESS = 'in_progress', _('В процессе')
        COMPLETED = 'completed', _('Завершено')
        TIMED_OUT = 'timed_out', _('Время истекло')
        ABANDONED = 'abandoned', _('Прервано')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    test = models.ForeignKey(
        Test,
        verbose_name=_('Тест'),
        related_name='attempts',
        on_delete=models.CASCADE
    )
    user = models.ForeignKey(
        User,
        verbose_name=_('Пользователь'),
        related_name='test_attempts',
        on_delete=models.CASCADE
    )
    started_at = models.DateTimeField(_('Время начала'), auto_now_add=True)
    completed_at = models.DateTimeField(_('Время завершения'), null=True, blank=True)
    status = models.CharField(
        _('Статус'),
        max_length=20,
        choices=AttemptStatus.choices,
        default=AttemptStatus.IN_PROGRESS
    )
    score = models.PositiveIntegerField(_('Баллы'), default=0)
    max_score = models.PositiveIntegerField(_('Максимально возможные баллы'), default=0)
    score_percentage = models.DecimalField(
        _('Процент правильных ответов'),
        max_digits=5,
        decimal_places=2,
        default=0
    )
    passed = models.BooleanField(_('Пройден'), default=False)
    time_spent = models.PositiveIntegerField(
        _('Затраченное время (сек)'),
        default=0
    )
    attempt_number = models.PositiveIntegerField(_('Номер попытки'), default=1)

    class Meta:
        verbose_name = _('Попытка прохождения теста')
        verbose_name_plural = _('Попытки прохождения тестов')
        ordering = ['-started_at']
        unique_together = ['test', 'user', 'attempt_number']

    def __str__(self):
        return f"{self.user} - {self.test.title} - Попытка {self.attempt_number}"


class UserAnswer(models.Model):
    """Модель ответа пользователя."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    attempt = models.ForeignKey(
        TestAttempt,
        verbose_name=_('Попытка'),
        related_name='user_answers',
        on_delete=models.CASCADE
    )
    question = models.ForeignKey(
        Question,
        verbose_name=_('Вопрос'),
        related_name='user_answers',
        on_delete=models.CASCADE
    )
    selected_answers = models.ManyToManyField(
        Answer,
        verbose_name=_('Выбранные ответы'),
        related_name='user_selections',
        blank=True
    )
    text_answer = models.TextField(_('Текстовый ответ'), blank=True)
    numeric_answer = models.DecimalField(
        _('Числовой ответ'),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    is_correct = models.BooleanField(_('Правильно'), default=False)
    points_earned = models.PositiveIntegerField(_('Заработанные баллы'), default=0)
    created_at = models.DateTimeField(_('Дата создания'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Дата обновления'), auto_now=True)

    class Meta:
        verbose_name = _('Ответ пользователя')
        verbose_name_plural = _('Ответы пользователей')
        unique_together = ['attempt', 'question']

    def __str__(self):
        return f"{self.attempt.user} - {self.question.text[:30]}"


class TestAssignment(models.Model):
    """Модель назначения теста пользователям."""

    class AssignmentStatus(models.TextChoices):
        PENDING = 'pending', _('Ожидает выполнения')
        COMPLETED = 'completed', _('Выполнено')
        EXPIRED = 'expired', _('Просрочено')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    test = models.ForeignKey(
        Test,
        verbose_name=_('Тест'),
        related_name='assignments',
        on_delete=models.CASCADE
    )
    user = models.ForeignKey(
        User,
        verbose_name=_('Пользователь'),
        related_name='test_assignments',
        on_delete=models.CASCADE
    )
    assigned_by = models.ForeignKey(
        User,
        verbose_name=_('Назначил'),
        related_name='assigned_tests',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    status = models.CharField(
        _('Статус'),
        max_length=20,
        choices=AssignmentStatus.choices,
        default=AssignmentStatus.PENDING
    )
    due_date = models.DateTimeField(_('Срок сдачи'), null=True, blank=True)
    assigned_at = models.DateTimeField(_('Дата назначения'), auto_now_add=True)
    completed_at = models.DateTimeField(_('Дата выполнения'), null=True, blank=True)
    notify_user = models.BooleanField(_('Уведомить пользователя'), default=True)
    message = models.TextField(_('Сообщение'), blank=True)

    class Meta:
        verbose_name = _('Назначение теста')
        verbose_name_plural = _('Назначения тестов')
        ordering = ['-assigned_at']
        unique_together = ['test', 'user']

    def __str__(self):
        return f"{self.test.title} - {self.user}"