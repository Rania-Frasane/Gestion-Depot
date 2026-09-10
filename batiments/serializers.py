from rest_framework import serializers
from .models import Batiment, Etage, Local

class LocalSerializer(serializers.ModelSerializer):
    responsable_nom = serializers.SerializerMethodField(read_only=True)
    etage_nom = serializers.CharField(source='etage.nom', read_only=True)
    batiment_nom = serializers.CharField(source='etage.batiment.nom', read_only=True)

    def get_responsable_nom(self, obj):
        if obj.responsable:
            return f"{obj.responsable.prenom} {obj.responsable.nom}"
        return None

    class Meta:
        model = Local
        fields = '__all__'

class EtageSerializer(serializers.ModelSerializer):
    locaux = LocalSerializer(many=True, read_only=True)
    batiment_nom = serializers.CharField(source='batiment.nom', read_only=True)

    class Meta:
        model = Etage
        fields = '__all__'

class BatimentSerializer(serializers.ModelSerializer):
    etages = EtageSerializer(many=True, read_only=True)

    class Meta:
        model = Batiment
        fields = '__all__'
