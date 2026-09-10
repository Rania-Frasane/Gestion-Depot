from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from rest_framework.authtoken.views import obtain_auth_token

from batiments.views import BatimentViewSet, EtageViewSet, LocalViewSet

router = DefaultRouter()
router.register(r'produits', views.ProduitViewSet)
router.register(r'categories', views.CategorieViewSet)
router.register(r'entrepots', views.EntrepotViewSet)
router.register(r'emplacements', views.EmplacementViewSet)
router.register(r'stocks-emplacement', views.StockParEmplacementViewSet)
router.register(r'transferts', views.TransfertViewSet)
router.register(r'fournisseurs', views.FournisseurViewSet)
router.register(r'documents-fournisseurs', views.DocumentFournisseurViewSet, basename='documentfournisseur')
router.register(r'clients', views.ClientViewSet)
router.register(r'commandes', views.CommandeViewSet)
router.register(r'employes', views.EmployeViewSet)
router.register(r'postes', views.PosteViewSet)
router.register(r'factures', views.FactureViewSet)
router.register(r'alertes', views.AlerteViewSet)
router.register(r'projets', views.ProjetViewSet)
router.register(r'batiments', BatimentViewSet)
router.register(r'etages', EtageViewSet)
router.register(r'locaux', LocalViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('ai/', include('ai_assistant.urls')),
    path('dashboard-stats/', views.DashboardStatsAPIView.as_view(), name='dashboard-stats'),
    path('available-responsibles/', views.AvailableResponsiblesAPIView.as_view(), name='available-responsibles'),
    path('scanner/', views.ScannerAPIView.as_view(), name='api-scanner'),
    path('produits/<int:pk>/regenerate-qr/', views.RegenerateQRAPIView.as_view(), name='api-regenerate-qr'),
    path('login/', obtain_auth_token, name='api_token_auth'),
    path('profile/', views.UserProfileAPIView.as_view(), name='api-profile'),
]

