from rest_framework import serializers

from .models import (
    PageView, UserSession, UserActivity,
    DailyStatistics, UserStatistics, PopularPage
)


class PageViewSerializer(serializers.ModelSerializer):
    """Сериализатор для модели PageView."""

    user_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = PageView
        fields = [
            'id', 'user', 'url', 'path', 'referer', 'ip_address',
            'user_agent', 'browser', 'os', 'device', 'session_id',
            'viewed_at', 'user_details'
        ]
        read_only_fields = ['viewed_at']

    def get_user_details(self, obj):
        """Получение информации о пользователе."""
        if obj.user:
            return {
                'id': obj.user.id,
                'email': obj.user.email,
                'full_name': obj.user.get_full_name()
            }
        return None


class UserSessionSerializer(serializers.ModelSerializer):
    """Сериализатор для модели UserSession."""

    user_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = UserSession
        fields = [
            'id', 'user', 'session_id', 'ip_address', 'user_agent',
            'browser', 'os', 'device', 'start_time', 'end_time',
            'duration', 'user_details'
        ]
        read_only_fields = ['start_time', 'end_time', 'duration']

    def get_user_details(self, obj):
        """Получение информации о пользователе."""
        if obj.user:
            return {
                'id': obj.user.id,
                'email': obj.user.email,
                'full_name': obj.user.get_full_name()
            }
        return None


class UserActivitySerializer(serializers.ModelSerializer):
    """Сериализатор для модели UserActivity."""

    user_details = serializers.SerializerMethodField(read_only=True)
    activity_type_display = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = UserActivity
        fields = [
            'id', 'user', 'activity_type', 'description', 'ip_address',
            'user_agent', 'created_at', 'content_type', 'object_id',
            'user_details', 'activity_type_display'
        ]
        read_only_fields = ['created_at']

    def get_user_details(self, obj):
        """Получение информации о пользователе."""
        return {
            'id': obj.user.id,
            'email': obj.user.email,
            'full_name': obj.user.get_full_name()
        }

    def get_activity_type_display(self, obj):
        """Получение отображаемого значения типа активности."""
        return obj.get_activity_type_display()


class DailyStatisticsSerializer(serializers.ModelSerializer):
    """Сериализатор для модели DailyStatistics."""

    class Meta:
        model = DailyStatistics
        fields = [
            'id', 'date', 'total_views', 'unique_visitors',
            'registered_users', 'new_users', 'active_users',
            'average_session_duration', 'total_sessions',
            'files_uploaded', 'files_downloaded',
            'tests_started', 'tests_completed'
        ]
        read_only_fields = fields


class UserStatisticsSerializer(serializers.ModelSerializer):
    """Сериализатор для модели UserStatistics."""

    user_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = UserStatistics
        fields = [
            'id', 'user', 'last_login', 'login_count',
            'total_session_duration', 'average_session_duration',
            'total_page_views', 'files_uploaded', 'files_downloaded',
            'tests_started', 'tests_completed', 'tests_passed',
            'user_details'
        ]
        read_only_fields = fields

    def get_user_details(self, obj):
        """Получение информации о пользователе."""
        return {
            'id': obj.user.id,
            'email': obj.user.email,
            'full_name': obj.user.get_full_name(),
            'role': obj.user.role,
            'department': obj.user.department.name if obj.user.department else None,
            'specialization': obj.user.specialization.name if obj.user.specialization else None
        }


class PopularPageSerializer(serializers.ModelSerializer):
    """Сериализатор для модели PopularPage."""

    class Meta:
        model = PopularPage
        fields = [
            'id', 'url', 'title', 'views_count',
            'unique_visitors', 'date'
        ]
        read_only_fields = fields


class DateRangeSerializer(serializers.Serializer):
    """Сериализатор для выбора диапазона дат."""

    start_date = serializers.DateField(required=True)
    end_date = serializers.DateField(required=True)


class ActivityAnalyticsSerializer(serializers.Serializer):
    """Сериализатор для аналитики активности пользователей."""

    activity_type = serializers.ChoiceField(choices=UserActivity.ActivityType.choices, required=False)
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    user_id = serializers.UUIDField(required=False)
    department_id = serializers.IntegerField(required=False)
    specialization_id = serializers.IntegerField(required=False)