from rest_framework import serializers
from .models import Facture, LigneFacture
from produits.serializers import ProduitSerializer

class LigneFactureSerializer(serializers.ModelSerializer):
    produit_nom = serializers.CharField(source='produit.nom', read_only=True)
    
    class Meta:
        model = LigneFacture
        fields = '__all__'

class FactureSerializer(serializers.ModelSerializer):
    lignes = LigneFactureSerializer(many=True, read_only=True)
    client_nom = serializers.CharField(source='client.nom', read_only=True)
    total_ht = serializers.ReadOnlyField()
    total_tva = serializers.ReadOnlyField()
    total_ttc = serializers.ReadOnlyField()
    total_apres_remise = serializers.ReadOnlyField()

    class Meta:
        model = Facture
        fields = '__all__'
        read_only_fields = ('numero', 'date_emission', 'createur', 'created_at', 'updated_at')
