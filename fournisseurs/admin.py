from django.contrib import admin
from .models import Fournisseur

@admin.register(Fournisseur)
class FournisseurAdmin(admin.ModelAdmin):
    list_display = ['code', 'nom', 'email', 'telephone', 'ville', 'actif']
    list_filter = ['actif', 'ville']
    search_fields = ['nom', 'email', 'ice']
    list_editable = ['actif']
