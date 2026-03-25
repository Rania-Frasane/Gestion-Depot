from django.db import models
from django.contrib.auth.models import User


class Facture(models.Model):
    BROUILLON = 'brouillon'
    EMISE = 'emise'
    PAYEE = 'payee'
    ANNULEE = 'annulee'
    STATUT_CHOICES = [
        (BROUILLON, 'Brouillon'),
        (EMISE, 'Émise'),
        (PAYEE, 'Payée'),
        (ANNULEE, 'Annulée'),
    ]

    numero = models.CharField(max_length=30, unique=True, blank=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default=BROUILLON)
    client = models.ForeignKey(
        'clients.Client', on_delete=models.PROTECT, related_name='factures'
    )
    commande = models.ForeignKey(
        'commandes.Commande', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='factures'
    )
    date_emission = models.DateField(auto_now_add=True)
    date_echeance = models.DateField(null=True, blank=True)
    remise = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    note = models.TextField(blank=True)
    createur = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.numero or f"FACT-{self.pk}"

    @property
    def total_ht(self):
        return sum(l.total_ht for l in self.lignes.all())

    @property
    def total_tva(self):
        return sum(l.total_ttc - l.total_ht for l in self.lignes.all())

    @property
    def total_ttc(self):
        return sum(l.total_ttc for l in self.lignes.all())

    @property
    def total_apres_remise(self):
        return self.total_ttc * (1 - self.remise / 100)

    def save(self, *args, **kwargs):
        if not self.numero:
            from django.utils import timezone
            year = timezone.now().year
            last = Facture.objects.filter(
                numero__startswith=f'FACT-{year}'
            ).order_by('numero').last()
            n = int(last.numero.split('-')[-1]) + 1 if last else 1
            self.numero = f"FACT-{year}-{n:05d}"
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Facture"


class LigneFacture(models.Model):
    facture = models.ForeignKey(Facture, on_delete=models.CASCADE, related_name='lignes')
    produit = models.ForeignKey('produits.Produit', on_delete=models.PROTECT)
    description = models.CharField(max_length=255, blank=True)
    quantite = models.IntegerField(default=1)
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2)
    tva = models.DecimalField(max_digits=5, decimal_places=2, default=20)

    @property
    def total_ht(self):
        return self.quantite * self.prix_unitaire

    @property
    def total_ttc(self):
        return self.total_ht * (1 + self.tva / 100)

    class Meta:
        verbose_name = "Ligne de facture"
        verbose_name_plural = "Lignes de facture"
