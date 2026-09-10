from rest_framework import viewsets, permissions
from .models import Batiment, Etage, Local
from .serializers import BatimentSerializer, EtageSerializer, LocalSerializer

class BatimentViewSet(viewsets.ModelViewSet):
    queryset = Batiment.objects.all()
    serializer_class = BatimentSerializer
    permission_classes = [permissions.IsAuthenticated]

class EtageViewSet(viewsets.ModelViewSet):
    queryset = Etage.objects.all()
    serializer_class = EtageSerializer
    permission_classes = [permissions.IsAuthenticated]

class LocalViewSet(viewsets.ModelViewSet):
    queryset = Local.objects.all()
    serializer_class = LocalSerializer
    permission_classes = [permissions.IsAuthenticated]
