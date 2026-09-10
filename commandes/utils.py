from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_RIGHT, TA_CENTER

def draw_background(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(colors.HexColor("#f8fafc"))
    canvas.rect(0, 28 * cm, 21 * cm, 2 * cm, stroke=0, fill=1)
    
    stamp_x = 16 * cm
    stamp_y = 3 * cm
    canvas.setStrokeColor(colors.HexColor("#0f172a"))
    canvas.setLineWidth(1.5)
    canvas.circle(stamp_x, stamp_y, 1.6 * cm, stroke=1, fill=0)
    canvas.setFont("Helvetica-Bold", 7)
    canvas.setFillColor(colors.HexColor("#0f172a"))
    canvas.drawCentredString(stamp_x, stamp_y + 0.6 * cm, "DÉPÔT MANAGER")
    canvas.setFont("Helvetica-Bold", 10)
    canvas.drawCentredString(stamp_x, stamp_y, "COMMANDE")
    canvas.setFont("Helvetica", 6)
    canvas.drawCentredString(stamp_x, stamp_y - 0.6 * cm, "VALIDATED")
    canvas.restoreState()

def generate_commande_pdf(commande):
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=A4, 
        rightMargin=1.5*cm, 
        leftMargin=1.5*cm, 
        topMargin=1*cm, 
        bottomMargin=1*cm
    )
    
    styles = getSampleStyleSheet()
    SLATE_900 = colors.HexColor("#0f172a")
    SLATE_600 = colors.HexColor("#475569")
    SLATE_400 = colors.HexColor("#94a3b8")
    SLATE_100 = colors.HexColor("#f1f5f9")
    ACCENT = colors.HexColor("#0f172a") # Darker for orders
    
    title_style = ParagraphStyle('Title', parent=styles['Normal'], fontSize=28, fontName='Helvetica-Bold', textColor=SLATE_900)
    meta_style = ParagraphStyle('Meta', parent=styles['Normal'], fontSize=8, fontName='Helvetica-Bold', textColor=SLATE_400, letterSpacing=1, textTransform='uppercase')
    body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=10, textColor=SLATE_600, leading=14)
    body_bold = ParagraphStyle('BodyBold', parent=body_style, fontName='Helvetica-Bold', textColor=SLATE_900)
    price_style = ParagraphStyle('Price', parent=styles['Normal'], fontSize=10, textColor=SLATE_900, fontName='Helvetica-Bold', alignment=TA_RIGHT)
    
    elements = []

    # 1. Header
    header_data = [[
        [
            Paragraph("BON DE COMMANDE", title_style),
            Paragraph(f"RÉFÉRENCE: {commande.numero}", meta_style),
            Paragraph(f"TYPE: {commande.type_commande.upper()}", meta_style)
        ],
        [
            Paragraph("DÉPÔT MANAGER", ParagraphStyle('Co', fontSize=18, fontName='Helvetica-Bold', alignment=TA_RIGHT, textColor=SLATE_900)),
            Paragraph("Système de Gestion de Stock Integré<br/>Maroc<br/>contact@depot-manager.ma", ParagraphStyle('CoAddr', fontSize=8, alignment=TA_RIGHT, textColor=SLATE_400, leading=10))
        ]
    ]]
    header_table = Table(header_data, colWidths=[10*cm, 8*cm])
    header_table.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP')]))
    elements.append(header_table)
    elements.append(Spacer(1, 1*cm))

    # 2. Meta info
    meta_data = [
        [Paragraph("DATE COMMANDE", meta_style), Paragraph("LIVRAISON PRÉVUE", meta_style), Paragraph("STATUT", meta_style)],
        [
            Paragraph(f"<b>{commande.date_commande.strftime('%d/%m/%Y')}</b>", body_style),
            Paragraph(f"<b>{commande.date_livraison_prevue.strftime('%d/%m/%Y') if commande.date_livraison_prevue else 'N/A'}</b>", body_style),
            Paragraph(f"<b>{commande.statut.upper()}</b>", body_bold)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[6*cm, 6*cm, 6*cm])
    meta_table.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), SLATE_100), ('PADDING', (0,0), (-1,-1), 12)]))
    elements.append(meta_table)
    elements.append(Spacer(1, 1*cm))

    # 3. Partners
    partners_data = [[
        [
            Paragraph("ÉMETTEUR", meta_style),
            Spacer(1, 5),
            Paragraph("DÉPÔT MANAGER", body_bold),
            Paragraph(f"Par: {commande.createur.username if commande.createur else 'Système'}", body_style)
        ],
        [
            Paragraph("DESTINATAIRE / PARTENAIRE", meta_style),
            Spacer(1, 5),
            Paragraph(f"<b>{commande.fournisseur.nom if commande.type_commande == 'achat' else commande.client.nom}</b>", body_bold),
            Paragraph(f"Contact: {commande.fournisseur.telephone if commande.type_commande == 'achat' else commande.client.telephone}", body_style),
        ]
    ]]
    partners_table = Table(partners_data, colWidths=[9*cm, 9*cm])
    elements.append(partners_table)
    elements.append(Spacer(1, 1*cm))

    # 4. Items
    data = [[
        Paragraph("DESCRIPTION", meta_style),
        Paragraph("QTÉ", meta_style),
        Paragraph("P.U HT", meta_style),
        Paragraph("TOTAL HT", meta_style)
    ]]
    
    for l in commande.lignes.all():
        data.append([
            Paragraph(f"<b>{l.produit.nom}</b>", body_style),
            Paragraph(str(l.quantite), ParagraphStyle('q', parent=body_style, alignment=TA_CENTER)),
            Paragraph(f"{float(l.prix_unitaire):,.2f}", price_style),
            Paragraph(f"{(float(l.quantite) * float(l.prix_unitaire)):,.2f}", price_style)
        ])
    
    table = Table(data, colWidths=[9.5*cm, 1.5*cm, 3.5*cm, 3.5*cm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SLATE_100),
        ('LINEBELOW', (0,0), (-1,0), 2, SLATE_900),
        ('LINEBELOW', (0,1), (-1,-2), 0.5, SLATE_100),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 1*cm))

    # 5. Totals
    t_ht = float(commande.total_ht)
    t_ttc = float(commande.total_ttc)
    
    totals_data = [
        ["", "TOTAL HT", f"{t_ht:,.2f} MAD"],
        ["", Paragraph("MONTANT TOTAL TTC", ParagraphStyle('TotL', fontName='Helvetica-Bold', textColor=colors.white)), Paragraph(f"{t_ttc:,.2f} MAD", ParagraphStyle('TotV', fontName='Helvetica-Bold', alignment=TA_RIGHT, textColor=colors.white))]
    ]
    totals_table = Table(totals_data, colWidths=[11*cm, 3.5*cm, 3.5*cm])
    totals_table.setStyle(TableStyle([
        ('ALIGN', (2,0), (2,-1), 'RIGHT'),
        ('BACKGROUND', (1,1), (2,1), SLATE_900),
        ('PADDING', (1,1), (2,1), 12),
    ]))
    elements.append(totals_table)

    doc.build(elements, onFirstPage=draw_background, onLaterPages=draw_background)
    pdf = buffer.getvalue()
    buffer.close()
    return pdf
