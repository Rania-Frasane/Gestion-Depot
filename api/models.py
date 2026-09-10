from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """Extended profile for each Django user."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    photo = models.ImageField(upload_to='profiles/', null=True, blank=True)
    bio = models.TextField(blank=True, default='')
    organisation = models.CharField(max_length=255, blank=True, default='Dépôt Manager Pro')

    # Notification preferences
    notif_email = models.BooleanField(default=True)
    notif_stock_alerts = models.BooleanField(default=True)
    notif_order_updates = models.BooleanField(default=False)
    notif_sound = models.BooleanField(default=True)
    notif_mobile = models.BooleanField(default=False)

    # Display preferences
    display_compact = models.BooleanField(default=False)
    display_animations = models.BooleanField(default=True)

    # Regional settings
    language = models.CharField(max_length=10, default='fr')
    currency = models.CharField(max_length=10, default='MAD')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.username}"
