from rest_framework import serializers
from .models import Commande, LigneCommande

class LigneCommandeSerializer(serializers.ModelSerializer):
    produit_nom = serializers.CharField(source='produit.nom', read_only=True)
    class Meta:
        model = LigneCommande
        fields = '__all__'
        read_only_fields = ('commande',)

class CommandeSerializer(serializers.ModelSerializer):
    fournisseur_nom = serializers.CharField(source='fournisseur.nom', read_only=True)
    client_nom = serializers.CharField(source='client.nom', read_only=True)
    createur_nom = serializers.CharField(source='createur.username', read_only=True)
    lignes = LigneCommandeSerializer(many=True, required=False)
    total_ht = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    total_ttc = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = Commande
        fields = '__all__'
        read_only_fields = ('numero', 'date_commande', 'createur', 'created_at', 'updated_at')

    def create(self, validated_data):
        lignes_data = validated_data.pop('lignes', [])
        commande = Commande.objects.create(**validated_data)
        for ligne_data in lignes_data:
            LigneCommande.objects.create(commande=commande, **ligne_data)
        return commande

    def update(self, instance, validated_data):
        lignes_data = validated_data.pop('lignes', None)
        instance.type_commande = validated_data.get('type_commande', instance.type_commande)
        instance.statut = validated_data.get('statut', instance.statut)
        instance.fournisseur = validated_data.get('fournisseur', instance.fournisseur)
        instance.client = validated_data.get('client', instance.client)
        instance.date_livraison_prevue = validated_data.get('date_livraison_prevue', instance.date_livraison_prevue)
        instance.note = validated_data.get('note', instance.note)
        instance.remise = validated_data.get('remise', instance.remise)
        instance.save()

        if lignes_data is not None:
            # Simple approach: delete existing lines and recreate
            instance.lignes.all().delete()
            for ligne_data in lignes_data:
                LigneCommande.objects.create(commande=instance, **ligne_data)
        
        return instance
