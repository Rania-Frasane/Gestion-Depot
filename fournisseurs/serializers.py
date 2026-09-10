from rest_framework import serializers
from .models import Fournisseur, DocumentFournisseur

class FournisseurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fournisseur
        fields = '__all__'

class DocumentFournisseurSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentFournisseur
        fields = '__all__'
