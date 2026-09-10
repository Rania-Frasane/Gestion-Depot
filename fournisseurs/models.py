from django.db import models


class Fournisseur(models.Model):
    nom = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True, blank=True)
    email = models.EmailField(blank=True)
    telephone = models.CharField(max_length=20, blank=True)
    telephone2 = models.CharField(max_length=20, blank=True)
    adresse = models.TextField(blank=True)
    ville = models.CharField(max_length=100, blank=True)
    pays = models.CharField(max_length=100, default='Maroc')
    ice = models.CharField(max_length=20, blank=True, verbose_name='ICE')
    rc = models.CharField(max_length=50, blank=True, verbose_name='RC')
    contact_nom = models.CharField(max_length=100, blank=True)
    delai_livraison = models.IntegerField(default=7, help_text='Jours')
    conditions_paiement = models.CharField(max_length=100, blank=True, default='30 jours')
    note = models.TextField(blank=True)
    logo = models.ImageField(upload_to='fournisseurs/', blank=True, null=True)
    actif = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nom

    class Meta:
        ordering = ['nom']
        verbose_name = "Fournisseur"

    def save(self, *args, **kwargs):
        if not self.code:
            last = Fournisseur.objects.order_by('id').last()
            n = (last.id + 1) if last else 1
            self.code = f"FRN-{n:04d}"
        super().save(*args, **kwargs)

class DocumentFournisseur(models.Model):
    fournisseur = models.ForeignKey(Fournisseur, on_delete=models.CASCADE, related_name='documents')
    fichier = models.FileField(upload_to='documents_fournisseurs/')
    nom = models.CharField(max_length=255)
    taille = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.fichier and not self.taille:
            size_bytes = self.fichier.size
            if size_bytes < 1024 * 1024:
                self.taille = f"{size_bytes / 1024:.1f} KB"
            else:
                self.taille = f"{size_bytes / (1024 * 1024):.1f} MB"
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-created_at']
