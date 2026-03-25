from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.db.models import Sum, Count, F, Q
from django.utils import timezone
from datetime import timedelta
import json
from produits.models import Produit, MouvementStock
from commandes.models import Commande
from clients.models import Client
from fournisseurs.models import Fournisseur


@login_required
def tableau_de_bord(request):
    today = timezone.now().date()
    debut_mois = today.replace(day=1)
    debut_annee = today.replace(month=1, day=1)

    # Valeur totale du stock
    valeur_stock = Produit.objects.aggregate(
        total=Sum(F('stock_actuel') * F('prix_achat'))
    )['total'] or 0

    # Mouvements par type ce mois
    mouvements_mois = MouvementStock.objects.filter(
        created_at__date__gte=debut_mois
    ).values('type_mouvement').annotate(total=Sum('quantite'))

    # Top 10 produits les plus mouvementés
    top_produits = MouvementStock.objects.filter(
        created_at__date__gte=debut_annee
    ).values('produit__nom').annotate(
        total=Sum('quantite')
    ).order_by('-total')[:10]

    # Évolution stock (30 derniers jours)
    evol_labels, evol_entrees, evol_sorties = [], [], []
    for i in range(29, -1, -1):
        day = today - timedelta(days=i)
        evol_labels.append(day.strftime('%d/%m'))
        entrees = MouvementStock.objects.filter(
            created_at__date=day, type_mouvement='entree'
        ).aggregate(t=Sum('quantite'))['t'] or 0
        sorties = MouvementStock.objects.filter(
            created_at__date=day, type_mouvement='sortie'
        ).aggregate(t=Sum('quantite'))['t'] or 0
        evol_entrees.append(entrees)
        evol_sorties.append(sorties)

    # Commandes par statut
    cmd_statuts = Commande.objects.values('statut').annotate(total=Count('id'))

    context = {
        'valeur_stock': valeur_stock,
        'mouvements_mois': mouvements_mois,
        'top_produits': top_produits,
        'evol_labels': json.dumps(evol_labels),
        'evol_entrees': json.dumps(evol_entrees),
        'evol_sorties': json.dumps(evol_sorties),
        'cmd_statuts': cmd_statuts,
        'total_produits': Produit.objects.filter(actif=True).count(),
        'total_clients': Client.objects.filter(actif=True).count(),
        'total_fournisseurs': Fournisseur.objects.filter(actif=True).count(),
    }
    return render(request, 'rapports/tableau_de_bord.html', context)


@login_required
def stock_rapport(request):
    produits = Produit.objects.select_related('categorie').filter(actif=True).annotate(
        valeur=F('stock_actuel') * F('prix_achat')
    ).order_by('-valeur')
    total_valeur = produits.aggregate(t=Sum(F('stock_actuel') * F('prix_achat')))['t'] or 0
    return render(request, 'rapports/stock.html', {
        'produits': produits, 'total_valeur': total_valeur
    })


@login_required
def mouvements_rapport(request):
    from django.utils import timezone
    debut = request.GET.get('debut', (timezone.now().date() - timedelta(days=30)).isoformat())
    fin = request.GET.get('fin', timezone.now().date().isoformat())
    mouvements = MouvementStock.objects.filter(
        created_at__date__range=[debut, fin]
    ).select_related('produit', 'utilisateur').order_by('-created_at')
    return render(request, 'rapports/mouvements.html', {
        'mouvements': mouvements, 'debut': debut, 'fin': fin
    })
