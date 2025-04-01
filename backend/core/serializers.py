from rest_framework import serializers

from .models import SystemSetting, SystemBackup, SystemLog, SystemHealth


class SystemSettingSerializer(serializers.ModelSerializer):
    """Сериализатор для модели SystemSetting."""

    class Meta:
        model = SystemSetting
        fields = ['id', 'key', 'value', 'description', 'is_public', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class SystemBackupSerializer(serializers.ModelSerializer):
    """Сериализатор для модели SystemBackup."""

    backup_type_display = serializers.SerializerMethodField(read_only=True)
    status_display = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = SystemBackup
        fields = [
            'id', 'backup_type', 'status', 'backup_file', 'size',
            'checksum', 'error_message', 'created_at', 'completed_at',
            'backup_type_display', 'status_display'
        ]
        read_only_fields = ['created_at', 'completed_at', 'size', 'checksum']

    def get_backup_type_display(self, obj):
        """Получение отображаемого значения типа резервной копии."""
        return obj.get_backup_type_display()

    def get_status_display(self, obj):
        """Получение отображаемого значения статуса."""
        return obj.get_status_display()


class SystemLogSerializer(serializers.ModelSerializer):
    """Сериализатор для модели SystemLog."""

    level_display = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = SystemLog
        fields = [
            'id', 'level', 'module', 'message', 'stack_trace',
            'created_at', 'level_display'
        ]
        read_only_fields = ['created_at']

    def get_level_display(self, obj):
        """Получение отображаемого значения уровня логирования."""
        return obj.get_level_display()


class SystemHealthSerializer(serializers.ModelSerializer):
    """Сериализатор для модели SystemHealth."""

    status_display = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = SystemHealth
        fields = [
            'id', 'component', 'status', 'details',
            'last_checked', 'created_at', 'status_display'
        ]
        read_only_fields = ['last_checked', 'created_at']

    def get_status_display(self, obj):
        """Получение отображаемого значения статуса."""
        return obj.get_status_display()