import magic
import hashlib
from django.utils import timezone
from rest_framework import serializers

from .models import (
    FileCategory, File, FileAccess, FileVerification,
    FileVersion, FileDownloadHistory
)


class FileCategorySerializer(serializers.ModelSerializer):
    """Сериализатор для модели FileCategory."""

    class Meta:
        model = FileCategory
        fields = ['id', 'name', 'description', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class FileAccessSerializer(serializers.ModelSerializer):
    """Сериализатор для модели FileAccess."""

    user_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = FileAccess
        fields = ['id', 'file', 'user', 'permission_type', 'created_at', 'updated_at', 'user_details']
        read_only_fields = ['created_at', 'updated_at']

    def get_user_details(self, obj):
        """Получение информации о пользователе."""
        return {
            'id': obj.user.id,
            'email': obj.user.email,
            'full_name': obj.user.get_full_name(),
            'role': obj.user.role
        }


class FileVerificationSerializer(serializers.ModelSerializer):
    """Сериализатор для модели FileVerification."""

    requested_by_details = serializers.SerializerMethodField(read_only=True)
    verified_by_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = FileVerification
        fields = [
            'id', 'file', 'requested_by', 'verified_by', 'status',
            'comment', 'requested_at', 'verified_at',
            'requested_by_details', 'verified_by_details'
        ]
        read_only_fields = ['requested_at', 'verified_at']

    def get_requested_by_details(self, obj):
        """Получение информации о пользователе, запросившем верификацию."""
        return {
            'id': obj.requested_by.id,
            'email': obj.requested_by.email,
            'full_name': obj.requested_by.get_full_name()
        }

    def get_verified_by_details(self, obj):
        """Получение информации о пользователе, выполнившем верификацию."""
        if obj.verified_by:
            return {
                'id': obj.verified_by.id,
                'email': obj.verified_by.email,
                'full_name': obj.verified_by.get_full_name()
            }
        return None

    def update(self, instance, validated_data):
        """Обновление статуса верификации."""
        status = validated_data.get('status')
        if status and status != instance.status:
            # Если меняется статус, устанавливаем дату верификации
            if status in [FileVerification.VerificationStatus.APPROVED, FileVerification.VerificationStatus.REJECTED]:
                instance.verified_at = timezone.now()
                instance.verified_by = self.context['request'].user

        return super().update(instance, validated_data)


class FileVersionSerializer(serializers.ModelSerializer):
    """Сериализатор для модели FileVersion."""

    created_by_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = FileVersion
        fields = [
            'id', 'file', 'file_content', 'version_number',
            'created_by', 'comment', 'created_at', 'created_by_details'
        ]
        read_only_fields = ['created_at', 'version_number']

    def get_created_by_details(self, obj):
        """Получение информации о пользователе, создавшем версию."""
        return {
            'id': obj.created_by.id,
            'email': obj.created_by.email,
            'full_name': obj.created_by.get_full_name()
        }

    def create(self, validated_data):
        """Создание новой версии файла."""
        # Получаем файл, к которому добавляется версия
        file = validated_data.get('file')

        # Определяем номер новой версии
        latest_version = FileVersion.objects.filter(file=file).order_by('-version_number').first()
        version_number = 1
        if latest_version:
            version_number = latest_version.version_number + 1

        # Устанавливаем номер версии
        validated_data['version_number'] = version_number

        return super().create(validated_data)


class FileSerializer(serializers.ModelSerializer):
    """Сериализатор для модели File."""

    category_details = FileCategorySerializer(source='category', read_only=True)
    owner_details = serializers.SerializerMethodField(read_only=True)
    access_rights = FileAccessSerializer(many=True, read_only=True)
    verifications = FileVerificationSerializer(many=True, read_only=True)
    versions = FileVersionSerializer(many=True, read_only=True)

    class Meta:
        model = File
        fields = [
            'id', 'title', 'description', 'file', 'file_size',
            'file_type', 'mime_type', 'category', 'access_level',
            'owner', 'created_at', 'updated_at', 'checksum',
            'category_details', 'owner_details', 'access_rights',
            'verifications', 'versions'
        ]
        read_only_fields = ['file_size', 'mime_type', 'checksum', 'created_at', 'updated_at']

    def get_owner_details(self, obj):
        """Получение информации о владельце файла."""
        return {
            'id': obj.owner.id,
            'email': obj.owner.email,
            'full_name': obj.owner.get_full_name()
        }

    def create(self, validated_data):
        """Создание нового файла с дополнительной обработкой."""
        file = validated_data.get('file')

        # Определяем MIME тип файла
        mime = magic.Magic(mime=True)
        mime_type = mime.from_buffer(file.read())
        file.seek(0)  # Сбрасываем указатель чтения

        # Рассчитываем контрольную сумму
        sha256 = hashlib.sha256()
        for chunk in file.chunks():
            sha256.update(chunk)
        checksum = sha256.hexdigest()

        # Устанавливаем дополнительные поля
        validated_data['mime_type'] = mime_type
        validated_data['checksum'] = checksum
        validated_data['file_size'] = file.size

        # Создаем экземпляр файла
        file_instance = super().create(validated_data)

        # Создаем первую версию файла
        FileVersion.objects.create(
            file=file_instance,
            file_content=file,
            version_number=1,
            created_by=validated_data['owner'],
            comment="Первая версия"
        )

        return file_instance


class FileDownloadHistorySerializer(serializers.ModelSerializer):
    """Сериализатор для модели FileDownloadHistory."""

    user_details = serializers.SerializerMethodField(read_only=True)
    file_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = FileDownloadHistory
        fields = [
            'id', 'file', 'user', 'downloaded_at', 'ip_address',
            'user_agent', 'user_details', 'file_details'
        ]
        read_only_fields = fields

    def get_user_details(self, obj):
        """Получение информации о пользователе."""
        return {
            'id': obj.user.id,
            'email': obj.user.email,
            'full_name': obj.user.get_full_name()
        }

    def get_file_details(self, obj):
        """Получение информации о файле."""
        return {
            'id': obj.file.id,
            'title': obj.file.title,
            'file_type': obj.file.file_type
        }