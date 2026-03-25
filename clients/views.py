from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q
from django.core.paginator import Paginator
from .models import Client
from .forms import ClientForm

@login_required
def liste(request):
    qs = Client.objects.filter(actif=True)
    q = request.GET.get('q', '')
    if q:
        qs = qs.filter(Q(nom__icontains=q) | Q(email__icontains=q) | Q(code__icontains=q))
    paginator = Paginator(qs, 20)
    page = paginator.get_page(request.GET.get('page'))
    return render(request, 'clients/liste.html', {'clients': page, 'q': q})

@login_required
def detail(request, pk):
    client = get_object_or_404(Client, pk=pk)
    commandes = client.commandes.order_by('-created_at')[:10]
    return render(request, 'clients/detail.html', {'client': client, 'commandes': commandes})

@login_required
def ajouter(request):
    form = ClientForm(request.POST or None)
    if form.is_valid():
        form.save()
        messages.success(request, 'Client ajouté!')
        return redirect('clients:liste')
    return render(request, 'clients/form.html', {'form': form, 'titre': 'Ajouter client'})

@login_required
def modifier(request, pk):
    client = get_object_or_404(Client, pk=pk)
    form = ClientForm(request.POST or None, instance=client)
    if form.is_valid():
        form.save()
        messages.success(request, 'Client modifié!')
        return redirect('clients:detail', pk=pk)
    return render(request, 'clients/form.html', {'form': form, 'titre': 'Modifier', 'obj': client})

@login_required
def supprimer(request, pk):
    client = get_object_or_404(Client, pk=pk)
    if request.method == 'POST':
        client.actif = False
        client.save()
        messages.success(request, 'Client archivé.')
        return redirect('clients:liste')
    return render(request, 'clients/confirmer.html', {'obj': client})
