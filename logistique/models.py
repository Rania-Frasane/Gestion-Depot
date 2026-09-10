from django.db import models
from django.contrib.auth.models import User
from produits.models import Produit

class Entrepot(models.Model):
    nom = models.CharField(max_length=100)
    adresse = models.TextField(blank=True)
    ville = models.CharField(max_length=100, blank=True)
    responsable = models.ForeignKey('employes.Employe', on_delete=models.SET_NULL, null=True, blank=True)
    actif = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nom

    class Meta:
        verbose_name = "Entrepôt"
        verbose_name_plural = "Entrepôts"

class Emplacement(models.Model):
    entrepot = models.ForeignKey(Entrepot, on_delete=models.CASCADE, related_name='emplacements')
    code = models.CharField(max_length=50) # e.g. A1, ZONE-B-12
    description = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f"{self.entrepot.nom} - {self.code}"

    class Meta:
        unique_together = ('entrepot', 'code')
        verbose_name = "Emplacement"
        verbose_name_plural = "Emplacements"

class StockParEmplacement(models.Model):
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE, related_name='stocks_emplacements')
    emplacement = models.ForeignKey(Emplacement, on_delete=models.CASCADE, related_name='stocks')
    quantite = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.produit.nom} @ {self.emplacement.code} ({self.quantite})"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.sync_produit_stock()

    def delete(self, *args, **kwargs):
        produit = self.produit
        super().delete(*args, **kwargs)
        total_qty = StockParEmplacement.objects.filter(produit=produit).aggregate(total=models.Sum('quantite'))['total'] or 0
        produit.stock_actuel = total_qty
        produit.save(update_fields=['stock_actuel'])

    def sync_produit_stock(self):
        total_qty = StockParEmplacement.objects.filter(produit=self.produit).aggregate(total=models.Sum('quantite'))['total'] or 0
        self.produit.stock_actuel = total_qty
        self.produit.save(update_fields=['stock_actuel'])

    class Meta:
        unique_together = ('produit', 'emplacement')
        verbose_name = "Stock par emplacement"
        verbose_name_plural = "Stocks par emplacement"

class TransfertStock(models.Model):
    BROUILLON = 'brouillon'
    EXPEDIE = 'expedie'
    RECU = 'recu'
    ANNULE = 'annule'
    STATUT_CHOICES = [
        (BROUILLON, 'Brouillon'),
        (EXPEDIE, 'Expédié'),
        (RECU, 'Reçu'),
        (ANNULE, 'Annulé'),
    ]

    numero = models.CharField(max_length=30, unique=True, blank=True)
    entrepot_source = models.ForeignKey(Entrepot, on_delete=models.CASCADE, related_name='transferts_sortants')
    entrepot_destination = models.ForeignKey(Entrepot, on_delete=models.CASCADE, related_name='transferts_entrants')
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default=BROUILLON)
    date_transfert = models.DateTimeField(auto_now_add=True)
    date_reception = models.DateTimeField(null=True, blank=True)
    createur = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='transferts_crees')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.numero or f"TR-{self.pk}"

    def save(self, *args, **kwargs):
        if not self.numero:
            from django.utils import timezone
            year = timezone.now().year
            last = TransfertStock.objects.filter(numero__startswith=f'TR-{year}').order_by('numero').last()
            n = int(last.numero.split('-')[-1]) + 1 if last else 1
            self.numero = f"TR-{year}-{n:04d}"
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Transfert de stock"
        verbose_name_plural = "Transferts de stock"
        ordering = ['-created_at']

class LigneTransfert(models.Model):
    transfert = models.ForeignKey(TransfertStock, on_delete=models.CASCADE, related_name='lignes')
    produit = models.ForeignKey(Produit, on_delete=models.CASCADE)
    quantite = models.IntegerField()

    def __str__(self):
        return f"{self.produit.nom} ({self.quantite})"
