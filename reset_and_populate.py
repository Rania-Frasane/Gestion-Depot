import os
import django
import random
from datetime import timedelta, date
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "gestion_depot.settings")
django.setup()

from django.utils import timezone
from django.contrib.auth.models import User
from produits.models import Produit, Categorie, MouvementStock, Projet
from fournisseurs.models import Fournisseur
from commandes.models import Commande, LigneCommande
from clients.models import Client
from logistique.models import TransfertStock, LigneTransfert, Entrepot, Emplacement, StockParEmplacement
from alertes.models import Alerte
from ai_assistant.models import ChatSession, ChatMessage, AlertRule
from employes.models import Employe, Poste
from facturation.models import Facture, LigneFacture

def clear_data():
    print("Deleting all existing data...")
    LigneFacture.objects.all().delete()
    Facture.objects.all().delete()
    ChatMessage.objects.all().delete()
    ChatSession.objects.all().delete()
    Alerte.objects.all().delete()
    AlertRule.objects.all().delete()
    LigneTransfert.objects.all().delete()
    TransfertStock.objects.all().delete()
    StockParEmplacement.objects.all().delete()
    Emplacement.objects.all().delete()
    LigneCommande.objects.all().delete()
    Commande.objects.all().delete()
    MouvementStock.objects.all().delete()
    Produit.objects.all().delete()
    Categorie.objects.all().delete()
    Projet.objects.all().delete()
    Fournisseur.objects.all().delete()
    Client.objects.all().delete()
    Employe.objects.all().delete()
    Poste.objects.all().delete()
    Entrepot.objects.all().delete()
    print("Database cleared.")

