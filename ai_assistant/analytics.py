import datetime
from django.db.models import Sum, Count, F, Avg, ExpressionWrapper, fields
from django.utils import timezone
from commandes.models import Commande, LigneCommande
from produits.models import Produit
from fournisseurs.models import Fournisseur
from clients.models import Client

def get_revenue_trends(days=30):
    """
    Returns revenue trends (sales) for the past `days`.
    """
    end_date = timezone.now().date()
    start_date = end_date - datetime.timedelta(days=days)
    
    # We will get completed (RECUE) sales orders
    commandes = Commande.objects.filter(
        type_commande=Commande.VENTE,
        statut=Commande.RECUE,
        date_commande__gte=start_date
    ).annotate(
        date=F('date_commande')
    ).values('date').annotate(
        commandes_count=Count('id')
    ).order_by('date')
    
    # Since we don't store total on Commande model directly, we must aggregate LigneCommande
    # Or we can compute it in python
    
    # Fetch all lines for these orders
    lignes = LigneCommande.objects.filter(
        commande__type_commande=Commande.VENTE,
        commande__statut=Commande.RECUE,
        commande__date_commande__gte=start_date
    ).annotate(
        date=F('commande__date_commande')
    ).values('date').annotate(
        total_ht=Sum(F('quantite') * F('prix_unitaire'))
    ).order_by('date')
    
    # Merge and fill missing dates
    trends = []
    lignes_map = {item['date']: item['total_ht'] for item in lignes}
    
    for i in range(days + 1):
        d = start_date + datetime.timedelta(days=i)
        trends.append({
            'date': d.strftime('%Y-%m-%d'),
            'label': d.strftime('%d/%m'),
            'revenue': float(lignes_map.get(d, 0))
        })
        
    return trends


def get_top_selling_products(limit=10):
    """
    Returns the top selling products based on quantity sold in VENTE orders.
    """
    top_products = LigneCommande.objects.filter(
        commande__type_commande=Commande.VENTE,
        commande__statut__in=[Commande.RECUE, Commande.EN_COURS]
    ).values(
        'produit_id', 'produit__nom', 'produit__code'
    ).annotate(
        total_vendu=Sum('quantite'),
        chiffre_affaire=Sum(F('quantite') * F('prix_unitaire'))
    ).order_by('-total_vendu')[:limit]
    
    return [
        {
            'id': p['produit_id'],
            'nom': p['produit__nom'],
            'code': p['produit__code'],
            'quantite': p['total_vendu'],
            'revenue': float(p['chiffre_affaire'] or 0)
        }
        for p in top_products
    ]


def get_supplier_performance():
    """
    Calculate a basic performance score for suppliers based on average delivery time
    and order fulfillment rate.
    """
    # Orders that are RECUE
    fournisseurs = Fournisseur.objects.filter(actif=True)
    perf = []
    
    for f in fournisseurs:
        cmds = Commande.objects.filter(fournisseur=f, type_commande=Commande.ACHAT)
        total_cmds = cmds.count()
        if total_cmds == 0:
            continue
            
        cmds_recue = cmds.filter(statut=Commande.RECUE)
        recue_count = cmds_recue.count()
        
        # Calculate delivery time
        cmds_delivered = cmds_recue.exclude(date_livraison_reelle__isnull=True)
        avg_days = 0
        if cmds_delivered.exists():
            # calculate avg days
            days = 0
            for c in cmds_delivered:
                diff = (c.date_livraison_reelle - c.date_commande).days
                days += diff if diff >= 0 else 0
            avg_days = days / cmds_delivered.count()
            
        # Score calculation (0-100)
        fulfillment_rate = (recue_count / total_cmds) * 100
        # Let's say target delivery is 7 days.
        delivery_score = max(0, 100 - (avg_days * 5)) if avg_days > 0 else 100
        
        final_score = (fulfillment_rate * 0.4) + (delivery_score * 0.6)
        
        perf.append({
            'id': f.id,
            'nom': f.nom,
            'total_commandes': total_cmds,
            'taux_livraison': fulfillment_rate,
            'delai_moyen': avg_days,
            'score': min(100, max(0, final_score))
        })
        
    perf.sort(key=lambda x: x['score'], reverse=True)
    return perf


def get_customer_purchase_frequency():
    """
    Returns active customers and their purchase frequency/total spend.
    """
    clients = Client.objects.filter(actif=True).annotate(
        total_commandes=Count('commandes', filter=models.Q(commandes__type_commande=Commande.VENTE)),
    ).filter(total_commandes__gt=0)
    
    freq = []
    for c in clients:
        # Get total spend
        lignes = LigneCommande.objects.filter(
            commande__client=c,
            commande__type_commande=Commande.VENTE
        ).aggregate(total=Sum(F('quantite') * F('prix_unitaire')))
        
        total_spend = lignes['total'] or 0
        
        freq.append({
            'id': c.id,
            'nom': c.nom,
            'email': c.email,
            'total_commandes': c.total_commandes,
            'total_depense': float(total_spend),
            'panier_moyen': float(total_spend) / c.total_commandes if c.total_commandes > 0 else 0
        })
        
    freq.sort(key=lambda x: x['total_depense'], reverse=True)
    return freq[:15] # Top 15 customers
