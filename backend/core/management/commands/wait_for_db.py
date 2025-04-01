import time
from django.db import connection
from django.db.utils import OperationalError
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    """Команда Django для ожидания доступности базы данных."""

    help = 'Ожидание готовности базы данных'

    def handle(self, *args, **options):
        """Выполнение команды."""
        self.stdout.write('Ожидание подключения к базе данных...')
        db_connection = False
        max_attempts = 60  # максимальное количество попыток
        attempt = 0

        while not db_connection and attempt < max_attempts:
            try:
                connection.ensure_connection()
                db_connection = True
            except OperationalError:
                self.stdout.write(f'База данных недоступна, ожидание... (попытка {attempt + 1}/{max_attempts})')
                time.sleep(1)
                attempt += 1

        if db_connection:
            self.stdout.write(self.style.SUCCESS('База данных доступна!'))
        else:
            self.stdout.write(self.style.ERROR('Не удалось подключиться к базе данных после нескольких попыток!'))
            raise OperationalError('Timeout waiting for database')