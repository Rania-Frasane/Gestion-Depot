"""
context_builder.py
Builds a live warehouse snapshot to inject into the AI system prompt.
"""
from django.db.models import Sum, Count, F


def build_warehouse_context() -> str:
    """
    Queries the database and returns a compact text summary of the
    current warehouse state to ground the AI's answers in real data.
    """
    lines = []

    try:
        from produits.models import Produit, MouvementStock

        total_produits = Produit.objects.filter(actif=True).count()
        valeur_stock = Produit.objects.filter(actif=True).aggregate(
            v=Sum(F('stock_actuel') * F('prix_achat'))
        )['v'] or 0
        stock_bas = Produit.objects.filter(
            actif=True, stock_actuel__lte=F('stock_minimum')
        ).count()
        stock_rupture = Produit.objects.filter(actif=True, stock_actuel=0).count()

        lines.append(f"STOCK: {total_produits} produits actifs | Valeur totale: {valeur_stock:,.2f} MAD")
        lines.append(f"ALERTES STOCK: {stock_bas} produits en stock bas | {stock_rupture} en rupture")

        # Top 5 low-stock products
        bas = Produit.objects.filter(
            actif=True, stock_actuel__lte=F('stock_minimum')
        ).values('nom', 'stock_actuel', 'stock_minimum')[:5]
        if bas:
            bas_txt = ', '.join(
                f"{p['nom']} ({p['stock_actuel']}/{p['stock_minimum']})" for p in bas
            )
            lines.append(f"Produits stock bas: {bas_txt}")

        # Recent movements
        recent = MouvementStock.objects.select_related('produit').order_by('-created_at')[:5]
        if recent:
            mov_txt = ' | '.join(
                f"{m.get_type_mouvement_display()} {m.produit.nom} ×{m.quantite}" for m in recent
            )
            lines.append(f"Derniers mouvements: {mov_txt}")

    except Exception:  # noqa: BLE001
        lines.append("STOCK: données non disponibles")

    try:
        from commandes.models import Commande
        from django.utils import timezone

        today = timezone.now().date()
        en_cours = Commande.objects.filter(statut='en_cours').count()
        du_mois = Commande.objects.filter(
            created_at__month=today.month, created_at__year=today.year
        ).count()
        lines.append(f"COMMANDES: {en_cours} en cours | {du_mois} ce mois")

    except Exception:  # noqa: BLE001
        lines.append("COMMANDES: données non disponibles")

    try:
        from clients.models import Client
        total_clients = Client.objects.filter(actif=True).count()
        lines.append(f"CLIENTS: {total_clients} clients actifs")
    except Exception:  # noqa: BLE001
        pass

    try:
        from fournisseurs.models import Fournisseur
        total_frs = Fournisseur.objects.filter(actif=True).count()
        lines.append(f"FOURNISSEURS: {total_frs} fournisseurs actifs")
    except Exception:  # noqa: BLE001
        pass

    try:
        from alertes.models import Alerte
        non_lues = Alerte.objects.filter(lue=False).count()
        lines.append(f"ALERTES SYSTÈME: {non_lues} alertes non lues")
    except Exception:  # noqa: BLE001
        pass

    return '\n'.join(lines) if lines else "Données non disponibles."
