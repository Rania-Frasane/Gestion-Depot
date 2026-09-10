from django.db import models
from django.contrib.auth.models import User


class ChatSession(models.Model):
    """Represents a single chat conversation session for a user."""
    utilisateur = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='chat_sessions'
    )
    titre = models.CharField(max_length=200, default='Nouvelle conversation')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Session #{self.pk} – {self.utilisateur.username}"

    class Meta:
        ordering = ['-updated_at']
        verbose_name = "Session de chat"
        verbose_name_plural = "Sessions de chat"


class ChatMessage(models.Model):
    """Stores one message (user or assistant) within a ChatSession."""
    USER_ROLE = 'user'
    ASSISTANT_ROLE = 'assistant'
    ROLE_CHOICES = [
        (USER_ROLE, 'Utilisateur'),
        (ASSISTANT_ROLE, 'Assistant'),
    ]

    session = models.ForeignKey(
        ChatSession, on_delete=models.CASCADE, related_name='messages'
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.role}] {self.content[:60]}"

    class Meta:
        ordering = ['created_at']
        verbose_name = "Message de chat"
        verbose_name_plural = "Messages de chat"

class AlertRule(models.Model):
    """Stores configuration for the anomaly detection and smart alerts."""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    # ML/Stats sensitivity settings
    # Number of standard deviations to be considered an anomaly
    std_dev_threshold = models.FloatField(default=3.0)
    # Minimum quantity to even consider checking for anomaly
    min_quantity_threshold = models.IntegerField(default=10)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Règle: {self.name}"
