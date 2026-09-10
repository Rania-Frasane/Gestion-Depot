from rest_framework import serializers
from .models import Produit, Categorie, MouvementStock, Projet

class CategorieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = '__all__'

class ProjetSerializer(serializers.ModelSerializer):
    entrepot_nom = serializers.CharField(source='entrepot.nom', read_only=True)
    
    class Meta:
        model = Projet
        fields = '__all__'

class MouvementStockSerializer(serializers.ModelSerializer):
    produit_nom = serializers.CharField(source='produit.nom', read_only=True)
    utilisateur_nom = serializers.CharField(source='utilisateur.username', read_only=True)
    
    class Meta:
        model = MouvementStock
        fields = '__all__'

class ProduitSerializer(serializers.ModelSerializer):
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)
    fournisseur_nom = serializers.CharField(source='fournisseur_principal.nom', read_only=True)
    projet_nom = serializers.CharField(source='projet.nom', read_only=True)
    mouvements = serializers.SerializerMethodField()
    
    class Meta:
        model = Produit
        fields = '__all__'

    def get_mouvements(self, obj):
        mouvements = obj.mouvements.all().order_by('-created_at')[:10]
        return MouvementStockSerializer(mouvements, many=True).data
