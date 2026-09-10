from django.db import models
from django.contrib.auth.models import User
import qrcode
from io import BytesIO
from django.core.files import File
import os


class Categorie(models.Model):
    nom = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nom

    class Meta:
        verbose_name = "Catégorie"
        verbose_name_plural = "Catégories"
        ordering = ['nom']

class Projet(models.Model):
    nom = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    entrepot = models.ForeignKey('logistique.Entrepot', on_delete=models.SET_NULL, null=True, blank=True, related_name='projets')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nom

    class Meta:
        verbose_name = "Projet"
        verbose_name_plural = "Projets"
        ordering = ['-created_at']


class Produit(models.Model):
    nom = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True)
    code_barre = models.CharField(max_length=100, blank=True)
    categorie = models.ForeignKey(
        Categorie, on_delete=models.SET_NULL, null=True, blank=True, related_name='produits'
    )
    projet = models.ForeignKey(
        Projet, on_delete=models.SET_NULL, null=True, blank=True, related_name='produits'
    )
    fournisseur_principal = models.ForeignKey(
        'fournisseurs.Fournisseur', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='produits'
    )
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='produits/', blank=True, null=True)
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True, null=True)
    prix_achat = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    prix_vente = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tva = models.DecimalField(max_digits=5, decimal_places=2, default=20)
    stock_actuel = models.IntegerField(default=0)
    stock_minimum = models.IntegerField(default=5)
    stock_maximum = models.IntegerField(default=1000)
    unite = models.CharField(max_length=20, default='pcs')
    emplacement = models.CharField(max_length=100, blank=True)
    actif = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Generate QR code if it doesn't exist or if code/code_barre changed
        # For simplicity, we regenerate if missing.
        if not self.qr_code:
            self.generate_qr_code(save=False)
        super().save(*args, **kwargs)

    def generate_qr_code(self, save=True):
        from PIL import Image, ImageDraw, ImageFont
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )
        qr_data = self.code_barre if self.code_barre else self.code
        qr.add_data(qr_data)
        qr.make(fit=True)

        qr_img = qr.make_image(fill_color="black", back_color="white").convert('RGB')
        
        # Add branding and name
        width, height = qr_img.size
        new_height = height + 60
        new_img = Image.new('RGB', (width, new_height), 'white')
        new_img.paste(qr_img, (0, 0))
        
        draw = ImageDraw.Draw(new_img)
        try:
            # Try to use a system font
            font = ImageFont.truetype("arial.ttf", 20)
        except:
            font = ImageFont.load_default()
            
        text = f"{self.nom}"
        # Center text
        text_width = draw.textlength(text, font=font) if hasattr(draw, 'textlength') else 100
        draw.text(((width - text_width) / 2, height - 5), text, fill="black", font=font)
        
        # Add "Depot Manager" branding
        brand_text = "Dépôt Manager"
        brand_font = ImageFont.load_default()
        draw.text((width - 80, new_height - 20), brand_text, fill="gray", font=brand_font)

        buffer = BytesIO()
        new_img.save(buffer, format='PNG')
        filename = f'qr_{self.code}.png'
        self.qr_code.save(filename, File(buffer), save=save)

    def __str__(self):
        return f"{self.code} - {self.nom}"

    @property
    def is_stock_bas(self):
        return self.stock_actuel <= self.stock_minimum

    @property
    def valeur_stock(self):
        return self.stock_actuel * self.prix_achat

    @property
    def prix_vente_ttc(self):
        return self.prix_vente * (1 + self.tva / 100)

    class Meta:
        ordering = ['nom']
        verbose_name = "Produit"


class MouvementStock(models.Model):
    ENTREE = 'entree'
    SORTIE = 'sortie'
    AJUSTEMENT = 'ajustement'
    RETOUR = 'retour'
    TYPE_CHOICES = [
        (ENTREE, 'Entrée'),
        (SORTIE, 'Sortie'),
        (AJUSTEMENT, 'Ajustement'),
        (RETOUR, 'Retour'),
    ]

    produit = models.ForeignKey(
        Produit, on_delete=models.CASCADE, related_name='mouvements'
    )
    type_mouvement = models.CharField(max_length=20, choices=TYPE_CHOICES)
    quantite = models.IntegerField()
    stock_avant = models.IntegerField()
    stock_apres = models.IntegerField()
    motif = models.CharField(max_length=255, blank=True)
    reference = models.CharField(max_length=100, blank=True)
    utilisateur = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    commande = models.ForeignKey(
        'commandes.Commande', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='mouvements'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_type_mouvement_display()} - {self.produit.nom} ({self.quantite})"

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Mouvement de stock"
        verbose_name_plural = "Mouvements de stock"
