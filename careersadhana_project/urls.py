"""
URL configuration for CareerSadhana project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # Apps
    path('', include('common.urls')),
    path('jobs/', include('jobs.urls')),
    path('ats/', include('ats.urls')),
    path('accounts/', include('users.urls')),
    
    # Health check
    path('healthz/', TemplateView.as_view(
        template_name='healthz.json',
        content_type='application/json'
    ), name='healthz'),
]

# Custom error handlers
handler404 = 'common.views.custom_404'
handler500 = 'common.views.custom_500'

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    
    # Debug toolbar
    if 'debug_toolbar' in settings.INSTALLED_APPS:
        import debug_toolbar
        urlpatterns = [
            path('__debug__/', include(debug_toolbar.urls)),
        ] + urlpatterns

# Customize admin site
admin.site.site_header = "CareerSadhana Administration"
admin.site.site_title = "CareerSadhana Admin"
admin.site.index_title = "Welcome to CareerSadhana Admin Portal"
