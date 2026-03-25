from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.db.models import Sum, Count, F, Q
from produits.models import Produit, MouvementStock
from commandes.models import Commande
from clients.models import Client
from alertes.models import Alerte


@login_required
def dashboard(request):
    # Stats produits
    total_produits = Produit.objects.count()
    stock_bas = Produit.objects.filter(stock_actuel__lte=F('stock_minimum')).count()
    valeur_stock = Produit.objects.aggregate(
        total=Sum(F('stock_actuel') * F('prix_achat'))
    )['total'] or 0

    # Stats commandes
    from django.utils import timezone
    from datetime import timedelta
    today = timezone.now().date()
    commandes_mois = Commande.objects.filter(
        created_at__month=today.month,
        created_at__year=today.year
    ).count()

    # Clients
    total_clients = Client.objects.filter(actif=True).count()

    # Alertes non lues
    alertes_count = Alerte.objects.filter(lue=False).count()

    # Derniers mouvements
    derniers_mouvements = MouvementStock.objects.select_related(
        'produit', 'utilisateur'
    ).order_by('-created_at')[:8]

    # Produits stock bas
    produits_bas = Produit.objects.filter(
        stock_actuel__lte=F('stock_minimum')
    ).select_related('categorie')[:6]

    # Dernières commandes
    dernieres_commandes = Commande.objects.select_related(
        'fournisseur', 'client'
    ).order_by('-created_at')[:5]

    context = {
        'total_produits': total_produits,
        'stock_bas': stock_bas,
        'valeur_stock': valeur_stock,
        'commandes_mois': commandes_mois,
        'total_clients': total_clients,
        'alertes_count': alertes_count,
        'derniers_mouvements': derniers_mouvements,
        'produits_bas': produits_bas,
        'dernieres_commandes': dernieres_commandes,
    }
    return render(request, 'core/dashboard.html', context)
