"""
reorder_engine.py
Identifies products that need to be reordered, groups them by supplier,
and calculates optimized reorder quantities based on lead times and sales velocity.
"""
import math
from django.db.models import F
from .forecasting import forecast_all_products
from produits.models import Produit
from fournisseurs.models import Fournisseur

def generate_reorder_suggestions(safety_stock_days: int = 7) -> list[dict]:
    """
    Returns a list of suppliers, each containing a list of products that need reordering.
    """
    # 1. Run the forecast for active products
    # We will get a bit more products to ensure we cover enough ground
    forecasts = forecast_all_products(top_n=50)
    
    # 2. Filter for products that need reorder
    reorder_forecasts = [f for f in forecasts if f.get('reorder_needed')]
    
    if not reorder_forecasts:
        return []
        
    product_ids = [f['produit_id'] for f in reorder_forecasts]
    
    # 3. Fetch full product details including supplier
    products = Produit.objects.select_related('fournisseur_principal').filter(id__in=product_ids)
    prod_map = {p.id: p for p in products}
    
    # 4. Group by supplier
    suppliers_map = {}
    
    for f in reorder_forecasts:
        prod = prod_map.get(f['produit_id'])
        if not prod:
            continue
            
        frn = prod.fournisseur_principal
        frn_id = frn.id if frn else 0
        frn_name = frn.nom if frn else "Fournisseur Inconnu"
        lead_time = frn.delai_livraison if frn else 7
        
        if frn_id not in suppliers_map:
            suppliers_map[frn_id] = {
                'fournisseur_id': frn_id,
                'fournisseur_nom': frn_name,
                'delai_livraison': lead_time,
                'lignes': [],
                'total_estime': 0.0
            }
            
        # Calculate optimal quantity: 
        # (Average daily demand * (Lead Time + Safety Stock Days)) - Current Stock
        avg_demand = f['avg_daily_demand']
        target_stock = avg_demand * (lead_time + safety_stock_days)
        
        # If target stock is less than minimum stock, use minimum stock as a baseline
        if target_stock < prod.stock_minimum:
            target_stock = prod.stock_minimum * 1.5 # Add a 50% buffer to minimum
            
        optimal_qty = math.ceil(max(0, target_stock - prod.stock_actuel))
        
        # If the forecast already suggested a higher quantity, use that to be safe
        if optimal_qty < f['reorder_qty']:
             optimal_qty = f['reorder_qty']
             
        # Skip if calculated optimal qty is 0 somehow
        if optimal_qty <= 0:
            continue
            
        cout_estime = float(prod.prix_achat) * optimal_qty
            
        suppliers_map[frn_id]['lignes'].append({
            'produit_id': prod.id,
            'produit_code': prod.code,
            'produit_nom': prod.nom,
            'stock_actuel': prod.stock_actuel,
            'stock_minimum': prod.stock_minimum,
            'avg_daily_demand': f['avg_daily_demand'],
            'quantite_suggeree': optimal_qty,
            'prix_achat': float(prod.prix_achat),
            'cout_estime': cout_estime
        })
        
        suppliers_map[frn_id]['total_estime'] += cout_estime
        
    # Remove suppliers that ended up with 0 lines
    suggestions = [s for s in suppliers_map.values() if s['lignes']]
    
    # Sort by total estimated cost descending
    suggestions.sort(key=lambda x: x['total_estime'], reverse=True)
    
    return suggestions
