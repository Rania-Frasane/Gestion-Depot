from django.urls import path
from . import views

app_name = 'logistique'

urlpatterns = [
    path('entrepots/', views.entrepot_liste, name='entrepot_liste'),
    path('entrepots/<int:pk>/', views.entrepot_detail, name='entrepot_detail'),
    path('transferts/', views.transfert_liste, name='transfert_liste'),
    path('transferts/nouveau/', views.transfert_nouveau, name='transfert_nouveau'),
    path('transferts/<int:pk>/', views.transfert_detail, name='transfert_detail'),
    path('transferts/<int:pk>/modifier/', views.transfert_edit, name='transfert_edit'),
    path('transferts/<int:pk>/valider/', views.transfert_valider, name='transfert_valider'),
    path('transferts/<int:pk>/recevoir/', views.transfert_recevoir, name='transfert_recevoir'),
]
