#!/bin/sh

set -e

# Ожидание готовности базы данных
echo "Waiting for database..."
python manage.py wait_for_db

# Выполнение миграций
echo "Applying database migrations..."
python manage.py migrate

# Сбор статических файлов
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Создание суперпользователя (если не существует)
echo "Checking superuser..."
python manage.py create_superuser_if_not_exists

# Запуск команды из аргументов
exec "$@"