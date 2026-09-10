from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q, F
from django.core.paginator import Paginator
from .models import Produit, Categorie, MouvementStock
from .forms import ProduitForm, MouvementForm
from .serializers import ProduitSerializer


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

# ─────────────────────────────────────────────────────────────
# Module 5: Barcode & Scanner
# ─────────────────────────────────────────────────────────────

@login_required
def print_labels(request):
    produits = Produit.objects.filter(actif=True).order_by('nom')
    if request.method == 'POST':
        p_ids = request.POST.getlist('produits')
        if not p_ids:
            messages.error(request, "Veuillez sélectionner au moins un produit.")
            return render(request, 'produits/etiquettes_select.html', {'produits': produits})
        selected_produits = Produit.objects.filter(id__in=p_ids)
        return render(request, 'produits/etiquettes_print.html', {'produits': selected_produits})
    return render(request, 'produits/etiquettes_select.html', {'produits': produits})

@login_required
def scanner(request):
    return render(request, 'produits/scanner.html')

from django.http import JsonResponse
import json

@login_required
def api_scanner_mouvement(request):
    """API endpoint for the fast browser scanner."""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            code = data.get('code')
            action = data.get('action') # 'entree' or 'sortie'
            quantite = int(data.get('quantite', 1))
            
            if not code or action not in ['entree', 'sortie']:
                return JsonResponse({'success': False, 'error': 'Données invalides.'})
                
            produit = Produit.objects.filter(Q(code_barre=code) | Q(code=code)).first()
            if not produit:
                return JsonResponse({'success': False, 'error': f'Produit avec le code {code} introuvable.'})
                
            if action == 'sortie' and produit.stock_actuel < quantite:
                return JsonResponse({'success': False, 'error': f'Stock insuffisant pour {produit.nom}. Disponible: {produit.stock_actuel}'})
                
            # Perform movement
            stock_avant = produit.stock_actuel
            if action == 'entree':
                produit.stock_actuel += quantite
            elif action == 'sortie':
                produit.stock_actuel -= quantite
                
            m = MouvementStock(
                produit=produit,
                utilisateur=request.user,
                type_mouvement=action,
                quantite=quantite,
                stock_avant=stock_avant,
                stock_apres=produit.stock_actuel,
                motif="Scan Rapide (Browser)"
            )
            produit.save()
            m.save()
            
            serializer = ProduitSerializer(produit, context={'request': request})
            
            return JsonResponse({
                'success': True,
                'produit': serializer.data,
                'action_label': "Ajouté" if action == 'entree' else "Retiré",
                'quantite': quantite,
                'nouveau_stock': produit.stock_actuel
            })
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Method Not Allowed.'}, status=405)

@login_required
def regenerate_qr_code(request, pk):
    """View to manually trigger QR code regeneration."""
    produit = get_object_or_404(Produit, pk=pk)
    produit.generate_qr_code()
    messages.success(request, f"Code QR régénéré pour {produit.nom}")
    return redirect('produits:detail', pk=pk)
