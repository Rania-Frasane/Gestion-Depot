from django.urls import path
from . import views
app_name = 'rapports'
urlpatterns = [
    path('', views.tableau_de_bord, name='dashboard'),
    path('stock/', views.stock_rapport, name='stock'),
    path('mouvements/', views.mouvements_rapport, name='mouvements'),
]
