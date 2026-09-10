from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from rest_framework import viewsets, permissions, views, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import UserProfile
from django.db.models import Sum, F
from produits.models import Produit, Categorie, MouvementStock, Projet
from logistique.models import Entrepot, Emplacement, StockParEmplacement, TransfertStock
from alertes.models import Alerte
from employes.models import Employe, Poste
from fournisseurs.models import Fournisseur
from clients.models import Client
from commandes.models import Commande
from facturation.models import Facture

from produits.serializers import ProduitSerializer, CategorieSerializer, MouvementStockSerializer, ProjetSerializer
from logistique.serializers import EntrepotSerializer, EmplacementSerializer, StockParEmplacementSerializer, TransfertStockSerializer
from employes.serializers import EmployeSerializer, PosteSerializer
from fournisseurs.serializers import FournisseurSerializer
from clients.serializers import ClientSerializer
from commandes.serializers import CommandeSerializer
from facturation.serializers import FactureSerializer
from rest_framework import serializers
from alertes.models import Alerte

class ProduitViewSet(viewsets.ModelViewSet):
    queryset = Produit.objects.all()
    serializer_class = ProduitSerializer
    permission_classes = [permissions.IsAuthenticated]

class CategorieViewSet(viewsets.ModelViewSet):
    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer
    permission_classes = [permissions.IsAuthenticated]

class ProjetViewSet(viewsets.ModelViewSet):
    queryset = Projet.objects.all()
    serializer_class = ProjetSerializer
    permission_classes = [permissions.IsAuthenticated]

class EntrepotViewSet(viewsets.ModelViewSet):
    queryset = Entrepot.objects.all()
    serializer_class = EntrepotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def _clean_data(self, data):
        """Remove read-only computed fields and coerce types."""
        cleaned = {k: v for k, v in data.items() if k not in ('responsable_nom', 'created_at')}
        # Coerce responsable to int or None
        r = cleaned.get('responsable')
        if r == '' or r is None:
            cleaned['responsable'] = None
        else:
            try:
                cleaned['responsable'] = int(r)
            except (ValueError, TypeError):
                cleaned['responsable'] = None
                
        if not cleaned.get('responsable'):
            raise serializers.ValidationError({"responsable": ["Le responsable de l'entrepôt est obligatoire."]})
            
        return cleaned

    def create(self, request, *args, **kwargs):
        data = self._clean_data(request.data.copy() if hasattr(request.data, 'copy') else dict(request.data))
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = self._clean_data(request.data.copy() if hasattr(request.data, 'copy') else dict(request.data))
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class TransfertViewSet(viewsets.ModelViewSet):
    queryset = TransfertStock.objects.all()
    serializer_class = TransfertStockSerializer
    permission_classes = [permissions.IsAuthenticated]

