from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from ai_assistant.reorder_engine import generate_reorder_suggestions

class Command(BaseCommand):
    help = 'Analyse les stocks et envoie des alertes email pour les réapprovisionnements critiques.'

    def handle(self, *args, **options):
        self.stdout.write("Début de l'analyse des réapprovisionnements...")
        
        suggestions = generate_reorder_suggestions()
        
        if not suggestions:
            self.stdout.write(self.style.SUCCESS("Aucun réapprovisionnement critique. Aucun email envoyé."))
            return
            
        # Compile a summary for the email
        total_lignes = sum(len(s['lignes']) for s in suggestions)
        total_cout = sum(s['total_estime'] for s in suggestions)
        
        # Determine the recipient email (use ADMINS from settings or a default)
        admin_emails = [email for name, email in getattr(settings, 'ADMINS', [])]
        if not admin_emails:
            admin_emails = [getattr(settings, 'DEFAULT_FROM_EMAIL', 'admin@example.com')]
            
        context = {
            'suggestions': suggestions,
            'total_lignes': total_lignes,
            'total_cout': total_cout,
            'total_fournisseurs': len(suggestions),
        }
        
        # Prepare email content
        subject = f"🚨 Dépôt Manager : {total_lignes} produits nécessitent un réapprovisionnement"
        html_message = self.build_html_email(context)
        plain_message = f"Vous avez {total_lignes} produits à réapprovisionner auprès de {len(suggestions)} fournisseurs. Coût estimé : {total_cout:.2f} MAD. Connectez-vous à Dépôt Manager pour générer les commandes brouillon."
        
        try:
            send_mail(
                subject,
                plain_message,
                getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@depotmanager.com'),
                admin_emails,
                html_message=html_message,
                fail_silently=False,
            )
            self.stdout.write(self.style.SUCCESS(f"Alerte email envoyée avec succès à {', '.join(admin_emails)}."))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Erreur lors de l'envoi de l'email : {e}"))

    def build_html_email(self, context):
        """Construct a simple HTML email for the alerts without requiring a template file."""
        html = "<h2>Alerte de Réapprovisionnement Intelligent</h2>"
        html += f"<p><strong>{context['total_lignes']}</strong> produits nécessitent votre attention (Coût estimé: <strong>{context['total_cout']:.2f} MAD</strong>).</p>"
        
        for s in context['suggestions']:
            html += f"<h3>Fournisseur : {s['fournisseur_nom']}</h3>"
            html += "<ul>"
            for ligne in s['lignes']:
                html += f"<li>{ligne['produit_code']} - {ligne['produit_nom']} : Stock actuel <strong>{ligne['stock_actuel']}</strong>, Suggéré <strong>{ligne['quantite_suggeree']}</strong></li>"
            html += "</ul>"
            html += f"<p><em>Total estimé pour ce fournisseur : {s['total_estime']:.2f} MAD</em></p><hr>"
            
        html += "<br><p><a href='http://127.0.0.1:8000/ai/reorders/'>Cliquez ici pour accéder au tableau de bord de réapprovisionnement</a></p>"
        return html
