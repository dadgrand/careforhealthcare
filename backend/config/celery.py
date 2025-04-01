import os

from celery import Celery
from django.conf import settings

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

app = Celery('hospital_system')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

# Configure Celery Beat schedule
app.conf.beat_schedule = {
    'backup-database': {
        'task': 'core.tasks.backup_database',
        'schedule': 86400.0,  # Once a day (in seconds)
    },
    'cleanup-old-files': {
        'task': 'apps.file_management.tasks.cleanup_old_files',
        'schedule': 86400.0 * 7,  # Once a week (in seconds)
    },
    'update-analytics': {
        'task': 'apps.analytics.tasks.update_analytics',
        'schedule': 3600.0,  # Every hour (in seconds)
    },
}


@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')