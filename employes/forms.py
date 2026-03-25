from django import forms
from .models import Employe

class EmployeForm(forms.ModelForm):
    class Meta:
        model = Employe
        fields = ['nom','prenom','poste','user','email','telephone','date_embauche','salaire','adresse','cin']
        widgets = {
            'date_embauche': forms.DateInput(attrs={'type':'date'}),
            'adresse': forms.Textarea(attrs={'rows':2}),
        }
