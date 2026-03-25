from django.contrib import admin
from .models import Categorie, Produit, MouvementStock


@admin.register(Categorie)
class CategorieAdmin(admin.ModelAdmin):
    list_display = ['nom', 'description']
    search_fields = ['nom']


@admin.register(Produit)
class ProduitAdmin(admin.ModelAdmin):
    list_display = ['code', 'nom', 'categorie', 'stock_actuel', 'stock_minimum', 'prix_vente', 'actif']
    list_filter = ['categorie', 'actif']
    search_fields = ['nom', 'code', 'code_barre']
    readonly_fields = ['created_at', 'updated_at']
    list_editable = ['actif']


@admin.register(MouvementStock)
class MouvementStockAdmin(admin.ModelAdmin):
    list_display = ['produit', 'type_mouvement', 'quantite', 'stock_avant', 'stock_apres', 'utilisateur', 'created_at']
    list_filter = ['type_mouvement']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
