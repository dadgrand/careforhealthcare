from datetime import datetime, timedelta
from django.db.models import Count, Sum, Avg, F, Q
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    PageView, UserSession, UserActivity,
    DailyStatistics, UserStatistics, PopularPage
)
from .serializers import (
    PageViewSerializer, UserSessionSerializer, UserActivitySerializer,
    DailyStatisticsSerializer, UserStatisticsSerializer, PopularPageSerializer,
    DateRangeSerializer, ActivityAnalyticsSerializer
)


class PageViewViewSet(viewsets.ModelViewSet):
    """Представление для работы с просмотрами страниц."""

    queryset = PageView.objects.all()
    serializer_class = PageViewSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get_queryset(self):
        """Фильтрация просмотров страниц."""
        queryset = PageView.objects.all()

        # Фильтрация по пользователю
        user_id = self.request.query_params.get('user')
        if user_id:
            queryset = queryset.filter(user__id=user_id)

        # Фильтрация по URL
        url = self.request.query_params.get('url')
        if url:
            queryset = queryset.filter(url__icontains=url)

        # Фильтрация по дате
        date_from = self.request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(viewed_at__gte=date_from)

        date_to = self.request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(viewed_at__lte=date_to)

        return queryset

    @action(detail=False, methods=['post'])
    def track(self, request):
        """Отслеживание просмотра страницы."""
        # Получаем данные из запроса
        url = request.data.get('url')
        path = request.data.get('path')
        referer = request.data.get('referer', '')
        session_id = request.data.get('session_id', '')

        if not url or not path:
            return Response(
                {'error': _('URL и путь обязательны для отслеживания.')},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Создаем запись о просмотре страницы
        page_view = PageView(
            user=request.user if request.user.is_authenticated else None,
            url=url,
            path=path,
            referer=referer,
            ip_address=request.META.get('REMOTE_ADDR', ''),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            session_id=session_id
        )

        # Определяем браузер, ОС и устройство
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        if user_agent:
            # Здесь можно использовать библиотеку user-agents для определения информации
            # Но для простоты просто заполняем базовую информацию
            if 'Chrome' in user_agent:
                page_view.browser = 'Chrome'
            elif 'Firefox' in user_agent:
                page_view.browser = 'Firefox'
            elif 'Safari' in user_agent:
                page_view.browser = 'Safari'
            elif 'Edge' in user_agent:
                page_view.browser = 'Edge'
            else:
                page_view.browser = 'Other'

            if 'Windows' in user_agent:
                page_view.os = 'Windows'
            elif 'Mac' in user_agent:
                page_view.os = 'MacOS'
            elif 'Linux' in user_agent:
                page_view.os = 'Linux'
            elif 'Android' in user_agent:
                page_view.os = 'Android'
            elif 'iOS' in user_agent:
                page_view.os = 'iOS'
            else:
                page_view.os = 'Other'

            if 'Mobile' in user_agent:
                page_view.device = 'Mobile'
            elif 'Tablet' in user_agent:
                page_view.device = 'Tablet'
            else:
                page_view.device = 'Desktop'

        page_view.save()

        # Обновляем или создаем сессию пользователя
        if session_id:
            session, created = UserSession.objects.get_or_create(
                session_id=session_id,
                defaults={
                    'user': request.user if request.user.is_authenticated else None,
                    'ip_address': request.META.get('REMOTE_ADDR', ''),
                    'user_agent': user_agent,
                    'browser': page_view.browser,
                    'os': page_view.os,
                    'device': page_view.device
                }
            )

            if not created:
                # Обновляем время окончания сессии
                session.end_time = timezone.now()

                # Обновляем продолжительность сессии
                if session.start_time:
                    duration = (session.end_time - session.start_time).total_seconds()
                    session.duration = int(duration)

                session.save()

        serializer = self.get_serializer(page_view)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UserSessionViewSet(viewsets.ReadOnlyModelViewSet):
    """Представление для просмотра сессий пользователей."""

    queryset = UserSession.objects.all()
    serializer_class = UserSessionSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get_queryset(self):
        """Фильтрация сессий пользователей."""
        queryset = UserSession.objects.all()

        # Фильтрация по пользователю
        user_id = self.request.query_params.get('user')
        if user_id:
            queryset = queryset.filter(user__id=user_id)

        # Фильтрация по сессии
        session_id = self.request.query_params.get('session_id')
        if session_id:
            queryset = queryset.filter(session_id=session_id)

        # Фильтрация по дате
        date_from = self.request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(start_time__gte=date_from)

        date_to = self.request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(start_time__lte=date_to)

        return queryset


class UserActivityViewSet(viewsets.ModelViewSet):
    """Представление для работы с активностями пользователей."""

    queryset = UserActivity.objects.all()
    serializer_class = UserActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Фильтрация активностей пользователей."""
        user = self.request.user

        # Администраторы видят все активности
        if user.is_superuser or user.is_staff:
            queryset = UserActivity.objects.all()
        else:
            # Обычные пользователи видят только свои активности
            queryset = UserActivity.objects.filter(user=user)

        # Фильтрация по пользователю
        user_id = self.request.query_params.get('user')
        if user_id and (user.is_superuser or user.is_staff):
            queryset = queryset.filter(user__id=user_id)

        # Фильтрация по типу активности
        activity_type = self.request.query_params.get('activity_type')
        if activity_type:
            queryset = queryset.filter(activity_type=activity_type)

        # Фильтрация по дате
        date_from = self.request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)

        date_to = self.request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)

        return queryset

    @action(detail=False, methods=['post'])
    def track(self, request):
        """Отслеживание активности пользователя."""
        # Проверка аутентификации
        if not request.user.is_authenticated:
            return Response(
                {'error': _('Для отслеживания активности необходима аутентификация.')},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Получаем данные из запроса
        activity_type = request.data.get('activity_type')
        description = request.data.get('description', '')
        content_type = request.data.get('content_type', '')
        object_id = request.data.get('object_id', '')

        if not activity_type:
            return Response(
                {'error': _('Тип активности обязателен.')},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Создаем запись об активности
        activity = UserActivity(
            user=request.user,
            activity_type=activity_type,
            description=description,
            ip_address=request.META.get('REMOTE_ADDR', ''),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            content_type=content_type,
            object_id=object_id
        )
        activity.save()

        serializer = self.get_serializer(activity)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DailyStatisticsViewSet(viewsets.ReadOnlyModelViewSet):
    """Представление для просмотра ежедневной статистики."""

    queryset = DailyStatistics.objects.all()
    serializer_class = DailyStatisticsSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get_queryset(self):
        """Фильтрация ежедневной статистики."""
        queryset = DailyStatistics.objects.all()

        # Фильтрация по дате
        date_from = self.request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(date__gte=date_from)

        date_to = self.request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(date__lte=date_to)

        # Сортировка
        ordering = self.request.query_params.get('ordering', '-date')
        if ordering:
            queryset = queryset.order_by(ordering)

        return queryset

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Получение сводной статистики."""
        # Валидация параметров запроса
        serializer = DateRangeSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        start_date = serializer.validated_data['start_date']
        end_date = serializer.validated_data['end_date']

        # Получаем статистику за указанный период
        statistics = DailyStatistics.objects.filter(date__gte=start_date, date__lte=end_date)

        # Вычисляем агрегированные значения
        summary = statistics.aggregate(
            total_views=Sum('total_views'),
            unique_visitors=Sum('unique_visitors'),
            new_users=Sum('new_users'),
            active_users=Avg('active_users'),
            average_session_duration=Avg('average_session_duration'),
            total_sessions=Sum('total_sessions'),
            files_uploaded=Sum('files_uploaded'),
            files_downloaded=Sum('files_downloaded'),
            tests_started=Sum('tests_started'),
            tests_completed=Sum('tests_completed')
        )

        # Добавляем период
        summary['period'] = {
            'start_date': start_date,
            'end_date': end_date,
            'days': (end_date - start_date).days + 1
        }

        return Response(summary)


class UserStatisticsViewSet(viewsets.ReadOnlyModelViewSet):
    """Представление для просмотра статистики пользователей."""

    queryset = UserStatistics.objects.all()
    serializer_class = UserStatisticsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Фильтрация статистики пользователей."""
        user = self.request.user

        # Администраторы видят статистику всех пользователей
        if user.is_superuser or user.is_staff:
            queryset = UserStatistics.objects.all()
        else:
            # Обычные пользователи видят только свою статистику
            queryset = UserStatistics.objects.filter(user=user)

        # Фильтрация по пользователю
        user_id = self.request.query_params.get('user')
        if user_id and (user.is_superuser or user.is_staff):
            queryset = queryset.filter(user__id=user_id)

        # Фильтрация по отделению
        department_id = self.request.query_params.get('department')
        if department_id and (user.is_superuser or user.is_staff):
            queryset = queryset.filter(user__department__id=department_id)

        # Фильтрация по специализации
        specialization_id = self.request.query_params.get('specialization')
        if specialization_id and (user.is_superuser or user.is_staff):
            queryset = queryset.filter(user__specialization__id=specialization_id)

        # Сортировка
        ordering = self.request.query_params.get('ordering', '-total_page_views')
        if ordering:
            queryset = queryset.order_by(ordering)

        return queryset

    @action(detail=False, methods=['get'])
    def my_statistics(self, request):
        """Получение статистики текущего пользователя."""
        user = request.user

        if not user.is_authenticated:
            return Response(
                {'error': _('Для получения статистики необходима аутентификация.')},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            statistics = UserStatistics.objects.get(user=user)
            serializer = self.get_serializer(statistics)
            return Response(serializer.data)
        except UserStatistics.DoesNotExist:
            return Response(
                {'error': _('Статистика для данного пользователя не найдена.')},
                status=status.HTTP_404_NOT_FOUND
            )


class PopularPageViewSet(viewsets.ReadOnlyModelViewSet):
    """Представление для просмотра популярных страниц."""

    queryset = PopularPage.objects.all()
    serializer_class = PopularPageSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get_queryset(self):
        """Фильтрация популярных страниц."""
        queryset = PopularPage.objects.all()

        # Фильтрация по дате
        date_from = self.request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(date__gte=date_from)

        date_to = self.request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(date__lte=date_to)

        # Фильтрация по URL
        url = self.request.query_params.get('url')
        if url:
            queryset = queryset.filter(url__icontains=url)

        # Сортировка
        ordering = self.request.query_params.get('ordering', '-views_count')
        if ordering:
            queryset = queryset.order_by(ordering)

        return queryset

    @action(detail=False, methods=['get'])
    def top_pages(self, request):
        """Получение топ страниц за период."""
        # Валидация параметров запроса
        serializer = DateRangeSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        start_date = serializer.validated_data['start_date']
        end_date = serializer.validated_data['end_date']

        # Получаем лимит
        limit = int(request.query_params.get('limit', 10))

        # Получаем популярные страницы за указанный период
        pages = PopularPage.objects.filter(date__gte=start_date, date__lte=end_date)

        # Агрегируем данные по URL
        pages_data = pages.values('url', 'title').annotate(
            total_views=Sum('views_count'),
            total_visitors=Sum('unique_visitors')
        ).order_by('-total_views')[:limit]

        return Response(pages_data)


class AnalyticsViewSet(viewsets.ViewSet):
    """Представление для получения аналитических данных."""

    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    @action(detail=False, methods=['get'])
    def user_activity(self, request):
        """Получение аналитики по активности пользователей."""
        # Валидация параметров запроса
        serializer = ActivityAnalyticsSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)

        # Получаем параметры
        activity_type = serializer.validated_data.get('activity_type')
        start_date = serializer.validated_data.get('start_date')
        end_date = serializer.validated_data.get('end_date')
        user_id = serializer.validated_data.get('user_id')
        department_id = serializer.validated_data.get('department_id')
        specialization_id = serializer.validated_data.get('specialization_id')

        # Формируем базовый запрос
        query = Q()

        if activity_type:
            query &= Q(activity_type=activity_type)

        if start_date:
            query &= Q(created_at__date__gte=start_date)

        if end_date:
            query &= Q(created_at__date__lte=end_date)

        if user_id:
            query &= Q(user__id=user_id)

        if department_id:
            query &= Q(user__department__id=department_id)

        if specialization_id:
            query &= Q(user__specialization__id=specialization_id)

        # Получаем данные по дням
        daily_data = UserActivity.objects.filter(query).extra(
            select={'day': "DATE(created_at)"}
        ).values('day', 'activity_type').annotate(count=Count('id')).order_by('day', 'activity_type')

        # Группируем данные по дням
        result = {}
        for item in daily_data:
            day = item['day'].strftime('%Y-%m-%d')
            if day not in result:
                result[day] = {}

            activity_type = item['activity_type']
            result[day][activity_type] = item['count']

        # Форматируем результат
        formatted_result = []
        for day, activities in result.items():
            day_data = {'date': day}
            day_data.update(activities)
            formatted_result.append(day_data)

        return Response(formatted_result)

    @action(detail=False, methods=['get'])
    def user_statistics_summary(self, request):
        """Получение сводной статистики по пользователям."""
        # Формируем базовый запрос
        queryset = UserStatistics.objects.all()

        # Фильтрация по отделению
        department_id = request.query_params.get('department')
        if department_id:
            queryset = queryset.filter(user__department__id=department_id)

        # Фильтрация по специализации
        specialization_id = request.query_params.get('specialization')
        if specialization_id:
            queryset = queryset.filter(user__specialization__id=specialization_id)

        # Фильтрация по роли
        role = request.query_params.get('role')
        if role:
            queryset = queryset.filter(user__role=role)

        # Вычисляем агрегированные значения
        summary = queryset.aggregate(
            avg_login_count=Avg('login_count'),
            avg_session_duration=Avg('average_session_duration'),
            avg_page_views=Avg('total_page_views'),
            avg_files_uploaded=Avg('files_uploaded'),
            avg_files_downloaded=Avg('files_downloaded'),
            avg_tests_started=Avg('tests_started'),
            avg_tests_completed=Avg('tests_completed'),
            avg_tests_passed=Avg('tests_passed'),
            total_users=Count('id')
        )

        # Добавляем дополнительные данные
        summary['users_by_role'] = list(
            queryset.values('user__role').annotate(count=Count('id'))
        )

        summary['users_by_department'] = list(
            queryset.values('user__department__name').annotate(count=Count('id'))
        )

        summary['users_by_specialization'] = list(
            queryset.values('user__specialization__name').annotate(count=Count('id'))
        )

        return Response(summary)

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Получение данных для дашборда."""
        # Получаем данные за последние 30 дней
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=29)

        # Получаем ежедневную статистику
        daily_stats = DailyStatistics.objects.filter(
            date__gte=start_date,
            date__lte=end_date
        ).order_by('date')

        # Получаем пользовательскую статистику
        user_stats = UserStatistics.objects.all()

        # Получаем популярные страницы
        popular_pages = PopularPage.objects.filter(
            date__gte=start_date,
            date__lte=end_date
        ).values('url', 'title').annotate(
            total_views=Sum('views_count')
        ).order_by('-total_views')[:5]

        # Формируем сводные данные
        summary = daily_stats.aggregate(
            total_views=Sum('total_views'),
            unique_visitors=Sum('unique_visitors'),
            new_users=Sum('new_users'),
            average_session_duration=Avg('average_session_duration'),
            files_uploaded=Sum('files_uploaded'),
            files_downloaded=Sum('files_downloaded'),
            tests_started=Sum('tests_started'),
            tests_completed=Sum('tests_completed')
        )

        # Формируем результат
        result = {
            'summary': summary,
            'daily_stats': DailyStatisticsSerializer(daily_stats, many=True).data,
            'popular_pages': list(popular_pages),
            'active_users': user_stats.count(),
            'users_by_role': list(
                user_stats.values('user__role').annotate(count=Count('id'))
            ),
            'users_by_department': list(
                user_stats.values('user__department__name').annotate(count=Count('id'))
            ),
            'period': {
                'start_date': start_date.strftime('%Y-%m-%d'),
                'end_date': end_date.strftime('%Y-%m-%d'),
                'days': 30
            }
        }

        return Response(result)