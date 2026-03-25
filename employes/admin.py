from django.contrib import admin
from .models import Employe, Poste

@admin.register(Poste)
class PosteAdmin(admin.ModelAdmin):
    list_display = ['nom']

@admin.register(Employe)
class EmployeAdmin(admin.ModelAdmin):
    list_display = ['matricule','nom','prenom','poste','email','actif']
    list_filter = ['poste','actif']
    search_fields = ['nom','prenom','matricule','cin']
