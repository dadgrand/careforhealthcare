from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Department, Specialization, UserProfile, LoginHistory

User = get_user_model()


class DepartmentSerializer(serializers.ModelSerializer):
    """Сериализатор для модели Department."""

    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class SpecializationSerializer(serializers.ModelSerializer):
    """Сериализатор для модели Specialization."""

    class Meta:
        model = Specialization
        fields = ['id', 'name', 'description', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class UserProfileSerializer(serializers.ModelSerializer):
    """Сериализатор для модели UserProfile."""

    class Meta:
        model = UserProfile
        fields = [
            'id', 'bio', 'birth_date', 'address', 'position',
            'experience_years', 'education', 'certificates',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    """Сериализатор для модели User."""

    profile = UserProfileSerializer(required=False)
    department_details = DepartmentSerializer(source='department', read_only=True)
    specialization_details = SpecializationSerializer(source='specialization', read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'patronymic',
            'role', 'department', 'specialization', 'phone', 'avatar',
            'is_active', 'date_joined', 'last_login', 'profile',
            'department_details', 'specialization_details', 'full_name'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']
        extra_kwargs = {
            'department': {'write_only': True},
            'specialization': {'write_only': True},
        }

    def get_full_name(self, obj):
        """Получить полное имя пользователя."""
        return obj.get_full_name()

    def create(self, validated_data):
        """Создание пользователя с профилем."""
        profile_data = validated_data.pop('profile', None)
        user = User.objects.create_user(**validated_data)

        if profile_data:
            UserProfile.objects.create(user=user, **profile_data)
        return user

    def update(self, instance, validated_data):
        """Обновление пользователя с профилем."""
        profile_data = validated_data.pop('profile', None)

        # Обновляем пользователя
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Обновляем или создаем профиль
        if profile_data:
            profile, created = UserProfile.objects.get_or_create(user=instance)
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()

        return instance


class RegisterSerializer(serializers.ModelSerializer):
    """Сериализатор для регистрации пользователя."""

    password = serializers.CharField(
        write_only=True, required=True,
        style={'input_type': 'password'},
        validators=[validate_password]
    )
    password2 = serializers.CharField(
        write_only=True, required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = [
            'email', 'password', 'password2', 'first_name',
            'last_name', 'patronymic', 'role'
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def validate(self, attrs):
        """Проверка паролей на совпадение."""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": _("Пароли не совпадают.")}
            )
        return attrs

    def create(self, validated_data):
        """Создание нового пользователя."""
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)

        # Создаем пустой профиль
        UserProfile.objects.create(user=user)

        return user


class ChangePasswordSerializer(serializers.Serializer):
    """Сериализатор для смены пароля."""

    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True)

    def validate(self, attrs):
        """Проверка новых паролей на совпадение."""
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationParser(
                {"new_password": _("Новые пароли не совпадают.")}
            )
        return attrs


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Кастомный сериализатор для получения JWT токенов."""

    @classmethod
    def get_token(cls, user):
        """Добавление дополнительной информации в JWT токен."""
        token = super().get_token(user)

        # Добавляем кастомные поля в токен
        token['email'] = user.email
        token['role'] = user.role
        token['full_name'] = user.get_full_name()

        return token

    def validate(self, attrs):
        """Переопределяем метод для записи информации о входе."""
        data = super().validate(attrs)

        # Добавляем в ответ дополнительную информацию о пользователе
        data['user_id'] = str(self.user.id)
        data['email'] = self.user.email
        data['role'] = self.user.role
        data['full_name'] = self.user.get_full_name()

        # Запись информации о входе будет происходить в сигналах

        return data


class LoginHistorySerializer(serializers.ModelSerializer):
    """Сериализатор для истории входов."""

    user_email = serializers.SerializerMethodField()

    class Meta:
        model = LoginHistory
        fields = ['id', 'user', 'user_email', 'ip_address', 'user_agent', 'login_time', 'successful']
        read_only_fields = fields

    def get_user_email(self, obj):
        """Получить email пользователя."""
        return obj.user.email if obj.user else None