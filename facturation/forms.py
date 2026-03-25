from django import forms
from .models import Facture, LigneFacture

class FactureForm(forms.ModelForm):
    class Meta:
        model = Facture
        fields = ['client','commande','date_echeance','remise','note']
        widgets = {
            'date_echeance': forms.DateInput(attrs={'type':'date'}),
            'note': forms.Textarea(attrs={'rows':2}),
        }

class LigneFactureForm(forms.ModelForm):
    class Meta:
        model = LigneFacture
        fields = ['produit','description','quantite','prix_unitaire','tva']
        widgets = {'quantite': forms.NumberInput(attrs={'min':1})}
