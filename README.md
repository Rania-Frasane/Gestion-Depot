# Dépôt Manager — Système de gestion complet

## Applications incluses (8 apps)

| App | Description |
|-----|-------------|
| `produits` | Gestion produits, catégories, mouvements de stock |
| `fournisseurs` | Fournisseurs, contacts, conditions |
| `commandes` | Commandes achat/vente, réception automatique en stock |
| `clients` | CRM clients particuliers et entreprises |
| `employes` | RH, postes, matricules |
| `rapports` | Tableaux de bord, graphiques, exports |
| `facturation` | Factures, lignes, impression PDF |
| `alertes` | Alertes stock bas, notifications email |
| `core` | Dashboard principal, base templates |

## Structure du projet

```
depot_project/
├── manage.py
├── requirements.txt
├── gestion_depot/          # Config principale
│   ├── settings.py         # MySQL + email configurés
│   └── urls.py             # Routes de toutes les apps
├── produits/               # Stock + mouvements
├── fournisseurs/           # Gestion fournisseurs
├── commandes/              # Achat & vente
├── clients/                # CRM
├── employes/               # RH
├── rapports/               # Stats & graphiques
├── facturation/            # Factures imprimables
├── alertes/                # Notifications
├── core/                   # Dashboard + base
└── templates/              # 35+ templates HTML
```

## Installation

### 1. Prérequis
```bash
Python 3.10+
MySQL 8.0+
```

### 2. Base de données MySQL
```sql
CREATE DATABASE gestion_depot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'depot_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON gestion_depot.* TO 'depot_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Installation Python
```bash
python -m venv venv
source venv/bin/activate        # Linux/Mac
venv\Scripts\activate           # Windows

pip install -r requirements.txt
```

### 4. Configuration
Modifier `gestion_depot/settings.py` :
```python
DATABASES = {
    'default': {
        'NAME': 'gestion_depot',
        'USER': 'depot_user',
        'PASSWORD': 'votre_mot_de_passe',   # ← changer
        ...
    }
}
EMAIL_HOST_USER = 'votre_email@gmail.com'   # ← changer
EMAIL_HOST_PASSWORD = 'votre_app_password'  # ← changer
STOCK_ALERTE_EMAIL = 'admin@depot.ma'       # ← changer
```

### 5. Migration et démarrage
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Accéder à : http://127.0.0.1:8000

## Fonctionnalités clés

### Gestion des stocks
- CRUD complet produits avec code-barre, emplacement, TVA
- 4 types de mouvements: Entrée / Sortie / Ajustement / Retour
- Alertes automatiques stock bas → email
- Historique complet par produit

### Commandes
- Commandes achat (fournisseurs) et vente (clients)
- Réception d'une commande → génère automatiquement les entrées en stock
- Suivi statuts: Brouillon → En cours → Reçue / Annulée

### Facturation
- Génération automatique de numéros (FACT-2024-00001)
- Calcul HT / TVA / TTC / remise
- Vue imprimable navigateur (Ctrl+P)
- Statuts: Brouillon → Émise → Payée

### Rapports
- Dashboard avec graphiques Chart.js
- Évolution mouvements 30 jours
- Top 10 produits mouvementés
- Rapport valeur stock par produit
- Rapport mouvements avec filtres date

## URLs principales

| URL | Description |
|-----|-------------|
| `/` | Dashboard principal |
| `/produits/` | Liste produits |
| `/fournisseurs/` | Liste fournisseurs |
| `/commandes/` | Liste commandes |
| `/clients/` | Liste clients |
| `/employes/` | Liste employés |
| `/rapports/` | Rapports & stats |
| `/facturation/` | Factures |
| `/alertes/` | Alertes notifications |
| `/admin/` | Admin Django |
