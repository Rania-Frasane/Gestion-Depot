from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q, F
from django.core.paginator import Paginator
from .models import Produit, Categorie, MouvementStock
from .forms import ProduitForm, MouvementForm


@login_required
def liste(request):
    qs = Produit.objects.select_related('categorie', 'fournisseur_principal').filter(actif=True)
    q = request.GET.get('q', '')
    cat = request.GET.get('categorie', '')
    stock_filtre = request.GET.get('stock', '')
    if q:
        qs = qs.filter(Q(nom__icontains=q) | Q(code__icontains=q) | Q(code_barre__icontains=q))
    if cat:
        qs = qs.filter(categorie_id=cat)
    if stock_filtre == 'bas':
        qs = qs.filter(stock_actuel__lte=F('stock_minimum'))
    elif stock_filtre == 'ok':
        qs = qs.filter(stock_actuel__gt=F('stock_minimum'))
    paginator = Paginator(qs, 25)
    page = paginator.get_page(request.GET.get('page'))
    return render(request, 'produits/liste.html', {
        'produits': page,
        'categories': Categorie.objects.all(),
        'q': q, 'cat': cat, 'stock_filtre': stock_filtre,
    })


@login_required
def detail(request, pk):
    produit = get_object_or_404(Produit, pk=pk)
    mouvements = produit.mouvements.select_related('utilisateur', 'commande').order_by('-created_at')[:30]
    return render(request, 'produits/detail.html', {
        'produit': produit, 'mouvements': mouvements
    })


@login_required
def ajouter(request):
    form = ProduitForm(request.POST or None, request.FILES or None)
    if form.is_valid():
        form.save()
        messages.success(request, 'Produit ajouté!')
        return redirect('produits:liste')
    return render(request, 'produits/form.html', {'form': form, 'titre': 'Ajouter produit'})


@login_required
def modifier(request, pk):
    produit = get_object_or_404(Produit, pk=pk)
    form = ProduitForm(request.POST or None, request.FILES or None, instance=produit)
    if form.is_valid():
        form.save()
        messages.success(request, 'Produit modifié!')
        return redirect('produits:detail', pk=pk)
    return render(request, 'produits/form.html', {'form': form, 'titre': 'Modifier', 'produit': produit})


@login_required
def supprimer(request, pk):
    produit = get_object_or_404(Produit, pk=pk)
    if request.method == 'POST':
        produit.actif = False
        produit.save()
        messages.success(request, 'Produit archivé.')
        return redirect('produits:liste')
    return render(request, 'produits/confirmer_suppression.html', {'produit': produit})


@login_required
def mouvement(request, pk):
    produit = get_object_or_404(Produit, pk=pk)
    form = MouvementForm(request.POST or None)
    if form.is_valid():
        m = form.save(commit=False)
        m.produit = produit
        m.utilisateur = request.user
        m.stock_avant = produit.stock_actuel
        if m.type_mouvement == 'entree' or m.type_mouvement == 'retour':
            produit.stock_actuel += m.quantite
        elif m.type_mouvement == 'sortie':
            if m.quantite > produit.stock_actuel:
                messages.error(request, f'Stock insuffisant! Disponible: {produit.stock_actuel}')
                return render(request, 'produits/mouvement.html', {'form': form, 'produit': produit})
            produit.stock_actuel -= m.quantite
        else:
            produit.stock_actuel = m.quantite
        m.stock_apres = produit.stock_actuel
        produit.save()
        m.save()
        # Vérifier alerte stock bas
        if produit.is_stock_bas:
            from alertes.utils import creer_alerte_stock
            creer_alerte_stock(produit)
        messages.success(request, 'Mouvement enregistré!')
        return redirect('produits:detail', pk=pk)
    return render(request, 'produits/mouvement.html', {'form': form, 'produit': produit})
