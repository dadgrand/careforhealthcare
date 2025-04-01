import os
import time
import datetime
import hashlib
import shutil
import subprocess
from django.conf import settings
from django.utils import timezone
from celery import shared_task

from .models import SystemBackup, SystemLog


@shared_task
def backup_database(backup_type=SystemBackup.BackupType.DATABASE):
    """Создание резервной копии базы данных."""
    try:
        # Создаем запись о резервной копии
        backup = SystemBackup.objects.create(
            backup_type=backup_type,
            status=SystemBackup.BackupStatus.IN_PROGRESS
        )

        # Формируем имя файла и путь
        timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
        if backup_type == SystemBackup.BackupType.DATABASE:
            filename = f"db_backup_{timestamp}.sql"
        elif backup_type == SystemBackup.BackupType.FILES:
            filename = f"files_backup_{timestamp}.zip"
        else:
            filename = f"full_backup_{timestamp}.zip"

        backup_dir = os.path.join(settings.MEDIA_ROOT, 'backups')
        os.makedirs(backup_dir, exist_ok=True)

        backup_path = os.path.join(backup_dir, filename)

        # Выполняем резервное копирование в зависимости от типа
        if backup_type == SystemBackup.BackupType.DATABASE:
            # Получаем настройки базы данных
            db_settings = settings.DATABASES['default']
            db_name = db_settings['NAME']
            db_user = db_settings['USER']
            db_password = db_settings['PASSWORD']
            db_host = db_settings['HOST']
            db_port = db_settings['PORT']

            # Формируем и выполняем команду для dump базы данных
            pg_dump_cmd = f"PGPASSWORD={db_password} pg_dump -h {db_host} -p {db_port} -U {db_user} -d {db_name} -f {backup_path}"
            subprocess.run(pg_dump_cmd, shell=True, check=True)

        elif backup_type == SystemBackup.BackupType.FILES:
            # Архивируем файлы из медиа-директории
            media_dir = settings.MEDIA_ROOT
            shutil.make_archive(backup_path[:-4], 'zip', media_dir)

        else:  # FULL backup
            # Архивируем базу данных и файлы
            # Сначала делаем дамп базы данных
            db_settings = settings.DATABASES['default']
            db_name = db_settings['NAME']
            db_user = db_settings['USER']
            db_password = db_settings['PASSWORD']
            db_host = db_settings['HOST']
            db_port = db_settings['PORT']

            temp_db_path = os.path.join(backup_dir, f"temp_db_{timestamp}.sql")
            pg_dump_cmd = f"PGPASSWORD={db_password} pg_dump -h {db_host} -p {db_port} -U {db_user} -d {db_name} -f {temp_db_path}"
            subprocess.run(pg_dump_cmd, shell=True, check=True)

            # Создаем временную директорию для полного бэкапа
            temp_backup_dir = os.path.join(backup_dir, f"temp_full_{timestamp}")
            os.makedirs(temp_backup_dir, exist_ok=True)

            # Копируем дамп базы данных во временную директорию
            shutil.copy(temp_db_path, os.path.join(temp_backup_dir, 'database.sql'))

            # Копируем медиа-файлы во временную директорию
            media_backup_dir = os.path.join(temp_backup_dir, 'media')
            os.makedirs(media_backup_dir, exist_ok=True)

            for item in os.listdir(settings.MEDIA_ROOT):
                s = os.path.join(settings.MEDIA_ROOT, item)
                d = os.path.join(media_backup_dir, item)
                if os.path.isdir(s):
                    shutil.copytree(s, d, dirs_exist_ok=True)
                else:
                    shutil.copy2(s, d)

            # Архивируем временную директорию
            shutil.make_archive(backup_path[:-4], 'zip', temp_backup_dir)

            # Удаляем временные файлы
            shutil.rmtree(temp_backup_dir)
            os.remove(temp_db_path)

        # Проверяем наличие файла
        if os.path.exists(backup_path):
            # Рассчитываем контрольную сумму
            sha256 = hashlib.sha256()
            with open(backup_path, 'rb') as f:
                for chunk in iter(lambda: f.read(4096), b''):
                    sha256.update(chunk)
            checksum = sha256.hexdigest()

            # Получаем размер файла
            size = os.path.getsize(backup_path)

            # Обновляем информацию о резервной копии
            backup.backup_file = f"backups/{filename}"
            backup.size = size
            backup.checksum = checksum
            backup.status = SystemBackup.BackupStatus.COMPLETED
            backup.completed_at = timezone.now()
            backup.save()

            # Логируем успешное создание резервной копии
            SystemLog.objects.create(
                level=SystemLog.LogLevel.INFO,
                module='backup',
                message=f"Успешно создана резервная копия типа {backup.get_backup_type_display()}"
            )

            return {
                'status': 'success',
                'backup_id': str(backup.id),
                'backup_file': backup.backup_file.url,
                'size': size,
                'checksum': checksum
            }
        else:
            # Если файл не создан, обновляем статус на ошибку
            backup.status = SystemBackup.BackupStatus.FAILED
            backup.error_message = "Файл резервной копии не создан"
            backup.completed_at = timezone.now()
            backup.save()

            # Логируем ошибку
            SystemLog.objects.create(
                level=SystemLog.LogLevel.ERROR,
                module='backup',
                message=f"Ошибка при создании резервной копии типа {backup.get_backup_type_display()}: файл не создан"
            )

            return {
                'status': 'error',
                'error': "Файл резервной копии не создан"
            }

    except Exception as e:
        # В случае ошибки, логируем её и обновляем статус
        error_message = str(e)

        try:
            # Обновляем статус резервной копии
            backup.status = SystemBackup.BackupStatus.FAILED
            backup.error_message = error_message
            backup.completed_at = timezone.now()
            backup.save()
        except Exception:
            pass

        # Логируем ошибку
        SystemLog.objects.create(
            level=SystemLog.LogLevel.ERROR,
            module='backup',
            message=f"Ошибка при создании резервной копии: {error_message}"
        )

        return {
            'status': 'error',
            'error': error_message
        }


