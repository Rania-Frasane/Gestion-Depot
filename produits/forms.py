from django import forms
from .models import Produit, MouvementStock


class ProduitForm(forms.ModelForm):
    class Meta:
        model = Produit
        fields = [
            'nom', 'code', 'code_barre', 'categorie', 'fournisseur_principal',
            'description', 'image', 'prix_achat', 'prix_vente', 'tva',
            'stock_actuel', 'stock_minimum', 'stock_maximum', 'unite', 'emplacement'
        ]
        widgets = {
            'description': forms.Textarea(attrs={'rows': 3}),
        }


class MouvementForm(forms.ModelForm):
    class Meta:
        model = MouvementStock
        fields = ['type_mouvement', 'quantite', 'motif', 'reference']
        widgets = {
            'quantite': forms.NumberInput(attrs={'min': 1}),
            'motif': forms.TextInput(attrs={'placeholder': 'Raison...'}),
            'reference': forms.TextInput(attrs={'placeholder': 'N° commande, BL...'}),
        }
