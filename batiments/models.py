from django.db import models

class Batiment(models.Model):
    nom = models.CharField(max_length=100)
    adresse = models.TextField(blank=True, null=True)
    ville = models.CharField(max_length=100, blank=True)
    nb_etages = models.IntegerField(default=1)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nom

    class Meta:
        verbose_name = "Bâtiment"
        verbose_name_plural = "Bâtiments"

class Etage(models.Model):
    batiment = models.ForeignKey(Batiment, on_delete=models.CASCADE, related_name='etages')
    numero_etage = models.IntegerField()
    nom = models.CharField(max_length=50) # e.g. "Rez-de-chaussée", "1er étage"
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.batiment.nom} - {self.nom}"

    class Meta:
        verbose_name = "Étage"
        verbose_name_plural = "Étages"
        unique_together = ('batiment', 'numero_etage')

class Local(models.Model):
    BUREAU = 'bureau'
    SALLE_REUNION = 'salle_reunion'
    DEPOT = 'depot'
    LABO = 'labo'
    AUTRE = 'autre'
    TYPE_CHOICES = [
        (BUREAU, 'Bureau'),
        (SALLE_REUNION, 'Salle de réunion'),
        (DEPOT, 'Dépôt / Stockage'),
        (LABO, 'Laboratoire'),
        (AUTRE, 'Autre'),
    ]

    etage = models.ForeignKey(Etage, on_delete=models.CASCADE, related_name='locaux')
    code = models.CharField(max_length=50, unique=True) # e.g. "B1-E2-04"
    nom = models.CharField(max_length=100)
    type_local = models.CharField(max_length=30, choices=TYPE_CHOICES, default=BUREAU)
    superficie = models.DecimalField(max_digits=6, decimal_places=2, help_text="en m²")
    responsable = models.ForeignKey('employes.Employe', on_delete=models.SET_NULL, null=True, blank=True)
    actif = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.code} - {self.nom}"

    class Meta:
        verbose_name = "Local"
        verbose_name_plural = "Locaux"