def populate_data():
    print("Starting data population...")
    user = User.objects.filter(is_superuser=True).first()
    if not user:
        user = User.objects.create_superuser('admin', 'admin@example.com', 'admin')
        print("Superuser created: admin/admin")

    # 1. Warehouses & Locations
    print("Creating warehouses and locations...")
    entrepots = [
        Entrepot.objects.create(nom="Dépôt Central Casa", ville="Casablanca", adresse="Zone Industrielle Tit Mellil"),
        Entrepot.objects.create(nom="Entrepôt Tanger Med", ville="Tanger", adresse="Port Tanger Med Zone Franche"),
        Entrepot.objects.create(nom="Hub Marrakech", ville="Marrakech", adresse="Route de Safi")
    ]
    
    emplacements = []
    for ent in entrepots:
        for zone in ['A', 'B', 'C']:
            for shelf in range(1, 5):
                emp = Emplacement.objects.create(
                    entrepot=ent,
                    code=f"{zone}-{shelf:02d}",
                    description=f"Zone {zone}, Étagère {shelf}"
                )
                emplacements.append(emp)

    # 2. Projects
    projets = [
        Projet.objects.create(nom="Distribution Rabat", description="Hub principal zone Nord", entrepot=entrepots[0]),
        Projet.objects.create(nom="Export Afrique", description="Gestion des flux internationaux", entrepot=entrepots[1]),
        Projet.objects.create(nom="E-commerce", description="Stocks dédiés vente en ligne", entrepot=entrepots[2])
    ]

    # 3. Categories
    categories = [
        Categorie.objects.create(nom="Électronique", description="Smartphones, Laptops, Composants"),
        Categorie.objects.create(nom="Accessoires", description="Câbles, Coques, Périphériques"),
        Categorie.objects.create(nom="Stockage", description="Disques durs, SSD, Clés USB")
    ]

    # 4. Suppliers
    suppliers = [
        Fournisseur.objects.create(nom="Global Tech Supply", code="GTS-001", email="sales@globaltech.com", telephone="0522001122", ville="Casablanca"),
        Fournisseur.objects.create(nom="EuroConnect Ltd", code="ECL-99", email="contact@euroconnect.eu", telephone="+33144556677", ville="Paris"),
        Fournisseur.objects.create(nom="China Direct Factory", code="CDF-88", email="export@chinadirect.cn", telephone="+8621009988", ville="Shenzhen")
    ]

    # 5. Clients
    clients = [
        Client.objects.create(nom="Maroc Telecom", prenom="Direction Achats", email="achats@iam.ma", ville="Rabat", type_client="entreprise"),
        Client.objects.create(nom="ElectroPlanet", prenom="Centrale", email="stock@electroplanet.ma", ville="Casablanca", type_client="entreprise"),
        Client.objects.create(nom="Bennis", prenom="Ahmed", email="a.bennis@gmail.com", ville="Fès", type_client="particulier")
    ]

    # 6. Employees & Posts
    postes = [
        Poste.objects.create(nom="Gestionnaire de Stock", description="Gère les entrées et sorties"),
        Poste.objects.create(nom="Cariste", description="Opérateur de chariot élévateur"),
        Poste.objects.create(nom="Responsable Logistique", description="Supervise les opérations")
    ]

    employees = [
        Employe.objects.create(nom="Alami", prenom="Youssef", poste=postes[2], email="y.alami@depot.ma", telephone="0661223344", date_embauche=date(2022, 1, 15), salaire=12000),
        Employe.objects.create(nom="Mansouri", prenom="Sara", poste=postes[0], email="s.mansouri@depot.ma", telephone="0662334455", date_embauche=date(2023, 3, 10), salaire=6500),
        Employe.objects.create(nom="Tahiri", prenom="Omar", poste=postes[1], email="o.tahiri@depot.ma", telephone="0663445566", date_embauche=date(2023, 6, 20), salaire=4500)
    ]

    # 7. Products
    products_data = [
        ("iPhone 15 Pro", "APL-I15P", categories[0], suppliers[0], 9500, 12500, 45, 5, "611000000001"),
        ("MacBook Air M2", "APL-MBA2", categories[0], suppliers[0], 11000, 14500, 20, 3, "611000000002"),
        ("Samsung S24 Ultra", "SAM-S24U", categories[0], suppliers[1], 10500, 13800, 30, 5, "611000000003"),
        ("AirPods Pro 2", "APL-APP2", categories[1], suppliers[0], 1800, 2600, 110, 15, "611000000004"),
        ("SSD Samsung 1TB", "SAM-SSD1", categories[2], suppliers[2], 650, 950, 250, 20, "611000000005"),
        ("Logitech MX Master 3", "LOG-MX3", categories[1], suppliers[1], 750, 1100, 65, 10, "611000000006"),
        ("Casque Sony WH-1000XM5", "SON-XM5", categories[1], suppliers[1], 2800, 3800, 17, 5, "611000000007"),
        ("Clavier Keychron K2", "KCH-K2", categories[1], suppliers[2], 850, 1200, 61, 8, "611000000008")
    ]

    products = []
    for nom, code, cat, sup, p_achat, p_vente, stock, s_min, bar in products_data:
        p = Produit.objects.create(
            nom=nom, code=code, code_barre=bar,
            categorie=cat, fournisseur_principal=sup, projet=random.choice(projets),
            prix_achat=p_achat, prix_vente=p_vente,
            stock_actuel=stock, stock_minimum=s_min
        )
        products.append(p)
        
        # Distribute stock in locations
        available_emplacements = [e for e in emplacements if e.entrepot == p.projet.entrepot]
        if available_emplacements:
            emp = random.choice(available_emplacements)
            StockParEmplacement.objects.create(produit=p, emplacement=emp, quantite=p.stock_actuel)

    # 8. Initial Movements
    for p in products:
        MouvementStock.objects.create(
            produit=p, type_mouvement="entree", quantite=p.stock_actuel,
            stock_avant=0, stock_apres=p.stock_actuel, utilisateur=user, motif="Stock initial après reset"
        )

    # 9. Orders
    print("Creating sample orders...")
    for i in range(15):
        is_sale = random.choice([True, False])
        if is_sale:
            client = random.choice(clients)
            type_cmd = 'vente'
            fournisseur = None
        else:
            client = None
            type_cmd = 'achat'
            fournisseur = random.choice(suppliers)
            
        status = random.choice(['brouillon', 'en_cours', 'recue'])
        order = Commande.objects.create(
            client=client,
            fournisseur=fournisseur,
            type_commande=type_cmd,
            statut=status,
            createur=user
        )
        order.date_commande = timezone.now().date() - timedelta(days=random.randint(0, 30))
        order.save()

        # Random items per order
        for _ in range(random.randint(1, 4)):
            p = random.choice(products)
            qty = random.randint(1, 5)
            price = p.prix_vente if type_cmd == 'vente' else p.prix_achat
            LigneCommande.objects.create(commande=order, produit=p, quantite=qty, prix_unitaire=price)

    # 10. Invoices (Factures)
    print("Creating sample invoices...")
    sales_orders = Commande.objects.filter(type_commande='vente')
    for order in sales_orders[:10]:
        facture = Facture.objects.create(
            client=order.client,
            commande=order,
            statut=random.choice(['emise', 'payee']),
            createur=user
        )
        for ligne in order.lignes.all():
            LigneFacture.objects.create(
                facture=facture,
                produit=ligne.produit,
                quantite=ligne.quantite,
                prix_unitaire=ligne.prix_unitaire,
                tva=ligne.tva
            )

    # 11. Transfers
    print("Creating sample transfers...")
    for i in range(5):
        src = random.choice(entrepots)
        dest = random.choice([e for e in entrepots if e != src])
        trans = TransfertStock.objects.create(
            entrepot_source=src,
            entrepot_destination=dest,
            statut=random.choice(['expedie', 'recu']),
            date_transfert=timezone.now() - timedelta(days=random.randint(0, 10))
        )
        p = random.choice(products)
        LigneTransfert.objects.create(transfert=trans, produit=p, quantite=random.randint(5, 10))

    # 12. Alerts
    print("Creating alerts...")
    for p in products:
        if p.is_stock_bas:
            Alerte.objects.create(
                type_alerte='stock_bas',
                priorite='haute',
                titre=f"Stock bas : {p.nom}",
                message=f"Le stock de {p.nom} est de {p.stock_actuel}, ce qui est inférieur au minimum de {p.stock_minimum}.",
                produit=p
            )

    # 13. AI Assistant Data
    print("Creating AI assistant data...")
    AlertRule.objects.create(name="Détection Anomalie Ventes", description="Alerte si les ventes dépassent 3 écarts-types")
    AlertRule.objects.create(name="Optimisation Stock", description="Recommandations basées sur la vitesse de rotation")
    
    session = ChatSession.objects.create(utilisateur=user, titre="Analyse des stocks")
    ChatMessage.objects.create(session=session, role='user', content="Quels produits sont bientôt en rupture ?")
    ChatMessage.objects.create(session=session, role='assistant', content="Plusieurs produits comme l'iPhone 15 Pro et le MacBook Air sont en dessous du seuil minimum.")

    print("\n--- POPULATION COMPLETE ---")
    print(f"Created: {len(products)} Products")
    print(f"Created: {len(entrepots)} Warehouses")
    print(f"Created: {Emplacement.objects.count()} Locations")
    print(f"Created: {len(suppliers)} Suppliers")
    print(f"Created: {len(clients)} Clients")
    print(f"Created: {len(employees)} Employees")
    print(f"Created: {Facture.objects.count()} Invoices")

if __name__ == '__main__':
    clear_data()
    populate_data()
