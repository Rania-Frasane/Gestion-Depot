from django import forms
from .models import Fournisseur


class FournisseurForm(forms.ModelForm):
    class Meta:
        model = Fournisseur
        fields = [
            'nom', 'email', 'telephone', 'telephone2', 'adresse',
            'ville', 'pays', 'ice', 'rc', 'contact_nom',
            'delai_livraison', 'conditions_paiement', 'note'
        ]
        widgets = {
            'adresse': forms.Textarea(attrs={'rows': 2}),
            'note': forms.Textarea(attrs={'rows': 2}),
        }
