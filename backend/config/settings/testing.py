from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-testing-key-for-tests-only'

ALLOWED_HOSTS = ['*']

# Настройки для тестирования - использование БД в памяти
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Отключение кэширования
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

# Настройки для отправки электронной почты
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

# Настройки для CORS
CORS_ALLOW_ALL_ORIGINS = True

# Отключение защиты от перебора паролей
AXES_ENABLED = False

# Отключение троттлинга API
REST_FRAMEWORK['DEFAULT_THROTTLE_CLASSES'] = []
REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = {}

# Настройки для файлов медиа
MEDIA_ROOT = os.path.join(BASE_DIR, 'test_media')
MEDIA_URL = '/media/'

# Настройки для логирования
LOGGING['handlers']['console']['level'] = 'ERROR'
LOGGING['loggers']['django']['level'] = 'ERROR'
LOGGING['loggers']['app']['level'] = 'ERROR'