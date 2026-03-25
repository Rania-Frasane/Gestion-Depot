from .models import Alerte


def creer_alerte_stock(produit):
    """Crée ou met à jour une alerte stock bas pour un produit."""
    # Vérifier si une alerte non lue existe déjà
    existe = Alerte.objects.filter(
        produit=produit,
        type_alerte__in=['stock_bas', 'stock_rupture'],
        lue=False
    ).exists()
    if existe:
        return

    if produit.stock_actuel == 0:
        type_alerte = Alerte.STOCK_RUPTURE
        priorite = Alerte.HAUTE
        titre = f"Rupture de stock: {produit.nom}"
        message = f"Le produit '{produit.nom}' ({produit.code}) est en rupture de stock."
    else:
        type_alerte = Alerte.STOCK_BAS
        priorite = Alerte.MOYENNE
        titre = f"Stock bas: {produit.nom}"
        message = (
            f"Le produit '{produit.nom}' ({produit.code}) a atteint son stock minimum. "
            f"Stock actuel: {produit.stock_actuel} {produit.unite} "
            f"(minimum: {produit.stock_minimum} {produit.unite})"
        )

    alerte = Alerte.objects.create(
        type_alerte=type_alerte,
        priorite=priorite,
        titre=titre,
        message=message,
        produit=produit,
    )

    # Envoyer email si configuré
    try:
        envoyer_email_alerte(alerte)
    except Exception:
        pass  # Ne pas bloquer si l'email échoue


def envoyer_email_alerte(alerte):
    from django.core.mail import send_mail
    from django.conf import settings
    dest = getattr(settings, 'STOCK_ALERTE_EMAIL', None)
    if not dest:
        return
    send_mail(
        subject=f"[Dépôt Manager] {alerte.titre}",
        message=alerte.message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[dest],
        fail_silently=True,
    )
