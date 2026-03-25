from django import forms
from .models import Commande, LigneCommande

class CommandeForm(forms.ModelForm):
    class Meta:
        model = Commande
        fields = ['type_commande', 'fournisseur', 'client', 'date_livraison_prevue', 'remise', 'note']
        widgets = {
            'date_livraison_prevue': forms.DateInput(attrs={'type': 'date'}),
            'note': forms.Textarea(attrs={'rows': 2}),
        }

class LigneCommandeForm(forms.ModelForm):
    class Meta:
        model = LigneCommande
        fields = ['produit', 'quantite', 'prix_unitaire', 'tva']
        widgets = {'quantite': forms.NumberInput(attrs={'min': 1})}

LigneCommandeFormSet = forms.inlineformset_factory(
    Commande, LigneCommande, form=LigneCommandeForm, extra=1, can_delete=True
)
