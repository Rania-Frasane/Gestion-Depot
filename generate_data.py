import os
import django
import random
from datetime import timedelta

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "gestion_depot.settings")
django.setup()

from django.utils import timezone
from django.contrib.auth.models import User
from produits.models import Produit, Categorie, MouvementStock
from fournisseurs.models import Fournisseur

def generate_data():
    # 1. Create User
    user, _ = User.objects.get_or_create(username='admin', defaults={'is_superuser': True, 'is_staff': True})
    user.set_password('admin')
    user.save()

    # 2. Create Categorie & Fournisseur
    cat, _ = Categorie.objects.get_or_create(nom='Électronique', description='Composants et appareils')
    frn, _ = Fournisseur.objects.get_or_create(nom='TechCorp', email='contact@techcorp.ma')

    # 3. Create Products
    products_data = [
        ('ECran LED 24"', 'EC-24', 1200.0, 1500.0, 50, 10),
        ('Clavier Mécanique', 'CL-01', 350.0, 550.0, 120, 20),
        ('Souris Sans Fil', 'SR-02', 150.0, 250.0, 8, 15), # Low stock!
        ('Disque SSD 1To', 'SSD-1', 650.0, 850.0, 200, 30),
        ('Webcam HD', 'CAM-1', 400.0, 600.0, 0, 5), # Out of stock!
    ]

    products = []
    for nom, code, p_achat, p_vente, stock, s_min in products_data:
        p, _ = Produit.objects.get_or_create(
            code=code,
            defaults={
                'nom': nom, 'categorie': cat, 'fournisseur_principal': frn,
                'prix_achat': p_achat, 'prix_vente': p_vente,
                'stock_actuel': stock, 'stock_minimum': s_min
            }
        )
        p.stock_actuel = stock
        p.save()
        products.append(p)

    # 4. Generate 90 days of MouvementStock (Sorties)
    print("Generating 90 days of sales history...")
    today = timezone.now()
    MouvementStock.objects.all().delete() # Clean old movements

    # Setup base daily volume for each product
    base_volumes = {
        'EC-24': 2,
        'CL-01': 5,
        'SR-02': 8,
        'SSD-1': 10,
        'CAM-1': 1
    }

    # Setup trends
    trends = {
        'EC-24': 0,      # Stable
        'CL-01': 0.05,   # Upward trend
        'SR-02': -0.02,  # Downward trend
        'SSD-1': 0.1,    # Strong upward trend
        'CAM-1': 0,      # Stable but low volume
    }

    for i in range(90, -1, -1):
        current_date = today - timedelta(days=i)
        
        for p in products:
            # Calculate daily qty with base + trend + noise
            trend_multiplier = 1 + (trends[p.code] * (90 - i))
            base = base_volumes[p.code]
            
            # Add some randomness (Poisson-like)
            if random.random() > 0.3: # 70% chance of a sale on a given day
                qty = max(0, int(random.gauss(base * trend_multiplier, base * 0.3)))
                
                if qty > 0:
                    # Create the record in the past
                    m = MouvementStock.objects.create(
                        produit=p,
                        type_mouvement=MouvementStock.SORTIE,
                        quantite=qty,
                        stock_avant=p.stock_actuel + qty, # Fake stock history
                        stock_apres=p.stock_actuel,
                        utilisateur=user,
                        motif='Vente standard'
                    )
                    # Override auto_now_add
                    MouvementStock.objects.filter(pk=m.pk).update(created_at=current_date)

    print("Sample data generated successfully!")

if __name__ == '__main__':
    generate_data()
