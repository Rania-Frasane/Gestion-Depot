from rest_framework import serializers
from .models import Entrepot, Emplacement, StockParEmplacement, TransfertStock, LigneTransfert

class EntrepotSerializer(serializers.ModelSerializer):
    responsable_nom = serializers.SerializerMethodField(read_only=True)

    def get_responsable_nom(self, obj):
        if obj.responsable:
            return f"{obj.responsable.prenom} {obj.responsable.nom}"
        return None

    class Meta:
        model = Entrepot
        fields = '__all__'

class EmplacementSerializer(serializers.ModelSerializer):
    entrepot_nom = serializers.CharField(source='entrepot.nom', read_only=True)
    class Meta:
        model = Emplacement
        fields = '__all__'

class StockParEmplacementSerializer(serializers.ModelSerializer):
    produit_nom = serializers.CharField(source='produit.nom', read_only=True)
    emplacement_code = serializers.CharField(source='emplacement.code', read_only=True)
    entrepot_nom = serializers.CharField(source='emplacement.entrepot.nom', read_only=True)
    
    class Meta:
        model = StockParEmplacement
        fields = '__all__'

class LigneTransfertSerializer(serializers.ModelSerializer):
    produit_nom = serializers.CharField(source='produit.nom', read_only=True)
    class Meta:
        model = LigneTransfert
        fields = ['id', 'produit', 'produit_nom', 'quantite']

class TransfertStockSerializer(serializers.ModelSerializer):
    entrepot_source_nom = serializers.CharField(source='entrepot_source.nom', read_only=True)
    entrepot_destination_nom = serializers.CharField(source='entrepot_destination.nom', read_only=True)
    createur_nom = serializers.CharField(source='createur.username', read_only=True)
    lignes = LigneTransfertSerializer(many=True)
    
    class Meta:
        model = TransfertStock
        fields = '__all__'

    def create(self, validated_data):
        lignes_data = validated_data.pop('lignes', [])
        transfert = TransfertStock.objects.create(**validated_data)
        for ligne_data in lignes_data:
            LigneTransfert.objects.create(transfert=transfert, **ligne_data)
        return transfert

    def update(self, instance, validated_data):
        lignes_data = validated_data.pop('lignes', None)
        instance.entrepot_source = validated_data.get('entrepot_source', instance.entrepot_source)
        instance.entrepot_destination = validated_data.get('entrepot_destination', instance.entrepot_destination)
        instance.statut = validated_data.get('statut', instance.statut)
        instance.notes = validated_data.get('notes', instance.notes)
        instance.save()

        if lignes_data is not None:
            instance.lignes.all().delete()
            for ligne_data in lignes_data:
                LigneTransfert.objects.create(transfert=instance, **ligne_data)
        
        return instance
