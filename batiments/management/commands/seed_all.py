import os
import random
import datetime
import urllib.request
from django.core.management.base import BaseCommand
from django.db import transaction
from django.contrib.auth.models import User
from django.core.files.temp import NamedTemporaryFile
from django.core.files import File
from django.conf import settings
from django.utils import timezone

from employes.models import Employe, Poste
from batiments.models import Batiment, Etage, Local
from produits.models import Produit, Categorie, MouvementStock
from fournisseurs.models import Fournisseur
from clients.models import Client
from commandes.models import Commande, LigneCommande
from facturation.models import Facture, LigneFacture
from logistique.models import Entrepot, Emplacement, TransfertStock, LigneTransfert, StockParEmplacement


def download_image_to_field(obj_field, url, filename):
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as response:
            temp_file = NamedTemporaryFile()
            temp_file.write(response.read())
            temp_file.flush()
            obj_field.save(filename, File(temp_file), save=False)
            return True
    except Exception as e:
        print(f"Could not download {filename}: {e}")
        return False


class Command(BaseCommand):
    help = 'Massive seeder for a professional Building & Construction Management System.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING("Starting MASSIVE database wipe..."))

        with transaction.atomic():
            # 1. CLEAR ALL DATA
            MouvementStock.objects.all().delete()
            StockParEmplacement.objects.all().delete()
            LigneTransfert.objects.all().delete()
            TransfertStock.objects.all().delete()
            LigneFacture.objects.all().delete()
            Facture.objects.all().delete()
            LigneCommande.objects.all().delete()
            Commande.objects.all().delete()
            Local.objects.all().delete()
            Etage.objects.all().delete()
            Batiment.objects.all().delete()
            Emplacement.objects.all().delete()
            Entrepot.objects.all().delete()
            Produit.objects.all().delete()
            Categorie.objects.all().delete()
            Client.objects.all().delete()
            Fournisseur.objects.all().delete()
            Employe.objects.all().delete()
            Poste.objects.all().delete()

            # Ensure system users exist
            self.stdout.write("Syncing Admin and System Users...")
            admin_user, _ = User.objects.get_or_create(username='admin', defaults={'is_superuser': True, 'is_staff': True})
            admin_user.set_password('admin123')
            admin_user.save()

            manager_user, _ = User.objects.get_or_create(username='manager', defaults={'is_staff': True})
            manager_user.set_password('manager123')
            manager_user.save()

            users = [
                User.objects.get_or_create(username=f'user{i}')[0] for i in range(1, 11)
            ]
            for i, u in enumerate(users):
                u.set_password('user123')
                u.save()

            # 2. SEED POSTES & EMPLOYÉS
            self.stdout.write("Seeding Postes & Employés...")
            postes_data = [
                "Directeur de Projet", "Chef de Chantier", "Responsable Achats",
                "Ingénieur Structure", "Logisticien Chantier", "Responsable Qualité"
            ]
            postes = {name: Poste.objects.create(nom=name, description=f"Description pour {name}") for name in postes_data}

            employes_data = [
                {"nom": "El Fassi", "prenom": "Omar", "poste": "Directeur de Projet", "photo": "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400"},
                {"nom": "Bennani", "prenom": "Sara", "poste": "Ingénieur Structure", "photo": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400"},
                {"nom": "Chraibi", "prenom": "Youssef", "poste": "Chef de Chantier", "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"},
                {"nom": "Tazi", "prenom": "Kenza", "poste": "Responsable Achats", "photo": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400"},
                {"nom": "Alaoui", "prenom": "Mehdi", "poste": "Logisticien Chantier", "photo": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400"},
                {"nom": "Amrani", "prenom": "Leila", "poste": "Responsable Qualité", "photo": "https://images.unsplash.com/photo-1598550874175-4d0ef436c909?auto=format&fit=crop&q=80&w=400"},
            ]

            employes_objs = []
            for i, data in enumerate(employes_data):
                emp = Employe(
                    user=admin_user if i == 0 else manager_user if i == 1 else users[i],
                    nom=data["nom"],
                    prenom=data["prenom"],
                    poste=postes[data["poste"]],
                    email=f"{data['prenom'].lower()}.{data['nom'].lower()}@batipro.ma",
                    telephone=f"+212 6{random.randint(10000000, 99999999)}",
                    date_embauche=datetime.date(random.randint(2015, 2024), random.randint(1, 12), random.randint(1, 28)),
                    salaire=random.randint(8000, 35000),
                    actif=True
                )
                self.stdout.write(f"Downloading photo for {data['prenom']}...")
                download_image_to_field(emp.photo, data["photo"], f"emp_{i}.jpg")
                emp.save()
                employes_objs.append(emp)


            # 3. SEED FOURNISSEURS & CLIENTS
            self.stdout.write("Seeding Fournisseurs & Clients...")
            fournisseurs_data = [
                ("LafargeHolcim Maroc", "https://images.unsplash.com/photo-1517424269992-cb1db0e0f340?auto=format&fit=crop&q=80&w=400"),
                ("Sonasid", "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=400"),
                ("Colorado Peintures", "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?auto=format&fit=crop&q=80&w=400"),
                ("Facemag (Briques)", "https://images.unsplash.com/photo-1518688248740-7c31f1dc21cc?auto=format&fit=crop&q=80&w=400"),
                ("SNEP (Plomberie/PVC)", "https://images.unsplash.com/photo-1601597561845-8167fbcdd0e5?auto=format&fit=crop&q=80&w=400"),
                ("Nexans Maroc", "https://images.unsplash.com/photo-1558227691-41ea78d1f631?auto=format&fit=crop&q=80&w=400"),
                ("Menara Holding", "https://images.unsplash.com/photo-1587582423116-ec07293f0395?auto=format&fit=crop&q=80&w=400")
            ]
            fournisseurs_objs = []
            for i, (nom, photo) in enumerate(fournisseurs_data):
                f = Fournisseur(nom=nom, email=f"contact@{nom.lower().replace(' ', '')}.ma", telephone="+212 522001122", ville="Casablanca", actif=True)
                download_image_to_field(f.logo, photo, f"fourn_{i}.jpg")
                f.save()
                fournisseurs_objs.append(f)

            clients_data = [
                ("TGCC Construction", "https://images.unsplash.com/photo-1541888087425-4c07d3b070ec?auto=format&fit=crop&q=80&w=400"),
                ("SGTM", "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=400"),
                ("Jet Contractors", "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400"),
                ("Yamed Construction", "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400"),
                ("Alliances", "https://images.unsplash.com/photo-1430285561322-7808604715df?auto=format&fit=crop&q=80&w=400")
            ]
            clients_objs = []
            for i, (nom, photo) in enumerate(clients_data):
                c = Client(nom=nom, type_client=Client.ENTREPRISE, email=f"achats@{nom.lower().replace(' ', '')}.ma", telephone="+212 522998877", ville="Rabat", plafond_credit=random.randint(1000000, 5000000), actif=True)
                download_image_to_field(c.logo, photo, f"client_{i}.jpg")
                c.save()
                clients_objs.append(c)


            # 4. SEED CATEGORIES & PRODUITS
            self.stdout.write("Seeding Catégories & Produits de Construction...")
            categories = {
                "Gros Œuvre": Categorie.objects.create(nom="Gros Œuvre"),
                "Finition": Categorie.objects.create(nom="Finition"),
                "Menuiserie": Categorie.objects.create(nom="Menuiserie"),
                "Plomberie": Categorie.objects.create(nom="Plomberie"),
                "Électricité": Categorie.objects.create(nom="Électricité"),
                "Outillage": Categorie.objects.create(nom="Outillage"),
                "Équipement Lourd": Categorie.objects.create(nom="Équipement Lourd")
            }

            products_data = [
                # Gros Oeuvre
                ("Ciment Portland CPJ 45", "Gros Œuvre", "sacs", 75.0, 5000, "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400"),
                ("Ciment Blanc CPB", "Gros Œuvre", "sacs", 120.0, 2000, "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=400"),
                ("Acier Haute Adhérence (HA 12)", "Gros Œuvre", "tonnes", 9500.0, 150, "https://image.made-in-china.com/318f0j00FtWfQNyGHIgn/a1cd9533dd96772b9c7ad18481c3e4aa-mp4.webp"),
                ("Acier Haute Adhérence (HA 14)", "Gros Œuvre", "tonnes", 9500.0, 100, "https://images.unsplash.com/photo-1533575770077-052fa2c609fc?auto=format&fit=crop&q=80&w=400"),
                ("Sable de Dragage", "Gros Œuvre", "m3", 150.0, 2000, "https://images.unsplash.com/photo-1584985437172-5b1285227ea3?auto=format&fit=crop&q=80&w=400"),
                ("Gravier Concassé 15/25", "Gros Œuvre", "m3", 180.0, 1500, "https://images.unsplash.com/photo-1518688248740-7c31f1dc21cc?auto=format&fit=crop&q=80&w=400"),
                ("Briques Rouges 8 Trous", "Gros Œuvre", "pcs", 2.5, 50000, "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=400"),
                ("Agglos de Ciment 20x20x40", "Gros Œuvre", "pcs", 5.5, 30000, "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400"),
                
                # Finition
                ("Peinture Vinyle Blanche", "Finition", "pots", 350.0, 500, "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?auto=format&fit=crop&q=80&w=400"),
                ("Enduit de Lissage", "Finition", "sacs", 85.0, 800, "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&q=80&w=400"),
                ("Carrelage Grès Cérame 60x60", "Finition", "m2", 120.0, 3000, "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=400"),
                ("Plâtre Fibré", "Finition", "sacs", 60.0, 1500, "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=400"),
                
                # Menuiserie
                ("Bois Rouge (Madriers)", "Menuiserie", "m3", 4500.0, 80, "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&q=80&w=400"),
                ("Bois Blanc (Voliges)", "Menuiserie", "m3", 2800.0, 120, "https://images.unsplash.com/photo-1610444391295-888e228bdf05?auto=format&fit=crop&q=80&w=400"),
                ("Porte Isoplane", "Menuiserie", "pcs", 450.0, 300, "https://images.unsplash.com/photo-1517462006346-6541f5daff52?auto=format&fit=crop&q=80&w=400"),
                
                # Plomberie
                ("Tube PVC Ø100", "Plomberie", "ml", 25.0, 5000, "https://images.unsplash.com/photo-1601597561845-8167fbcdd0e5?auto=format&fit=crop&q=80&w=400"),
                ("Tube Cuivre Ø14", "Plomberie", "ml", 45.0, 2000, "https://images.unsplash.com/photo-1581094363294-8452e8006b52?auto=format&fit=crop&q=80&w=400"),
                ("Robinetterie Douche", "Plomberie", "pcs", 850.0, 250, "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400"),
                
                # Électricité
                ("Câble RO2V 3G2.5", "Électricité", "rouleaux", 450.0, 400, "https://images.unsplash.com/photo-1558227691-41ea78d1f631?auto=format&fit=crop&q=80&w=400"),
                ("Disjoncteur Différentiel 40A", "Électricité", "pcs", 350.0, 150, "https://images.unsplash.com/photo-1544724569-5f546fd6f2b6?auto=format&fit=crop&q=80&w=400"),
                ("Tube Orange Isolé", "Électricité", "ml", 5.5, 10000, "https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=400"),
                
                # Outillage
                ("Bétonnière Thermique 350L", "Équipement Lourd", "pcs", 18500.0, 5, "https://images.unsplash.com/photo-1541888087425-4c07d3b070ec?auto=format&fit=crop&q=80&w=400"),
                ("Marteau Piqueur Bosch", "Outillage", "pcs", 8500.0, 15, "https://images.unsplash.com/photo-1504198458649-3128b932f49e?auto=format&fit=crop&q=80&w=400"),
                ("Meuleuse d'Angle 230mm", "Outillage", "pcs", 1200.0, 40, "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=400"),
                ("Perceuse Visseuse Sans Fil", "Outillage", "pcs", 1800.0, 35, "https://images.unsplash.com/photo-1504198458649-3128b932f49e?auto=format&fit=crop&q=80&w=400")
            ]

            produits_objs = []
            for i, (nom, cat, unite, prix, stock, photo) in enumerate(products_data):
                p = Produit(
                    nom=nom,
                    code=f"PRD-{random.randint(10000,99999)}",
                    prix_vente=prix,
                    prix_achat=prix * 0.7,
                    stock_actuel=stock,
                    stock_minimum=max(10, int(stock * 0.1)),
                    stock_maximum=stock * 3,
                    categorie=categories[cat],
                    fournisseur_principal=random.choice(fournisseurs_objs),
                    unite=unite
                )
                self.stdout.write(f"Downloading photo for {nom}...")
                download_image_to_field(p.image, photo, f"prod_{i}.jpg")
                p.save()
                p.generate_qr_code()
                produits_objs.append(p)


            # 5. SEED BÂTIMENTS & ENTREPÔTS
            self.stdout.write("Seeding Bâtiments & Entrepôts...")
            batiments_data = [
                ("Tour CFC Casablanca", "Anfa Park", "Casablanca", 25, "Chantier en cours"),
                ("Hôpital CHU Tanger", "Zone Gzenaya", "Tanger", 5, "Projet santé"),
                ("Complexe Résidentiel Marrakech", "Gueliz", "Marrakech", 8, "Résidentiel haut standing"),
                ("Usine Automobile Kenitra", "AFZ", "Kenitra", 1, "Industriel")
            ]
            
            entrepots_objs = []
            emplacements_objs = []
            
            for b_idx, (nom, adresse, ville, etages, desc) in enumerate(batiments_data):
                bat = Batiment.objects.create(nom=nom, adresse=adresse, ville=ville, nb_etages=etages, description=desc)
                
                # Create an Entrepot (Warehouse/Storage area) for each building
                ent = Entrepot.objects.create(nom=f"Dépôt Chantier - {nom}", ville=ville, adresse=adresse, responsable=random.choice(employes_objs), actif=True)
                entrepots_objs.append(ent)
                
                # Create Zones (Emplacements) for the Warehouse
                emp1 = Emplacement.objects.create(entrepot=ent, code="ZONE-CIMENT", description="Hangar Sec")
                emp2 = Emplacement.objects.create(entrepot=ent, code="ZONE-ACIER", description="Parc Extérieur")
                emp3 = Emplacement.objects.create(entrepot=ent, code="MAGASIN-OUTILLAGE", description="Magasin Sécurisé")
                emplacements_objs.extend([emp1, emp2, emp3])
                
                # Add stock to emplacements
                seen_pairs = set()
                for _ in range(10):
                    prod = random.choice(produits_objs)
                    emp = random.choice([emp1, emp2, emp3])
                    if (prod.id, emp.id) not in seen_pairs:
                        StockParEmplacement.objects.create(produit=prod, emplacement=emp, quantite=random.randint(10, 500))
                        seen_pairs.add((prod.id, emp.id))

                # Create Floors & Rooms
                for etage_num in range(min(etages, 5)):
                    e = Etage.objects.create(batiment=bat, numero_etage=etage_num, nom=f"Étage {etage_num}" if etage_num > 0 else "RDC")
                    Local.objects.create(etage=e, code=f"{ville[:3].upper()}-E{etage_num}-BUR", nom="Bureau Chantier", type_local=Local.BUREAU, superficie=20, responsable=random.choice(employes_objs))
                    Local.objects.create(etage=e, code=f"{ville[:3].upper()}-E{etage_num}-DEP", nom="Dépôt Relais", type_local=Local.DEPOT, superficie=50, responsable=random.choice(employes_objs))

            
            # 6. SEED COMMANDES, FACTURES, MOUVEMENTS STOCK
            self.stdout.write("Seeding Commandes, Factures, Transferts, Mouvements...")
            for i in range(1, 35):
                # Random Commande
                is_sale = random.choice([True, False])
                cmd = Commande.objects.create(
                    numero=f"CMD-2026-{i:04d}",
                    client=random.choice(clients_objs) if is_sale else None,
                    fournisseur=random.choice(fournisseurs_objs) if not is_sale else None,
                    type_commande=Commande.VENTE if is_sale else Commande.ACHAT,
                    statut=random.choice([Commande.BROUILLON, Commande.EN_COURS, Commande.RECUE, Commande.ANNULEE]),
                    createur=admin_user,
                    created_at=timezone.now() - datetime.timedelta(days=random.randint(1, 60))
                )
                
                total = 0
                for _ in range(random.randint(1, 5)):
                    prod = random.choice(produits_objs)
                    qty = random.randint(5, 500)
                    LigneCommande.objects.create(commande=cmd, produit=prod, quantite=qty, prix_unitaire=prod.prix_vente if is_sale else prod.prix_achat)
                    total += qty * (prod.prix_vente if is_sale else prod.prix_achat)
                
                # If Recue, create stock movement (and Facture if Sale)
                if cmd.statut == Commande.RECUE:
                    if is_sale and cmd.client:
                        fact = Facture.objects.create(
                            numero=f"FAC-2026-{i:04d}",
                            commande=cmd,
                            client=cmd.client,
                            statut=random.choice([Facture.BROUILLON, Facture.EMISE, Facture.PAYEE, Facture.ANNULEE]),
                            createur=admin_user,
                            created_at=cmd.created_at + datetime.timedelta(days=2)
                        )
                        for lc in cmd.lignes.all():
                            LigneFacture.objects.create(facture=fact, produit=lc.produit, quantite=lc.quantite, prix_unitaire=lc.prix_unitaire)
                            
                    for lc in cmd.lignes.all():
                        # Generate Mouvement
                        MouvementStock.objects.create(
                            produit=lc.produit,
                            type_mouvement=MouvementStock.SORTIE if is_sale else MouvementStock.ENTREE,
                            quantite=lc.quantite,
                            stock_avant=lc.produit.stock_actuel,
                            stock_apres=lc.produit.stock_actuel - lc.quantite if is_sale else lc.produit.stock_actuel + lc.quantite,
                            motif=f"Commande {cmd.numero}",
                            utilisateur=admin_user,
                            commande=cmd,
                            created_at=cmd.created_at
                        )

            # Generate Transferts
            for i in range(1, 15):
                transf = TransfertStock.objects.create(
                    numero=f"TRF-2026-{i:04d}",
                    entrepot_source=random.choice(entrepots_objs),
                    entrepot_destination=random.choice(entrepots_objs),
                    statut=random.choice([TransfertStock.BROUILLON, TransfertStock.EXPEDIE, TransfertStock.RECU]),
                    createur=admin_user,
                    created_at=timezone.now() - datetime.timedelta(days=random.randint(1, 30))
                )
                for _ in range(random.randint(1, 3)):
                    prod = random.choice(produits_objs)
                    LigneTransfert.objects.create(transfert=transf, produit=prod, quantite=random.randint(10, 50))


            self.stdout.write(self.style.SUCCESS("DATABASE COMPLETELY RESET AND MASSIVELY POPULATED WITH CONSTRUCTION DATA & MEDIA!"))
