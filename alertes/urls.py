from django.urls import path
from . import views
app_name = 'alertes'
urlpatterns = [
    path('', views.liste, name='liste'),
    path('<int:pk>/lire/', views.marquer_lue, name='marquer_lue'),
    path('tout-lire/', views.tout_lire, name='tout_lire'),
]
