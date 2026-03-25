from django.db import models
from django.contrib.auth.models import User


class Alerte(models.Model):
    STOCK_BAS = 'stock_bas'
    STOCK_RUPTURE = 'stock_rupture'
    COMMANDE = 'commande'
    SYSTEME = 'systeme'
    TYPE_CHOICES = [
        (STOCK_BAS, 'Stock bas'),
        (STOCK_RUPTURE, 'Rupture de stock'),
        (COMMANDE, 'Commande'),
        (SYSTEME, 'Système'),
    ]
    BASSE = 'basse'
    MOYENNE = 'moyenne'
    HAUTE = 'haute'
    PRIORITE_CHOICES = [
        (BASSE, 'Basse'),
        (MOYENNE, 'Moyenne'),
        (HAUTE, 'Haute'),
    ]

    type_alerte = models.CharField(max_length=20, choices=TYPE_CHOICES)
    priorite = models.CharField(max_length=10, choices=PRIORITE_CHOICES, default=MOYENNE)
    titre = models.CharField(max_length=200)
    message = models.TextField()
    produit = models.ForeignKey(
        'produits.Produit', on_delete=models.CASCADE,
        null=True, blank=True, related_name='alertes'
    )
    lue = models.BooleanField(default=False)
    lue_par = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    lue_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titre

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Alerte"
