from django.db import models


class Client(models.Model):
    PARTICULIER = 'particulier'
    ENTREPRISE = 'entreprise'
    TYPE_CHOICES = [(PARTICULIER, 'Particulier'), (ENTREPRISE, 'Entreprise')]

    type_client = models.CharField(max_length=20, choices=TYPE_CHOICES, default=PARTICULIER)
    nom = models.CharField(max_length=200)
    prenom = models.CharField(max_length=100, blank=True)
    code = models.CharField(max_length=20, unique=True, blank=True)
    email = models.EmailField(blank=True)
    telephone = models.CharField(max_length=20, blank=True)
    adresse = models.TextField(blank=True)
    ville = models.CharField(max_length=100, blank=True)
    ice = models.CharField(max_length=20, blank=True, verbose_name='ICE')
    plafond_credit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    remise_habituelle = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    note = models.TextField(blank=True)
    logo = models.ImageField(upload_to='clients/', blank=True, null=True)
    actif = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.prenom:
            return f"{self.prenom} {self.nom}"
        return self.nom

    @property
    def nom_complet(self):
        return str(self)

    def save(self, *args, **kwargs):
        if not self.code:
            last = Client.objects.order_by('id').last()
            n = (last.id + 1) if last else 1
            self.code = f"CLT-{n:04d}"
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['nom']
        verbose_name = "Client"
