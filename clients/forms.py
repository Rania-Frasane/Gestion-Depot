from django import forms
from .models import Client

class ClientForm(forms.ModelForm):
    class Meta:
        model = Client
        fields = ['type_client','nom','prenom','email','telephone','adresse','ville','ice','plafond_credit','remise_habituelle','note']
        widgets = {
            'adresse': forms.Textarea(attrs={'rows': 2}),
            'note': forms.Textarea(attrs={'rows': 2}),
        }
