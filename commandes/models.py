from django.db import models
from django.contrib.auth.models import User


class Commande(models.Model):
    BROUILLON = 'brouillon'
    EN_COURS = 'en_cours'
    RECUE = 'recue'
    ANNULEE = 'annulee'
    STATUT_CHOICES = [
        (BROUILLON, 'Brouillon'),
        (EN_COURS, 'En cours'),
        (RECUE, 'Reçue'),
        (ANNULEE, 'Annulée'),
    ]
    ACHAT = 'achat'
    VENTE = 'vente'
    TYPE_CHOICES = [(ACHAT, 'Achat'), (VENTE, 'Vente')]

    numero = models.CharField(max_length=30, unique=True, blank=True)
    type_commande = models.CharField(max_length=10, choices=TYPE_CHOICES, default=ACHAT)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default=BROUILLON)
    fournisseur = models.ForeignKey(
        'fournisseurs.Fournisseur', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='commandes'
    )
    client = models.ForeignKey(
        'clients.Client', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='commandes'
    )
    date_commande = models.DateField(auto_now_add=True)
    date_livraison_prevue = models.DateField(null=True, blank=True)
    date_livraison_reelle = models.DateField(null=True, blank=True)
    note = models.TextField(blank=True)
    remise = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    createur = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.numero or f"CMD-{self.pk}"

    @property
    def total_ht(self):
        return sum(l.total_ht for l in self.lignes.all())

    @property
    def total_ttc(self):
        return sum(l.total_ttc for l in self.lignes.all())

    def save(self, *args, **kwargs):
        if not self.numero:
            from django.utils import timezone
            year = timezone.now().year
            prefix = 'CA' if self.type_commande == 'achat' else 'CV'
            last = Commande.objects.filter(
                numero__startswith=f'{prefix}-{year}'
            ).order_by('numero').last()
            n = int(last.numero.split('-')[-1]) + 1 if last else 1
            self.numero = f"{prefix}-{year}-{n:04d}"
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Commande"


class LigneCommande(models.Model):
    commande = models.ForeignKey(Commande, on_delete=models.CASCADE, related_name='lignes')
    produit = models.ForeignKey('produits.Produit', on_delete=models.PROTECT)
    quantite = models.IntegerField(default=1)
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2)
    tva = models.DecimalField(max_digits=5, decimal_places=2, default=20)

    def __str__(self):
        return f"{self.produit.nom} x{self.quantite}"

    @property
    def total_ht(self):
        return self.quantite * self.prix_unitaire

    @property
    def total_ttc(self):
        return self.total_ht * (1 + self.tva / 100)

    class Meta:
        verbose_name = "Ligne de commande"
        verbose_name_plural = "Lignes de commande"
