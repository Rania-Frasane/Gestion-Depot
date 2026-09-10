from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from alertes.models import Alerte
from ai_assistant.anomaly_detector import detect_anomalies_and_alert

class Command(BaseCommand):
    help = 'Run anomaly detection and send daily alert digest emails.'

    def handle(self, *args, **options):
        self.stdout.write("Running anomaly detection...")
        new_anomalies = detect_anomalies_and_alert()
        self.stdout.write(f"Detected {new_anomalies} new anomalies.")
        
        # Now gather all unread alerts for the digest
        recent_alerts = Alerte.objects.filter(
            lue=False,
            created_at__gte=timezone.now() - timedelta(days=1)
        ).order_by('-priorite', '-created_at')
        
        if not recent_alerts.exists():
            self.stdout.write(self.style.SUCCESS("No recent unread alerts. No digest email sent."))
            return
            
        admin_emails = [email for name, email in getattr(settings, 'ADMINS', [])]
        if not admin_emails:
            admin_emails = [getattr(settings, 'DEFAULT_FROM_EMAIL', 'admin@example.com')]
            
        # Build digest
        high_count = recent_alerts.filter(priorite=Alerte.HAUTE).count()
        total_count = recent_alerts.count()
        
        subject = f"📊 Dépôt Manager : Digest des Alertes ({high_count} Hautes / {total_count} Total)"
        
        html_message = f"<h2>Résumé Quotidien des Alertes</h2>"
        html_message += f"<p>Vous avez <strong>{total_count}</strong> alertes récentes non lues, dont <strong>{high_count}</strong> de priorité haute.</p>"
        html_message += "<ul>"
        
        for alert in recent_alerts[:20]: # Show top 20
            color = "red" if alert.priorite == Alerte.HAUTE else ("orange" if alert.priorite == Alerte.MOYENNE else "gray")
            html_message += f"<li><span style='color:{color};'>[{alert.get_priorite_display()}]</span> <strong>{alert.titre}</strong> : {alert.message}</li>"
            
        if total_count > 20:
            html_message += f"<li><em>... et {total_count - 20} autres alertes.</em></li>"
            
        html_message += "</ul>"
        html_message += "<br><p><a href='http://127.0.0.1:8000/alertes/'>Consulter toutes les alertes</a></p>"
        
        plain_message = f"Vous avez {total_count} alertes récentes (dont {high_count} hautes). Connectez-vous pour les consulter."
        
        try:
            send_mail(
                subject,
                plain_message,
                getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@depotmanager.com'),
                admin_emails,
                html_message=html_message,
                fail_silently=False,
            )
            self.stdout.write(self.style.SUCCESS(f"Digest email sent successfully to {', '.join(admin_emails)}."))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error sending email: {e}"))