class EmplacementViewSet(viewsets.ModelViewSet):
    queryset = Emplacement.objects.select_related('entrepot').all()
    serializer_class = EmplacementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        entrepot_id = self.request.query_params.get('entrepot')
        if entrepot_id:
            qs = qs.filter(entrepot_id=entrepot_id)
        return qs

    def _clean(self, data):
        return {k: v for k, v in data.items() if k not in ('entrepot_nom',)}

    def create(self, request, *args, **kwargs):
        data = self._clean(request.data.copy() if hasattr(request.data, 'copy') else dict(request.data))
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = self._clean(request.data.copy() if hasattr(request.data, 'copy') else dict(request.data))
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class StockParEmplacementViewSet(viewsets.ModelViewSet):
    queryset = StockParEmplacement.objects.select_related('produit', 'emplacement__entrepot').all()
    serializer_class = StockParEmplacementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        entrepot_id = self.request.query_params.get('entrepot')
        emplacement_id = self.request.query_params.get('emplacement')
        if entrepot_id:
            qs = qs.filter(emplacement__entrepot_id=entrepot_id)
        if emplacement_id:
            qs = qs.filter(emplacement_id=emplacement_id)
        return qs

    def _clean(self, data):
        return {k: v for k, v in data.items() if k not in ('produit_nom', 'emplacement_code', 'entrepot_nom', 'updated_at')}

    def create(self, request, *args, **kwargs):
        data = self._clean(request.data.copy() if hasattr(request.data, 'copy') else dict(request.data))
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        
        # Get product and record stock before save
        produit = get_object_or_404(Produit, id=int(data['produit']))
        stock_avant = produit.stock_actuel
        quantite = int(data['quantite'])
        
        instance = serializer.save()
        
        # Reload product to get new current stock from signal
        produit.refresh_from_db()
        stock_apres = produit.stock_actuel
        
        MouvementStock.objects.create(
            produit=produit,
            type_mouvement=MouvementStock.ENTREE,
            quantite=quantite,
            stock_avant=stock_avant,
            stock_apres=stock_apres,
            motif=f"Attribution de stock à l'emplacement {instance.emplacement.code}",
            utilisateur=request.user
        )
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = self._clean(request.data.copy() if hasattr(request.data, 'copy') else dict(request.data))
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        old_qty = instance.quantite
        new_qty = int(data.get('quantite', old_qty))
        diff = new_qty - old_qty
        
        produit = instance.produit
        stock_avant = produit.stock_actuel
        
        instance = serializer.save()
        
        if diff != 0:
            produit.refresh_from_db()
            stock_apres = produit.stock_actuel
            type_mouvement = MouvementStock.ENTREE if diff > 0 else MouvementStock.SORTIE
            MouvementStock.objects.create(
                produit=produit,
                type_mouvement=type_mouvement,
                quantite=abs(diff),
                stock_avant=stock_avant,
                stock_apres=stock_apres,
                motif=f"Ajustement de stock à l'emplacement {instance.emplacement.code}",
                utilisateur=request.user
            )
            
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        produit = instance.produit
        stock_avant = produit.stock_actuel
        old_qty = instance.quantite
        
        # Perform deletion
        instance.delete()
        
        # Log stock movement
        produit.refresh_from_db()
        stock_apres = produit.stock_actuel
        
        MouvementStock.objects.create(
            produit=produit,
            type_mouvement=MouvementStock.SORTIE,
            quantite=old_qty,
            stock_avant=stock_avant,
            stock_apres=stock_apres,
            motif=f"Retrait complet de stock de l'emplacement {instance.emplacement.code}",
            utilisateur=request.user
        )
        
        return Response(status=status.HTTP_204_NO_CONTENT)

class FournisseurViewSet(viewsets.ModelViewSet):
    queryset = Fournisseur.objects.all()
    serializer_class = FournisseurSerializer
    permission_classes = [permissions.IsAuthenticated]

class DocumentFournisseurViewSet(viewsets.ModelViewSet):
    from fournisseurs.models import DocumentFournisseur
    from fournisseurs.serializers import DocumentFournisseurSerializer
    queryset = DocumentFournisseur.objects.all()
    serializer_class = DocumentFournisseurSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = self.queryset
        fournisseur = self.request.query_params.get('fournisseur', None)
        if fournisseur is not None:
            queryset = queryset.filter(fournisseur_id=fournisseur)
        return queryset

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def export_pdf(self, request):
        from reportlab.lib.pagesizes import A4
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.lib import colors
        from io import BytesIO
        from django.http import HttpResponse

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        styles = getSampleStyleSheet()
        
        elements.append(Paragraph("Liste des Clients", styles['Title']))
        elements.append(Spacer(1, 20))
        
        data = [["Nom complet", "Email", "Téléphone", "Ville", "Type", "Plafond (MAD)"]]
        for c in self.get_queryset():
            data.append([
                f"{c.prenom} {c.nom}",
                c.email or "N/A",
                c.telephone or "N/A",
                c.ville,
                c.type_client,
                str(c.plafond_credit)
            ])
            
        t = Table(data)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f172a")),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,0), 12),
            ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#f8fafc")),
            ('GRID', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0"))
        ]))
        
        elements.append(t)
        doc.build(elements)
        
        pdf = buffer.getvalue()
        buffer.close()
        
        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="Clients_Export.pdf"'
        return response


