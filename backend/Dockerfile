FROM mirror.gcr.io/library/python:3.11

# Установка переменных окружения
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV TZ=Europe/Moscow

# Установка зависимостей для Pillow и PostgreSQL
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Создание директории приложения
WORKDIR /app

# Установка зависимостей Python
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Копирование проекта
COPY . /app/

# Создание директорий для статических и медиа-файлов
RUN mkdir -p /app/static /app/media

# Установка прав
RUN chmod +x /app/entrypoint.sh

# Исполнение entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# Порт для gunicorn
EXPOSE 8000

# Команда запуска по умолчанию
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "config.wsgi:application"]