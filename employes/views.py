from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q
from django.core.paginator import Paginator
from .models import Employe, Poste
from .forms import EmployeForm

@login_required
def liste(request):
    qs = Employe.objects.select_related('poste','user').filter(actif=True)
    q = request.GET.get('q','')
    if q:
        qs = qs.filter(Q(nom__icontains=q)|Q(prenom__icontains=q)|Q(matricule__icontains=q))
    paginator = Paginator(qs, 20)
    page = paginator.get_page(request.GET.get('page'))
    return render(request, 'employes/liste.html', {'employes': page, 'q': q})

@login_required
def detail(request, pk):
    employe = get_object_or_404(Employe, pk=pk)
    return render(request, 'employes/detail.html', {'employe': employe})

@login_required
def ajouter(request):
    form = EmployeForm(request.POST or None)
    if form.is_valid():
        form.save()
        messages.success(request, 'Employé ajouté!')
        return redirect('employes:liste')
    return render(request, 'employes/form.html', {'form': form, 'titre': 'Ajouter employé'})

@login_required
def modifier(request, pk):
    employe = get_object_or_404(Employe, pk=pk)
    form = EmployeForm(request.POST or None, instance=employe)
    if form.is_valid():
        form.save()
        messages.success(request, 'Employé modifié!')
        return redirect('employes:detail', pk=pk)
    return render(request, 'employes/form.html', {'form': form, 'titre': 'Modifier', 'obj': employe})

@login_required
def supprimer(request, pk):
    employe = get_object_or_404(Employe, pk=pk)
    if request.method == 'POST':
        employe.actif = False
        employe.save()
        messages.success(request, 'Employé archivé.')
        return redirect('employes:liste')
    return render(request, 'employes/confirmer.html', {'obj': employe})

# ─────────────────────────────────────────────────────────────
# Module 7: Employee Performance Dashboard
# ─────────────────────────────────────────────────────────────
from django.db.models import Count, Sum
from produits.models import MouvementStock
from commandes.models import Commande
import json
from django.utils import timezone
from datetime import timedelta

@login_required
def performance_dashboard(request):
    """Dashboard showing performance KPIs for employees."""
    # Get all active employees with a user account linked
    employes = Employe.objects.filter(actif=True, user__isnull=False).select_related('user', 'poste')
    
    end_date = timezone.now()
    start_date = end_date - timedelta(days=30)
    
    perf_data = []
    
    for emp in employes:
        # Stock movements
        mouvements = MouvementStock.objects.filter(utilisateur=emp.user, created_at__gte=start_date)
        total_mouvements = mouvements.count()
        total_articles_manipules = mouvements.aggregate(t=Sum('quantite'))['t'] or 0
        
        # Orders processed
        commandes = Commande.objects.filter(createur=emp.user, created_at__gte=start_date)
        total_commandes = commandes.count()
        
        perf_data.append({
            'id': emp.id,
            'nom_complet': f"{emp.prenom} {emp.nom}",
            'poste': emp.poste.nom if emp.poste else "N/A",
            'total_mouvements': total_mouvements,
            'articles_manipules': total_articles_manipules,
            'total_commandes': total_commandes,
            'score': total_mouvements + (total_commandes * 5) # Basic score calc
        })
        
    perf_data.sort(key=lambda x: x['score'], reverse=True)
    
    # Recent timeline (last 50 actions across all users)
    recent_mouvements = MouvementStock.objects.select_related('utilisateur', 'produit').order_by('-created_at')[:20]
    recent_commandes = Commande.objects.select_related('createur').order_by('-created_at')[:20]
    
    # Merge and sort for timeline
    timeline = []
    for m in recent_mouvements:
        if m.utilisateur:
            timeline.append({
                'date': m.created_at,
                'user': m.utilisateur.get_full_name() or m.utilisateur.username,
                'action': f"Mouvement de stock ({m.type_mouvement})",
                'details': f"{m.quantite}x {m.produit.nom}",
                'icon': 'bi-box-seam',
                'color': 'primary'
            })
            
    for c in recent_commandes:
        if c.createur:
            timeline.append({
                'date': c.created_at,
                'user': c.createur.get_full_name() or c.createur.username,
                'action': f"Création de commande",
                'details': f"Commande {c.numero} ({c.get_type_commande_display()})",
                'icon': 'bi-cart3',
                'color': 'success'
            })
            
    timeline.sort(key=lambda x: x['date'], reverse=True)
    
    context = {
        'perf_data': perf_data,
        'timeline': timeline[:30] # Limit to 30 recent events
    }
    return render(request, 'employes/performance.html', context)
