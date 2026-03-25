from django.contrib import admin
from .models import Commande, LigneCommande

class LigneInline(admin.TabularInline):
    model = LigneCommande
    extra = 0
    readonly_fields = ['total_ht', 'total_ttc']

@admin.register(Commande)
class CommandeAdmin(admin.ModelAdmin):
    list_display = ['numero', 'type_commande', 'statut', 'fournisseur', 'client', 'date_commande']
    list_filter = ['statut', 'type_commande']
    search_fields = ['numero']
    inlines = [LigneInline]
    readonly_fields = ['numero', 'created_at']
