from django.db import models
from django.contrib.auth.models import User


class Poste(models.Model):
    nom = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.nom

    class Meta:
        ordering = ['nom']


class Employe(models.Model):
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='employe')
    matricule = models.CharField(max_length=20, unique=True, blank=True)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    poste = models.ForeignKey(Poste, on_delete=models.SET_NULL, null=True, blank=True)
    email = models.EmailField(blank=True)
    telephone = models.CharField(max_length=20, blank=True)
    date_embauche = models.DateField()
    salaire = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    adresse = models.TextField(blank=True)
    cin = models.CharField(max_length=20, blank=True, verbose_name='CIN')
    photo = models.ImageField(upload_to='employes/', null=True, blank=True)
    avatar_type = models.CharField(max_length=50, default='default')
    actif = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.prenom} {self.nom}"

    @property
    def nom_complet(self):
        return str(self)

    def save(self, *args, **kwargs):
        if not self.matricule:
            last = Employe.objects.order_by('id').last()
            n = (last.id + 1) if last else 1
            self.matricule = f"EMP-{n:04d}"
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['nom', 'prenom']
        verbose_name = "Employé"
        verbose_name_plural = "Employés"
