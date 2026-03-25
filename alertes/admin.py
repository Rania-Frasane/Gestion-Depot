from django.contrib import admin
from .models import Alerte
@admin.register(Alerte)
class AlerteAdmin(admin.ModelAdmin):
    list_display = ['titre','type_alerte','priorite','lue','created_at']
    list_filter = ['type_alerte','priorite','lue']
    readonly_fields = ['created_at']
