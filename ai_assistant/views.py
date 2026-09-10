import json
import os
import requests
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from rest_framework import views, permissions, status
from rest_framework.response import Response

from .models import ChatSession, ChatMessage
from .context_builder import build_warehouse_context

@login_required
def chatbot_page(request):
    """Dedicated full-page chatbot view."""
    sessions = ChatSession.objects.filter(utilisateur=request.user)[:10]
    active_session = None
    session_id = request.GET.get('session')
    if session_id:
        active_session = get_object_or_404(ChatSession, pk=session_id, utilisateur=request.user)

    context = {
        'sessions': sessions,
        'active_session': active_session,
        'messages': active_session.messages.all() if active_session else [],
    }
    return render(request, 'ai_assistant/chatbot.html', context)

@login_required
@require_POST
def new_session(request):
    """Create a new chat session and return its ID."""
    session = ChatSession.objects.create(utilisateur=request.user)
    return JsonResponse({'session_id': session.pk, 'titre': session.titre})

class AskChatbotAPIView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """Main AI endpoint with Token Auth support."""
        user_message = (request.data.get('message') or '').strip()
        if not user_message:
            return Response({'error': 'Message vide.'}, status=status.HTTP_400_BAD_REQUEST)

        session_id = request.data.get('session_id')
        session = None
        if session_id:
            try:
                session = ChatSession.objects.filter(pk=session_id, utilisateur=request.user).first()
            except (ValueError, TypeError):
                pass
        if not session:
            session = ChatSession.objects.create(utilisateur=request.user)

        if not session.messages.exists():
            session.titre = user_message[:60]
            session.save(update_fields=['titre'])

        ChatMessage.objects.create(session=session, role=ChatMessage.USER_ROLE, content=user_message)
        
        history = list(session.messages.order_by('-created_at')[:15])
        history.reverse()
        
        warehouse_ctx = build_warehouse_context()
        reply = _call_ai_hybrid(user_message, history[:-1], warehouse_ctx)
        
        ChatMessage.objects.create(session=session, role=ChatMessage.ASSISTANT_ROLE, content=reply)
        return Response({'reply': reply, 'session_id': session.pk})

def _call_ai_hybrid(user_message: str, history: list, warehouse_ctx: str) -> str:
    """
    Triple-Engine AI System:
    1. Gemini (Advanced Analysis)
    2. Groq/Llama 3 (Ultra-fast Response)
    3. Built-in Analytical Engine (Offline Fallback - No Key Needed)
    """
    from django.conf import settings
    gemini_key = getattr(settings, 'GEMINI_API_KEY', '')
    groq_key = getattr(settings, 'GROQ_API_KEY', '')

    # --- ENGINE 1: GEMINI ---
    if gemini_key and 'AIza' in gemini_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro']
            for m_name in models:
                try:
                    supports_sys = '1.5' in m_name
                    sys_text = f"Vous êtes l'Assistant Expert Dépôt Manager. Utilisez du Markdown (**gras**, puces) et suggérez toujours une question de suivi. Données:\n{warehouse_ctx}"
                    model = genai.GenerativeModel(model_name=m_name, system_instruction=sys_text if supports_sys else None)
                    chat_h = []
                    if not supports_sys:
                        chat_h.append({'role': 'user', 'parts': [f"SYSTEM CONTEXT: {sys_text}"]})
                        chat_h.append({'role': 'model', 'parts': ["Understood."]})
                    
                    # Strictly alternate user/model roles to prevent API errors
                    expected_role = 'user'
                    for m in history:
                        msg_role = 'user' if m.role == ChatMessage.USER_ROLE else 'model'
                        if msg_role == expected_role:
                            chat_h.append({'role': msg_role, 'parts': [m.content]})
                            expected_role = 'model' if expected_role == 'user' else 'user'
                    
                    if chat_h and chat_h[-1]['role'] == 'user':
                        chat_h.pop()
                            
                    chat = model.start_chat(history=chat_h)
                    return chat.send_message(user_message).text
                except: continue
        except: pass

    # --- ENGINE 2: GROQ (LLAMA 3) ---
    if groq_key:
        try:
            resp = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {groq_key}"},
                json={
                    "model": "llama3-8b-8192",
                    "messages": [
                        {"role": "system", "content": f"Vous êtes l'Assistant Expert Dépôt Manager. Soyez proactif, utilisez Markdown et suggérez des questions de suivi. Données:\n{warehouse_ctx}"},
                        *[{"role": "user" if m.role == ChatMessage.USER_ROLE else "assistant", "content": m.content} for m in history],
                        {"role": "user", "content": user_message}
                    ]
                }, timeout=8
            )
            if resp.status_code == 200:
                return resp.json()['choices'][0]['message']['content']
        except: pass

    # --- ENGINE 3: SMART OFFLINE ANALYTICAL ENGINE (GUARANTEED FALLBACK) ---
    msg = user_message.lower()
    if any(x in msg for x in ['stock', 'rupture', 'combien', 'quantité', 'état']):
        return f"📊 **Analyse de Stock (Mode Analytique Local)** :\n\nVoici l'état actuel de votre entrepôt :\n{warehouse_ctx}\n\n💡 *Conseil : Vérifiez les produits avec un stock < 5.*\n\n❓ **Question suggérée** : 'Quels produits sont en alerte ?'"
    
    if any(x in msg for x in ['commande', 'achat', 'fournisseur', 'livraison']):
        return "📦 **Info Logistique** : Vos commandes et fournisseurs sont sous surveillance.\n\n❓ **Question suggérée** : 'Qui est mon fournisseur principal ?'"

    return "👋 Bonjour ! Je suis votre assistant local Dépôt Manager. Je peux analyser vos stocks et vos alertes en temps réel.\n\n❓ **Essayez de me demander** : 'Quel est l'état du stock ?'"

