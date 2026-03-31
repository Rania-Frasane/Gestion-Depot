from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.db.models import Sum, Count, F, Q
from django.utils import timezone
from datetime import timedelta
from produits.models import Produit, MouvementStock
from commandes.models import Commande
from clients.models import Client
from alertes.models import Alerte


@login_required
def dashboard(request):
    # Stats produits
    total_produits = Produit.objects.count()
    stock_bas = Produit.objects.filter(stock_actuel__lte=F('stock_minimum')).count()
    stock_ok = total_produits - stock_bas
    stock_critique = Produit.objects.filter(stock_actuel=0).count()
    
    valeur_stock = Produit.objects.aggregate(
        total=Sum(F('stock_actuel') * F('prix_achat'))
    )['total'] or 0

    # Stats commandes
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

    # Chart Data: Stock Distribution
    chart_stock_data = {
        'labels': ['Stock OK', 'Stock Bas', 'Critique'],
        'data': [stock_ok, (stock_bas - stock_critique), stock_critique],
        'colors': ['#10b981', '#f59e0b', '#ef4444']
    }

    # Chart Data: Movements (Last 7 days)
    from datetime import timedelta
    import json
    
    mouvements_par_jour = []
    entrees_par_jour = []
    sorties_par_jour = []
    
    for i in range(6, -1, -1):
        jour = today - timedelta(days=i)
        entrees = MouvementStock.objects.filter(
            created_at__date=jour,
            type_mouvement='entree'
        ).aggregate(total=Sum('quantite'))['total'] or 0
        
        sorties = MouvementStock.objects.filter(
            created_at__date=jour,
            type_mouvement='sortie'
        ).aggregate(total=Sum('quantite'))['total'] or 0
        
        mouvements_par_jour.append(jour.strftime('%a'))
        entrees_par_jour.append(entrees)
        sorties_par_jour.append(sorties)
    
    chart_movements_data = {
        'labels': mouvements_par_jour,
        'entrees': entrees_par_jour,
        'sorties': sorties_par_jour
    }

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
        'chart_stock_data': json.dumps(chart_stock_data),
        'chart_movements_data': json.dumps(chart_movements_data),
    }
    return render(request, 'core/dashboard.html', context)


# Custom Admin Interface Views
@login_required
def admin_dashboard(request):
    """Custom admin dashboard"""
    if not request.user.is_staff:
        from django.http import HttpResponseForbidden
        return HttpResponseForbidden('Access Denied')
    
    # Get system statistics
    total_users = User.objects.count()
    total_products = Produit.objects.count()
    total_clients = Client.objects.count()
    total_orders = Commande.objects.count()
    
    # Recent activity
    recent_movements = MouvementStock.objects.select_related(
        'produit', 'utilisateur'
    ).order_by('-created_at')[:10]
    
    context = {
        'total_users': total_users,
        'total_products': total_products,
        'total_clients': total_clients,
        'total_orders': total_orders,
        'recent_movements': recent_movements,
    }
    return render(request, 'admin/dashboard.html', context)


@login_required
def admin_users(request):
    """Manage users"""
    if not request.user.is_staff:
        from django.http import HttpResponseForbidden
        return HttpResponseForbidden('Access Denied')
    
    users = User.objects.all().order_by('-date_joined')
    
    context = {
        'users': users,
    }
    return render(request, 'admin/users.html', context)


@login_required
def admin_settings(request):
    """System settings"""
    if not request.user.is_staff:
        from django.http import HttpResponseForbidden
        return HttpResponseForbidden('Access Denied')
    
    context = {}
    return render(request, 'admin/settings.html', context)


@login_required
def admin_activity(request):
    """Activity log"""
    if not request.user.is_staff:
        from django.http import HttpResponseForbidden
        return HttpResponseForbidden('Access Denied')
    
    activities = MouvementStock.objects.select_related(
        'produit', 'utilisateur'
    ).order_by('-created_at')[:50]
    
    context = {
        'activities': activities,
    }
    return render(request, 'admin/activity.html', context)
