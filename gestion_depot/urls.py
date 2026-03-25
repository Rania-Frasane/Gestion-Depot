from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('django.contrib.auth.urls')),
    path('', include('core.urls')),
    path('produits/', include('produits.urls', namespace='produits')),
    path('fournisseurs/', include('fournisseurs.urls', namespace='fournisseurs')),
    path('commandes/', include('commandes.urls', namespace='commandes')),
    path('clients/', include('clients.urls', namespace='clients')),
    path('employes/', include('employes.urls', namespace='employes')),
    path('rapports/', include('rapports.urls', namespace='rapports')),
    path('facturation/', include('facturation.urls', namespace='facturation')),
    path('alertes/', include('alertes.urls', namespace='alertes')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