class CommandeViewSet(viewsets.ModelViewSet):
    queryset = Commande.objects.all()
    serializer_class = CommandeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = self.queryset
        fournisseur = self.request.query_params.get('fournisseur', None)
        if fournisseur is not None:
            queryset = queryset.filter(fournisseur_id=fournisseur)
        return queryset

    def create(self, request, *args, **kwargs):
        from rest_framework.response import Response
        from rest_framework import status
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        lignes_data = data.pop('lignes', [])
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        commande = serializer.save(createur=request.user)
        
        from commandes.models import LigneCommande
        for ligne in lignes_data:
            produit_id = ligne.get('produit')
            if isinstance(produit_id, dict): produit_id = produit_id.get('id')
            LigneCommande.objects.create(
                commande=commande,
                produit_id=produit_id,
                quantite=ligne.get('quantite', 1),
                prix_unitaire=ligne.get('prix_unitaire', 0),
                tva=ligne.get('tva', 20)
            )
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['get'])
    def download_pdf(self, request, pk=None):
        commande = self.get_object()
        from commandes.utils import generate_commande_pdf
        pdf_content = generate_commande_pdf(commande)
        response = HttpResponse(pdf_content, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Commande_{commande.numero}.pdf"'
        return response

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        
        # On extrait les lignes pour éviter les erreurs de validation si elles sont absentes ou mal formées
        lignes_data = data.pop('lignes', None)
        
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        commande = serializer.save()
        
        # On gère les lignes manuellement si elles sont présentes dans la requête
        if lignes_data is not None:
            from commandes.models import LigneCommande
            commande.lignes.all().delete()
            for l_data in lignes_data:
                # Nettoyage de l'ID produit si c'est un objet
                p_id = l_data.get('produit')
                if isinstance(p_id, dict): p_id = p_id.get('id')
                
                LigneCommande.objects.create(
                    commande=commande,
                    produit_id=p_id,
                    quantite=l_data.get('quantite', 1),
                    prix_unitaire=l_data.get('prix_unitaire', 0),
                    tva=l_data.get('tva', 20)
                )
        
        return Response(serializer.data)

class EmployeViewSet(viewsets.ModelViewSet):
    queryset = Employe.objects.all()
    serializer_class = EmployeSerializer
    permission_classes = [permissions.IsAuthenticated]
    @action(detail=False, methods=['get'])
    def performance(self, request):
        from django.db.models import Count
        from produits.models import MouvementStock
        
        # On récupère tous les employés actifs
        employes = Employe.objects.filter(actif=True).select_related('user', 'poste')
        
        results = []
        for emp in employes:
            # On compte les mouvements de stock effectués par l'utilisateur lié
            scan_count = 0
            if emp.user:
                scan_count = MouvementStock.objects.filter(utilisateur=emp.user).count()
            
            # On simule un score basé sur les scans et une part d'aléatoire pour le démo
            # Plus de scans = meilleur score (plafonné à 98)
            score = min(75 + (scan_count // 5), 98) if scan_count > 0 else 70
            
            results.append({
                "id": emp.id,
                "nom": emp.nom,
                "prenom": emp.prenom,
                "poste_nom": emp.poste.nom if emp.poste else "Collaborateur",
                "scans": scan_count,
                "score": score,
                "matricule": emp.matricule,
                "photo": request.build_absolute_uri(emp.photo.url) if emp.photo else None
            })
            
        # On trie par score décroissant
        results.sort(key=lambda x: x['score'], reverse=True)
        return Response(results)
    def _clean(self, data):
        # On retire les champs calculés ou read-only qui pourraient faire échouer la validation
        return {k: v for k, v in data.items() if k not in ('poste_nom', 'username', 'created_at')}

    def create(self, request, *args, **kwargs):
        data = self._clean(request.data.copy() if hasattr(request.data, 'copy') else dict(request.data))
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = self._clean(request.data.copy() if hasattr(request.data, 'copy') else dict(request.data))
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class PosteViewSet(viewsets.ModelViewSet):
    queryset = Poste.objects.all()
    serializer_class = PosteSerializer
    permission_classes = [permissions.IsAuthenticated]

class FactureViewSet(viewsets.ModelViewSet):
    queryset = Facture.objects.all()
    serializer_class = FactureSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        from rest_framework.response import Response
        from rest_framework import status
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        lignes_data = data.pop('lignes', [])
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        facture = serializer.save(createur=request.user)
        
        from facturation.models import LigneFacture
        for ligne in lignes_data:
            produit_id = ligne.get('produit')
            LigneFacture.objects.create(
                facture=facture,
                produit_id=produit_id if isinstance(produit_id, (int, str)) else produit_id.get('id'),
                quantite=ligne.get('quantite', 1),
                prix_unitaire=ligne.get('prix_unitaire', 0),
                tva=ligne.get('tva', 20)
            )
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        from rest_framework.response import Response
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        lignes_data = data.pop('lignes', None)
        
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        facture = serializer.save()
        
        if lignes_data is not None:
            from facturation.models import LigneFacture
            instance.lignes.all().delete()
            for ligne in lignes_data:
                produit_id = ligne.get('produit')
                if isinstance(produit_id, dict):
                    produit_id = produit_id.get('id')
                LigneFacture.objects.create(
                    facture=facture,
                    produit_id=produit_id,
                    quantite=ligne.get('quantite', 1),
                    prix_unitaire=ligne.get('prix_unitaire', 0),
                    tva=ligne.get('tva', 20)
                )
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def download_pdf(self, request, pk=None):
        facture = self.get_object()
        from facturation.utils import generate_facture_pdf
        pdf_content = generate_facture_pdf(facture)
        response = HttpResponse(pdf_content, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Facture_{facture.numero}.pdf"'
        return response

class AlerteViewSet(viewsets.ModelViewSet):
    class AlerteSerializer(serializers.ModelSerializer):
        produit_nom = serializers.ReadOnlyField(source='produit.nom')
        class Meta:
            model = Alerte
            fields = '__all__'
            
    queryset = Alerte.objects.all()
    serializer_class = AlerteSerializer
    permission_classes = [permissions.IsAuthenticated]

class DashboardStatsAPIView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from django.db.models.functions import TruncDate
        from django.db.models import Count, Q
        import datetime

        today = datetime.date.today()
        last_30_days = today - datetime.timedelta(days=30)

        # Evolution des commandes (30 derniers jours)
        daily_orders = (
            Commande.objects.filter(date_commande__gte=last_30_days)
            .annotate(date=TruncDate('date_commande'))
            .values('date')
            .annotate(count=Count('id'))
            .order_by('date')
        )

        # Stock par catégorie
        stock_by_cat = (
            Produit.objects.values('categorie__nom')
            .annotate(total=Sum('stock_actuel'))
            .order_by('-total')[:5]
        )

        # Performance par entrepôt (simulée ou réelle si possible)
        # On va compter les mouvements par entrepôt
        warehouse_perf = (
            StockParEmplacement.objects.values('emplacement__entrepot__nom')
            .annotate(total=Sum('quantite'))
            .order_by('-total')
        )

        # Chiffre d'affaires mensuel (6 derniers mois)
        from django.db.models.functions import TruncMonth
        from django.db.models import ExpressionWrapper, DecimalField
        monthly_sales = (
            Commande.objects.filter(date_commande__gte=today - datetime.timedelta(days=180))
            .annotate(month=TruncMonth('date_commande'))
            .values('month')
            .annotate(total=Sum(
                ExpressionWrapper(
                    F('lignes__quantite') * F('lignes__prix_unitaire') * (1 + F('lignes__tva') / 100.0),
                    output_field=DecimalField()
                )
            ))
            .order_by('month')
        )

        # Top produits (Scatter plot: Prix vs Ventes)
        # On simule un peu car Commande n'a pas forcément de lien direct simple ici sans passer par LigneCommande
        from commandes.models import LigneCommande
        top_products = (
            LigneCommande.objects.values('produit__nom', 'produit__prix_vente')
            .annotate(total_vendu=Sum('quantite'))
            .order_by('-total_vendu')[:10]
        )

        # Répartition de la valeur par catégorie (Treemap)
        cat_value = (
            Produit.objects.values('categorie__nom')
            .annotate(valeur=Sum(F('stock_actuel') * F('prix_vente')))
            .order_by('-valeur')
        )

        stats = {
            "stock_value": Produit.objects.aggregate(total=Sum(F('stock_actuel') * F('prix_vente')))['total'] or 0,
            "orders_count": Commande.objects.count(),
            "alerts_count": Alerte.objects.filter(lue=False).count(),
            "movements_count": MouvementStock.objects.count(),
            "products_count": Produit.objects.count(),
            "clients_count": Client.objects.count(),
            "warehouses_count": Entrepot.objects.count(),
            "daily_orders": list(daily_orders),
            "stock_by_cat": list(stock_by_cat),
            "warehouse_perf": list(warehouse_perf),
            "monthly_sales": list(monthly_sales),
            "top_products_scatter": list(top_products),
            "cat_value_treemap": list(cat_value),
            "recent_mouvements": MouvementStockSerializer(MouvementStock.objects.order_by('-created_at')[:5], many=True).data
        }
        return Response(stats)

class AvailableResponsiblesAPIView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from employes.models import Employe
        # Return all active employees
        employees = Employe.objects.filter(actif=True)
        
        data = []
        for emp in employees:
            data.append({
                "id": emp.id,
                "username": emp.matricule or f"EMP-{emp.id}",
                "display_name": f"{emp.prenom} {emp.nom}"
            })
        return Response(data)

class ScannerAPIView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            data = request.data
            code = data.get('code')
            action = data.get('action') # 'entree' or 'sortie'
            quantite = int(data.get('quantite', 1))
            
            if not code or action not in ['entree', 'sortie']:
                return Response({'success': False, 'error': 'Données invalides.'}, status=400)
                
            from django.db.models import Q
            produit = Produit.objects.filter(Q(code_barre=code) | Q(code=code)).first()
            if not produit:
                return Response({'success': False, 'error': f'Produit avec le code {code} introuvable.'}, status=404)
                
            if action == 'sortie' and produit.stock_actuel < quantite:
                return Response({'success': False, 'error': f'Stock insuffisant pour {produit.nom}. Disponible: {produit.stock_actuel}'}, status=400)
                
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
                motif="Scan Rapide (API)"
            )
            produit.save()
            m.save()
            
            # Check for stock alerts
            if produit.is_stock_bas:
                try:
                    from alertes.utils import creer_alerte_stock
                    creer_alerte_stock(produit)
                except ImportError:
                    pass
            
            serializer = ProduitSerializer(produit, context={'request': request})
            
            return Response({
                'success': True,
                'produit': serializer.data,
                'action_label': "Ajouté" if action == 'entree' else "Retiré",
                'quantite': quantite,
                'nouveau_stock': produit.stock_actuel
            })
            
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=500)

class RegenerateQRAPIView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        produit = get_object_or_404(Produit, pk=pk)
        try:
            produit.generate_qr_code()
            serializer = ProduitSerializer(produit, context={'request': request})
            return Response({
                'success': True, 
                'message': f'Code QR régénéré pour {produit.nom}',
                'produit': serializer.data
            })
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=500)


class UserProfileAPIView(views.APIView):
    """GET or PATCH the authenticated user's profile."""
    permission_classes = [permissions.IsAuthenticated]

    def _serialize(self, profile, request):
        photo_url = None
        if profile.photo:
            photo_url = request.build_absolute_uri(profile.photo.url)
        return {
            'id': profile.id,
            'username': profile.user.username,
            'email': profile.user.email,
            'photo': photo_url,
            'bio': profile.bio,
            'organisation': profile.organisation,
            'notif_email': profile.notif_email,
            'notif_stock_alerts': profile.notif_stock_alerts,
            'notif_order_updates': profile.notif_order_updates,
            'notif_sound': profile.notif_sound,
            'notif_mobile': profile.notif_mobile,
            'display_compact': profile.display_compact,
            'display_animations': profile.display_animations,
            'language': profile.language,
            'currency': profile.currency,
        }

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        return Response(self._serialize(profile, request))

    def patch(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)

        # Handle photo upload
        if 'photo' in request.FILES:
            profile.photo = request.FILES['photo']

        # Update user fields
        if 'username' in request.data:
            new_username = request.data['username'].strip()
            if new_username and new_username != request.user.username:
                if User.objects.filter(username=new_username).exclude(pk=request.user.pk).exists():
                    return Response({'error': "Ce nom d'utilisateur est déjà pris."}, status=400)
                request.user.username = new_username
                request.user.save()

        if 'email' in request.data:
            request.user.email = request.data['email']
            request.user.save()

        # Update profile fields
        bool_fields = [
            'notif_email', 'notif_stock_alerts', 'notif_order_updates',
            'notif_sound', 'notif_mobile', 'display_compact', 'display_animations',
        ]
        str_fields = ['bio', 'organisation', 'language', 'currency']

        for field in bool_fields:
            if field in request.data:
                val = request.data[field]
                if isinstance(val, str):
                    val = val.lower() in ('true', '1', 'yes')
                setattr(profile, field, val)

        for field in str_fields:
            if field in request.data:
                setattr(profile, field, request.data[field])

        profile.save()
        return Response(self._serialize(profile, request))

