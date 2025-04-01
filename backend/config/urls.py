from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions

# Swagger схема API
schema_view = get_schema_view(
    openapi.Info(
        title="Hospital System API",
        default_version='v1',
        description="API для модульной системы медицинского учреждения",
        terms_of_service="https://www.example.com/terms/",
        contact=openapi.Contact(email="contact@example.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Панель администратора
    path('admin/', admin.site.urls),

    # API документация
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    # API endpoints для модулей
    path('api/v1/', include([
        path('accounts/', include('apps.accounts.urls')),
        path('files/', include('apps.file_management.urls')),
        path('news/', include('apps.news.urls')),
        path('testing/', include('apps.testing.urls')),
        path('analytics/', include('apps.analytics.urls')),
    ])),

    # API для здоровья системы
    path('api/health/', include('core.urls')),
]

# Добавление URL-паттернов для статических и медиа-файлов в режиме разработки
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

    # Добавление панели отладки для режима разработки
    if 'debug_toolbar' in settings.INSTALLED_APPS:
        import debug_toolbar

        urlpatterns = [
                          path('__debug__/', include(debug_toolbar.urls)),
                      ] + urlpatterns