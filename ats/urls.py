from django.urls import path
from . import views

app_name = 'ats'

urlpatterns = [
    path('checker/', views.ats_checker, name='checker'),
]
