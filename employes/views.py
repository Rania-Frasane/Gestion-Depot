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
