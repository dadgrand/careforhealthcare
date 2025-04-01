from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('SECRET_KEY', default='django-insecure-development-key-change-this-in-production')

ALLOWED_HOSTS = ['*']

# Настройки для разработки
INTERNAL_IPS = [
    '127.0.0.1',
]

# Добавление debug toolbar для разработки
if DEBUG:
    INSTALLED_APPS += [
        'debug_toolbar',
    ]

    MIDDLEWARE += [
        'debug_toolbar.middleware.DebugToolbarMiddleware',
    ]

# Настройки для отправки электронной почты через консоль
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Настройки для хранения файлов локально
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL = '/media/'

# Настройки для статических файлов
STATIC_ROOT = os.path.join(BASE_DIR, 'static')
STATIC_URL = '/static/'

# Настройки для CORS
CORS_ALLOW_ALL_ORIGINS = True

# Отключение безопасных куки для разработки
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# Настройка для показа подробных сообщений об ошибках
LOGGING['loggers']['django']['level'] = 'DEBUG'
LOGGING['loggers']['app']['level'] = 'DEBUG'