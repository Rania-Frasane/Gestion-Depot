from django.urls import path
from . import views
app_name = 'facturation'
urlpatterns = [
    path('', views.liste, name='liste'),
    path('ajouter/', views.ajouter, name='ajouter'),
    path('<int:pk>/', views.detail, name='detail'),
    path('<int:pk>/modifier/', views.modifier, name='modifier'),
    path('<int:pk>/ajouter-ligne/', views.ajouter_ligne, name='ajouter_ligne'),
    path('<int:pk>/ligne/<int:ligne_pk>/supprimer/', views.supprimer_ligne, name='supprimer_ligne'),
    path('<int:pk>/statut/<str:statut>/', views.changer_statut, name='changer_statut'),
    path('<int:pk>/imprimer/', views.imprimer, name='imprimer'),
]
