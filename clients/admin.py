from django.contrib import admin
from .models import Client
@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['code','nom','prenom','email','telephone','ville','actif']
    list_filter = ['type_client','actif']
    search_fields = ['nom','email','code']
