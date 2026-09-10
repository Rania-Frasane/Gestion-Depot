import numpy as np
from datetime import timedelta
from django.utils import timezone
from produits.models import Produit, MouvementStock
from alertes.models import Alerte
from ai_assistant.models import AlertRule

def detect_anomalies_and_alert():
    """
    Detects anomalies in stock movements based on the configuration in AlertRule.
    Creates Alerte objects for detected anomalies.
    """
    rule = AlertRule.objects.filter(is_active=True).first()
    if not rule:
        # Default fallback rule if none configured
        std_threshold = 3.0
        min_qty = 10
    else:
        std_threshold = rule.std_dev_threshold
        min_qty = rule.min_quantity_threshold
        
    # We will analyze movements from the last 7 days
    end_date = timezone.now()
    start_date = end_date - timedelta(days=7)
    
    # Get recent movements
    recent_movements = MouvementStock.objects.filter(
        created_at__gte=start_date,
        type_mouvement='sortie'
    ).select_related('produit')
    
    # Group by product
    products_to_check = set([m.produit for m in recent_movements])
    
    anomalies_detected = 0
    
    for produit in products_to_check:
        # Get historical data for the last 90 days to establish baseline
        hist_start = end_date - timedelta(days=90)
        historical_movements = MouvementStock.objects.filter(
            produit=produit,
            type_mouvement='sortie',
            created_at__gte=hist_start,
            created_at__lt=start_date
        ).values_list('quantite', flat=True)
        
        if len(historical_movements) < 5:
            continue # Not enough history to establish a reliable baseline
            
        hist_data = list(historical_movements)
        mean_qty = np.mean(hist_data)
        std_qty = np.std(hist_data)
        
        if std_qty == 0:
            std_qty = 1 # Prevent division by zero
            
        # Check recent movements against this baseline
        prod_recent = [m for m in recent_movements if m.produit == produit]
        
        for m in prod_recent:
            if m.quantite < min_qty:
                continue # Ignore small movements
                
            # Z-score calculation
            z_score = (m.quantite - mean_qty) / std_qty
            
            if z_score > std_threshold:
                # Anomaly detected!
                priorite = Alerte.HAUTE if z_score > (std_threshold + 1) else Alerte.MOYENNE
                
                msg = (f"Anomalie détectée : Sortie de {m.quantite} unités. "
                       f"(Moyenne habituelle: {mean_qty:.1f}, Z-Score: {z_score:.1f}). "
                       f"Mouvement par {m.utilisateur.username if m.utilisateur else 'Inconnu'}.")
                
                # Check if we already alerted for this specific movement to avoid spam
                # We can use the movement ID in the title or message, but for simplicity:
                alert_title = f"Anomalie de sortie - {produit.nom}"
                if not Alerte.objects.filter(produit=produit, type_alerte=Alerte.SYSTEME, titre=alert_title, created_at__gte=m.created_at).exists():
                    Alerte.objects.create(
                        type_alerte=Alerte.SYSTEME,
                        priorite=priorite,
                        titre=alert_title,
                        message=msg,
                        produit=produit
                    )
                    anomalies_detected += 1
                    
    return anomalies_detected
