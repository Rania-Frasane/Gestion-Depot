from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q
from django.core.paginator import Paginator
from .models import Fournisseur
from .forms import FournisseurForm


@login_required
def liste(request):
    qs = Fournisseur.objects.filter(actif=True)
    q = request.GET.get('q', '')
    if q:
        qs = qs.filter(Q(nom__icontains=q) | Q(email__icontains=q) | Q(ville__icontains=q))
    paginator = Paginator(qs, 20)
    page = paginator.get_page(request.GET.get('page'))
    return render(request, 'fournisseurs/liste.html', {'fournisseurs': page, 'q': q})


@login_required
def detail(request, pk):
    fournisseur = get_object_or_404(Fournisseur, pk=pk)
    produits = fournisseur.produits.filter(actif=True)
    return render(request, 'fournisseurs/detail.html', {
        'fournisseur': fournisseur, 'produits': produits
    })


@login_required
def ajouter(request):
    form = FournisseurForm(request.POST or None)
    if form.is_valid():
        form.save()
        messages.success(request, 'Fournisseur ajouté!')
        return redirect('fournisseurs:liste')
    return render(request, 'fournisseurs/form.html', {'form': form, 'titre': 'Ajouter fournisseur'})


@login_required
def modifier(request, pk):
    fournisseur = get_object_or_404(Fournisseur, pk=pk)
    form = FournisseurForm(request.POST or None, instance=fournisseur)
    if form.is_valid():
        form.save()
        messages.success(request, 'Fournisseur modifié!')
        return redirect('fournisseurs:detail', pk=pk)
    return render(request, 'fournisseurs/form.html', {'form': form, 'titre': 'Modifier', 'obj': fournisseur})


@login_required
def supprimer(request, pk):
    fournisseur = get_object_or_404(Fournisseur, pk=pk)
    if request.method == 'POST':
        fournisseur.actif = False
        fournisseur.save()
        messages.success(request, 'Fournisseur archivé.')
        return redirect('fournisseurs:liste')
    return render(request, 'fournisseurs/confirmer.html', {'obj': fournisseur})
