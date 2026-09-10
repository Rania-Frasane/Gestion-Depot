from rest_framework import serializers
from .models import Employe, Poste

class PosteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Poste
        fields = '__all__'

class EmployeSerializer(serializers.ModelSerializer):
    poste_nom = serializers.CharField(source='poste.nom', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Employe
        fields = '__all__'
        extra_kwargs = {
            'photo': {'required': False}
        }