@login_required
def load_session(request, session_id):
    session = get_object_or_404(ChatSession, pk=session_id, utilisateur=request.user)
    messages = [{'role': m.role, 'content': m.content, 'ts': m.created_at.strftime('%H:%M')} for m in session.messages.all()]
    return JsonResponse({'messages': messages, 'titre': session.titre})

@login_required
@require_POST
def delete_session(request, session_id):
    session = get_object_or_404(ChatSession, pk=session_id, utilisateur=request.user)
    session.delete()
    return JsonResponse({'ok': True})

# --- FORECASTING ---
@login_required
def forecast_dashboard(request):
    from .forecasting import forecast_all_products
    forecasts = forecast_all_products(top_n=20)
    total_reorder = sum(1 for f in forecasts if f.get('reorder_needed'))
    context = {
        'forecasts': forecasts,
        'total_analysed': len(forecasts),
        'total_reorder': total_reorder,
    }
    return render(request, 'ai_assistant/forecast_dashboard.html', context)

@login_required
def forecast_detail(request, produit_id):
    from .forecasting import forecast_product
    data = forecast_product(produit_id, horizon_days=30)
    return JsonResponse(data or {'error': 'Not found'}, status=200 if data else 404)

# --- REORDERS ---
@login_required
def smart_reorder_dashboard(request):
    from .reorder_engine import generate_reorder_suggestions
    suggestions = generate_reorder_suggestions()
    return render(request, 'ai_assistant/smart_reorders.html', {'suggestions': suggestions})

@login_required
@require_POST
def create_draft_order(request):
    try:
        data = json.loads(request.body)
        fournisseur_id = data.get('fournisseur_id')
        lignes = data.get('lignes', [])
        from commandes.models import Commande, LigneCommande
        from fournisseurs.models import Fournisseur
        from produits.models import Produit
        
        fournisseur = get_object_or_404(Fournisseur, pk=fournisseur_id) if fournisseur_id and fournisseur_id > 0 else None
        commande = Commande.objects.create(type_commande=Commande.ACHAT, statut=Commande.BROUILLON, fournisseur=fournisseur, createur=request.user)
        for ligne in lignes:
            p = get_object_or_404(Produit, pk=ligne['produit_id'])
            LigneCommande.objects.create(commande=commande, produit=p, quantite=ligne['quantite_suggeree'], prix_unitaire=p.prix_achat, tva=p.tva)
        return JsonResponse({'success': True, 'numero': commande.numero, 'message': 'Brouillon créé.'})
    except Exception as e: return JsonResponse({'error': str(e)}, status=500)

# --- ANALYTICS ---
@login_required
def analytics_dashboard(request):
    return render(request, 'ai_assistant/analytics_dashboard.html', {})

@login_required
def export_analytics_csv(request):
    import csv
    from django.http import HttpResponse
    from .analytics import get_top_selling_products
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="top_products.csv"'
    writer = csv.writer(response)
    writer.writerow(['Nom', 'Quantité', 'Revenue'])
    for p in get_top_selling_products(limit=50): writer.writerow([p['nom'], p['quantite'], p['revenue']])
    return response

# --- ALERTS ---
@login_required
def alert_rules_config(request):
    from .models import AlertRule
    rule = AlertRule.objects.first() or AlertRule.objects.create(name="Default")
    return render(request, 'ai_assistant/alert_rules.html', {'rule': rule})

# --- API ---
class AlertRuleAPIView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        from .models import AlertRule
        r = AlertRule.objects.first() or AlertRule.objects.create(name="Default")
        return Response({"std_dev_threshold": r.std_dev_threshold, "min_quantity_threshold": r.min_quantity_threshold, "is_active": r.is_active})
    def post(self, request):
        from .models import AlertRule
        r = AlertRule.objects.first()
        r.std_dev_threshold = float(request.data.get('std_dev_threshold', r.std_dev_threshold))
        r.min_quantity_threshold = int(request.data.get('min_quantity_threshold', r.min_quantity_threshold))
        r.is_active = request.data.get('is_active', r.is_active)
        r.save()
        return Response({"success": True})

class AnalyticsAPIView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        from .analytics import get_revenue_trends, get_top_selling_products
        return Response({"trends": get_revenue_trends(days=30), "top_products": get_top_selling_products(limit=5)})

class SmartReorderAPIView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        from .reorder_engine import generate_reorder_suggestions
        return Response(generate_reorder_suggestions())
