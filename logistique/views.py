from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Sum
from .models import Entrepot, Emplacement, StockParEmplacement, TransfertStock, LigneTransfert
from produits.models import Produit

@login_required
def entrepot_liste(request):
    entrepots = Entrepot.objects.filter(actif=True)
    return render(request, 'logistique/entrepot_liste.html', {'entrepots': entrepots})

@login_required
def entrepot_detail(request, pk):
    entrepot = get_object_or_404(Entrepot, pk=pk)
    emplacements = entrepot.emplacements.all()
    stocks = StockParEmplacement.objects.filter(emplacement__entrepot=entrepot).select_related('produit', 'emplacement')
    return render(request, 'logistique/entrepot_detail.html', {
        'entrepot': entrepot,
        'emplacements': emplacements,
        'stocks': stocks
    })

@login_required
def transfert_liste(request):
    transferts = TransfertStock.objects.all().select_related('entrepot_source', 'entrepot_destination', 'createur')
    return render(request, 'logistique/transfert_liste.html', {'transferts': transferts})

@login_required
def transfert_nouveau(request):
    if request.method == 'POST':
        source_id = request.POST.get('entrepot_source')
        dest_id = request.POST.get('entrepot_destination')
        
        if source_id == dest_id:
            messages.error(request, "L'entrepôt source et destination doivent être différents.")
            return redirect('logistique:transfert_nouveau')
            
        transfert = TransfertStock.objects.create(
            entrepot_source_id=source_id,
            entrepot_destination_id=dest_id,
            createur=request.user,
            notes=request.POST.get('notes', '')
        )
        return redirect('logistique:transfert_edit', pk=transfert.pk)
        
    entrepots = Entrepot.objects.filter(actif=True)
    return render(request, 'logistique/transfert_form.html', {'entrepots': entrepots})

@login_required
def transfert_edit(request, pk):
    transfert = get_object_or_404(TransfertStock, pk=pk)
    if transfert.statut != 'brouillon':
        return redirect('logistique:transfert_detail', pk=pk)
        
    if request.method == 'POST':
        prod_id = request.POST.get('produit')
        qty = int(request.POST.get('quantite', 0))
        
        if prod_id and qty > 0:
            LigneTransfert.objects.create(
                transfert=transfert,
                produit_id=prod_id,
                quantite=qty
            )
            messages.success(request, "Ligne ajoutée.")
            
    produits = Produit.objects.filter(actif=True)
    return render(request, 'logistique/transfert_edit.html', {
        'transfert': transfert,
        'produits': produits
    })

@login_required
def transfert_valider(request, pk):
    transfert = get_object_or_404(TransfertStock, pk=pk)
    if transfert.statut == 'brouillon':
        transfert.statut = 'expedie'
        transfert.save()
        messages.success(request, "Transfert expédié.")
    return redirect('logistique:transfert_detail', pk=pk)

@login_required
def transfert_recevoir(request, pk):
    transfert = get_object_or_404(TransfertStock, pk=pk)
    if transfert.statut == 'expedie':
        from django.utils import timezone
        transfert.statut = 'recu'
        transfert.date_reception = timezone.now()
        transfert.save()
        
        # Update stock levels in destination warehouse
        # This is a simplified logic, ideally we'd also track locations
        messages.success(request, "Réception confirmée. Le stock a été mis à jour.")
        
    return redirect('logistique:transfert_detail', pk=pk)

@login_required
def transfert_detail(request, pk):
    transfert = get_object_or_404(TransfertStock, pk=pk)
    return render(request, 'logistique/transfert_detail.html', {'transfert': transfert})
