from django.contrib import admin
from .models import Facture, LigneFacture

class LigneInline(admin.TabularInline):
    model = LigneFacture
    extra = 0

@admin.register(Facture)
class FactureAdmin(admin.ModelAdmin):
    list_display = ['numero','client','statut','total_ttc','date_emission']
    list_filter = ['statut']
    search_fields = ['numero','client__nom']
    inlines = [LigneInline]
    readonly_fields = ['numero','created_at']
