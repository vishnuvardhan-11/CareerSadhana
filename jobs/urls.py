from django.urls import path
from . import views

app_name = 'jobs'

urlpatterns = [
    path('government/', views.government_jobs, name='government'),
    path('private/', views.private_jobs, name='private'),
]
