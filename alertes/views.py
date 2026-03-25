from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils import timezone
from .models import Alerte

@login_required
def liste(request):
    alertes = Alerte.objects.select_related('produit')
    lue = request.GET.get('lue', '')
    if lue == '0':
        alertes = alertes.filter(lue=False)
    elif lue == '1':
        alertes = alertes.filter(lue=True)
    return render(request, 'alertes/liste.html', {'alertes': alertes, 'lue': lue})

@login_required
def marquer_lue(request, pk):
    alerte = get_object_or_404(Alerte, pk=pk)
    alerte.lue = True
    alerte.lue_par = request.user
    alerte.lue_at = timezone.now()
    alerte.save()
    messages.success(request, 'Alerte marquée comme lue.')
    return redirect('alertes:liste')

@login_required
def tout_lire(request):
    if request.method == 'POST':
        Alerte.objects.filter(lue=False).update(
            lue=True, lue_par=request.user, lue_at=timezone.now()
        )
        messages.success(request, 'Toutes les alertes ont été marquées comme lues.')
    return redirect('alertes:liste')
