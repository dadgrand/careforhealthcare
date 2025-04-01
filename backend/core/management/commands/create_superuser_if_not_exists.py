import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    """Команда Django для создания суперпользователя, если он не существует."""

    help = 'Создать суперпользователя, если он не существует'

    def handle(self, *args, **options):
        """Выполнение команды."""
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin')
        first_name = os.environ.get('DJANGO_SUPERUSER_FIRST_NAME', 'Admin')
        last_name = os.environ.get('DJANGO_SUPERUSER_LAST_NAME', 'User')

        if not User.objects.filter(email=email).exists():
            self.stdout.write(f'Создание суперпользователя с email: {email}')
            User.objects.create_superuser(
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            self.stdout.write(self.style.SUCCESS(f'Суперпользователь создан: {email}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Суперпользователь уже существует: {email}'))