@shared_task
def cleanup_old_backups(days=30):
    """Удаление старых резервных копий."""
    try:
        # Определяем дату, старше которой нужно удалить резервные копии
        threshold_date = timezone.now() - datetime.timedelta(days=days)

        # Получаем старые резервные копии
        old_backups = SystemBackup.objects.filter(
            created_at__lt=threshold_date,
            status=SystemBackup.BackupStatus.COMPLETED
        )

        # Удаляем файлы и записи в базе данных
        deleted_count = 0
        for backup in old_backups:
            try:
                # Удаляем файл
                if backup.backup_file and os.path.exists(backup.backup_file.path):
                    os.remove(backup.backup_file.path)

                # Удаляем запись
                backup.delete()
                deleted_count += 1
            except Exception as e:
                # Логируем ошибку при удалении
                SystemLog.objects.create(
                    level=SystemLog.LogLevel.ERROR,
                    module='backup_cleanup',
                    message=f"Ошибка при удалении резервной копии {backup.id}: {str(e)}"
                )

        # Логируем успешное удаление
        SystemLog.objects.create(
            level=SystemLog.LogLevel.INFO,
            module='backup_cleanup',
            message=f"Удалено {deleted_count} старых резервных копий старше {days} дней"
        )

        return {
            'status': 'success',
            'deleted_count': deleted_count
        }

    except Exception as e:
        # Логируем ошибку
        error_message = str(e)
        SystemLog.objects.create(
            level=SystemLog.LogLevel.ERROR,
            module='backup_cleanup',
            message=f"Ошибка при удалении старых резервных копий: {error_message}"
        )

        return {
            'status': 'error',
            'error': error_message
        }


@shared_task
def system_health_check():
    """Проверка здоровья системы."""
    from .views import SystemHealthViewSet

    try:
        # Создаем экземпляр представления
        view = SystemHealthViewSet()

        # Вызываем метод проверки здоровья
        view.check(None)

        # Логируем успешную проверку
        SystemLog.objects.create(
            level=SystemLog.LogLevel.INFO,
            module='health_check',
            message="Выполнена плановая проверка здоровья системы"
        )

        return {
            'status': 'success',
            'message': "Выполнена проверка здоровья системы"
        }

    except Exception as e:
        # Логируем ошибку
        error_message = str(e)
        SystemLog.objects.create(
            level=SystemLog.LogLevel.ERROR,
            module='health_check',
            message=f"Ошибка при проверке здоровья системы: {error_message}"
        )

        return {
            'status': 'error',
            'error': error_message
        }