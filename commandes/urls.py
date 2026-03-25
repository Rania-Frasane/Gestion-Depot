from django.urls import path
from . import views

app_name = 'commandes'

urlpatterns = [
    path('', views.liste, name='liste'),
    path('ajouter/', views.ajouter, name='ajouter'),
    path('<int:pk>/', views.detail, name='detail'),
    path('<int:pk>/modifier/', views.modifier, name='modifier'),
    path('<int:pk>/recevoir/', views.recevoir, name='recevoir'),
    path('<int:pk>/ajouter-ligne/', views.ajouter_ligne, name='ajouter_ligne'),
    path('<int:pk>/ligne/<int:ligne_pk>/supprimer/', views.supprimer_ligne, name='supprimer_ligne'),
]
