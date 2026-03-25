from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.paginator import Paginator
from django.db import transaction
from .models import Commande, LigneCommande
from .forms import CommandeForm, LigneCommandeFormSet


@login_required
def liste(request):
    qs = Commande.objects.select_related('fournisseur', 'client')
    statut = request.GET.get('statut', '')
    type_cmd = request.GET.get('type', '')
    if statut:
        qs = qs.filter(statut=statut)
    if type_cmd:
        qs = qs.filter(type_commande=type_cmd)
    paginator = Paginator(qs, 20)
    page = paginator.get_page(request.GET.get('page'))
    return render(request, 'commandes/liste.html', {
        'commandes': page,
        'statuts': Commande.STATUT_CHOICES,
        'types': Commande.TYPE_CHOICES,
        'statut': statut,
        'type_cmd': type_cmd,
    })


@login_required
def detail(request, pk):
    commande = get_object_or_404(Commande, pk=pk)
    lignes = commande.lignes.select_related('produit')
    return render(request, 'commandes/detail.html', {'commande': commande, 'lignes': lignes})


@login_required
def ajouter(request):
    form = CommandeForm(request.POST or None)
    if form.is_valid():
        commande = form.save(commit=False)
        commande.createur = request.user
        commande.save()
        messages.success(request, f'Commande {commande.numero} créée!')
        return redirect('commandes:detail', pk=commande.pk)
    return render(request, 'commandes/form.html', {'form': form, 'titre': 'Nouvelle commande'})


@login_required
def modifier(request, pk):
    commande = get_object_or_404(Commande, pk=pk)
    form = CommandeForm(request.POST or None, instance=commande)
    if form.is_valid():
        form.save()
        messages.success(request, 'Commande modifiée!')
        return redirect('commandes:detail', pk=pk)
    return render(request, 'commandes/form.html', {'form': form, 'titre': 'Modifier', 'commande': commande})


@login_required
@transaction.atomic
def recevoir(request, pk):
    """Réceptionner une commande achat → génère les mouvements de stock"""
    commande = get_object_or_404(Commande, pk=pk, type_commande='achat')
    if commande.statut == 'recue':
        messages.warning(request, 'Commande déjà réceptionnée.')
        return redirect('commandes:detail', pk=pk)
    if request.method == 'POST':
        from produits.models import MouvementStock
        for ligne in commande.lignes.select_related('produit'):
            produit = ligne.produit
            stock_avant = produit.stock_actuel
            produit.stock_actuel += ligne.quantite
            produit.save()
            MouvementStock.objects.create(
                produit=produit,
                type_mouvement='entree',
                quantite=ligne.quantite,
                stock_avant=stock_avant,
                stock_apres=produit.stock_actuel,
                motif=f'Réception commande {commande.numero}',
                reference=commande.numero,
                utilisateur=request.user,
                commande=commande,
            )
        from django.utils import timezone
        commande.statut = 'recue'
        commande.date_livraison_reelle = timezone.now().date()
        commande.save()
        messages.success(request, f'Commande {commande.numero} réceptionnée! Stock mis à jour.')
        return redirect('commandes:detail', pk=pk)
    return render(request, 'commandes/confirmer_reception.html', {'commande': commande})


@login_required
def ajouter_ligne(request, pk):
    commande = get_object_or_404(Commande, pk=pk)
    from .forms import LigneCommandeForm
    form = LigneCommandeForm(request.POST or None)
    if form.is_valid():
        ligne = form.save(commit=False)
        ligne.commande = commande
        ligne.save()
        messages.success(request, 'Ligne ajoutée!')
        return redirect('commandes:detail', pk=pk)
    return render(request, 'commandes/ajouter_ligne.html', {'form': form, 'commande': commande})


@login_required
def supprimer_ligne(request, pk, ligne_pk):
    ligne = get_object_or_404(LigneCommande, pk=ligne_pk, commande__pk=pk)
    if request.method == 'POST':
        ligne.delete()
        messages.success(request, 'Ligne supprimée.')
    return redirect('commandes:detail', pk=pk)
