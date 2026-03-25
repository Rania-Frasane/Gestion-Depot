from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.paginator import Paginator
from django.http import HttpResponse
from django.template.loader import render_to_string
from .models import Facture, LigneFacture
from .forms import FactureForm, LigneFactureForm


@login_required
def liste(request):
    qs = Facture.objects.select_related('client')
    statut = request.GET.get('statut', '')
    if statut:
        qs = qs.filter(statut=statut)
    paginator = Paginator(qs, 20)
    page = paginator.get_page(request.GET.get('page'))
    return render(request, 'facturation/liste.html', {
        'factures': page,
        'statuts': Facture.STATUT_CHOICES,
        'statut': statut,
    })


@login_required
def detail(request, pk):
    facture = get_object_or_404(Facture, pk=pk)
    lignes = facture.lignes.select_related('produit')
    return render(request, 'facturation/detail.html', {'facture': facture, 'lignes': lignes})


@login_required
def ajouter(request):
    form = FactureForm(request.POST or None)
    if form.is_valid():
        facture = form.save(commit=False)
        facture.createur = request.user
        facture.save()
        messages.success(request, f'Facture {facture.numero} créée!')
        return redirect('facturation:detail', pk=facture.pk)
    return render(request, 'facturation/form.html', {'form': form, 'titre': 'Nouvelle facture'})


@login_required
def modifier(request, pk):
    facture = get_object_or_404(Facture, pk=pk)
    form = FactureForm(request.POST or None, instance=facture)
    if form.is_valid():
        form.save()
        messages.success(request, 'Facture modifiée!')
        return redirect('facturation:detail', pk=pk)
    return render(request, 'facturation/form.html', {'form': form, 'titre': 'Modifier', 'facture': facture})


@login_required
def ajouter_ligne(request, pk):
    facture = get_object_or_404(Facture, pk=pk)
    form = LigneFactureForm(request.POST or None)
    if form.is_valid():
        ligne = form.save(commit=False)
        ligne.facture = facture
        # Auto-fill prix from produit if not overridden
        if not ligne.prix_unitaire:
            ligne.prix_unitaire = ligne.produit.prix_vente
        ligne.save()
        messages.success(request, 'Ligne ajoutée!')
        return redirect('facturation:detail', pk=pk)
    return render(request, 'facturation/ajouter_ligne.html', {'form': form, 'facture': facture})


@login_required
def supprimer_ligne(request, pk, ligne_pk):
    ligne = get_object_or_404(LigneFacture, pk=ligne_pk, facture__pk=pk)
    if request.method == 'POST':
        ligne.delete()
        messages.success(request, 'Ligne supprimée.')
    return redirect('facturation:detail', pk=pk)


@login_required
def changer_statut(request, pk, statut):
    facture = get_object_or_404(Facture, pk=pk)
    if statut in dict(Facture.STATUT_CHOICES):
        facture.statut = statut
        facture.save()
        messages.success(request, f'Statut mis à jour: {facture.get_statut_display()}')
    return redirect('facturation:detail', pk=pk)


@login_required
def imprimer(request, pk):
    """Génère une vue imprimable de la facture"""
    facture = get_object_or_404(Facture, pk=pk)
    lignes = facture.lignes.select_related('produit')
    return render(request, 'facturation/imprimer.html', {
        'facture': facture, 'lignes': lignes
    })
