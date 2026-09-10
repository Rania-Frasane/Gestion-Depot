from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_RIGHT, TA_CENTER

def draw_background(canvas, doc):
    """Draws a subtle background and a status watermark"""
    canvas.saveState()
    
    # Subtle accent at the top
    canvas.setFillColor(colors.HexColor("#f1f5f9"))
    canvas.rect(0, 28 * cm, 21 * cm, 2 * cm, stroke=0, fill=1)
    
    # Status Watermark (Large rotated text if Paid)
    facture = getattr(doc, 'facture_obj', None)
    if facture and facture.statut == 'payee':
        canvas.rotate(45)
        canvas.setFont("Helvetica-Bold", 80)
        canvas.setFillColor(colors.HexColor("#f1f5f9")) # Very subtle
        canvas.drawCentredString(15 * cm, 5 * cm, "PAYÉE")
        canvas.rotate(-45)

    # Professional Stamp
    stamp_x = 16 * cm
    stamp_y = 3 * cm
    canvas.setStrokeColor(colors.HexColor("#2AA2DC"))
    canvas.setLineWidth(1.5)
    canvas.circle(stamp_x, stamp_y, 1.6 * cm, stroke=1, fill=0)
    canvas.setFont("Helvetica-Bold", 7)
    canvas.setFillColor(colors.HexColor("#2AA2DC"))
    canvas.drawCentredString(stamp_x, stamp_y + 0.6 * cm, "DÉPÔT MANAGER")
    canvas.setFont("Helvetica-Bold", 10)
    canvas.drawCentredString(stamp_x, stamp_y, "CERTIFIED")
    canvas.setFont("Helvetica", 6)
    canvas.drawCentredString(stamp_x, stamp_y - 0.6 * cm, "OFFICIAL DOCUMENT")
    
    canvas.restoreState()

def generate_facture_pdf(facture):
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=A4, 
        rightMargin=1.5*cm, 
        leftMargin=1.5*cm, 
        topMargin=1*cm, 
        bottomMargin=1*cm
    )
    doc.facture_obj = facture # Pass object for watermark
    
    styles = getSampleStyleSheet()
    
    # SaaS/ERP Minimalist Palette
    SLATE_900 = colors.HexColor("#0f172a")
    SLATE_600 = colors.HexColor("#475569")
    SLATE_400 = colors.HexColor("#94a3b8")
    SLATE_100 = colors.HexColor("#f1f5f9")
    ACCENT = colors.HexColor("#2AA2DC")
    
    # Custom Modern Styles
    title_style = ParagraphStyle('Title', parent=styles['Normal'], fontSize=32, fontName='Helvetica-Bold', textColor=SLATE_900, spaceAfter=2)
    meta_style = ParagraphStyle('Meta', parent=styles['Normal'], fontSize=8, fontName='Helvetica-Bold', textColor=SLATE_400, letterSpacing=1, textTransform='uppercase')
    body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=10, textColor=SLATE_600, leading=14)
    body_bold = ParagraphStyle('BodyBold', parent=body_style, fontName='Helvetica-Bold', textColor=SLATE_900)
    price_style = ParagraphStyle('Price', parent=styles['Normal'], fontSize=10, textColor=SLATE_900, fontName='Helvetica-Bold', alignment=TA_RIGHT)
    accent_style = ParagraphStyle('Accent', parent=styles['Normal'], fontSize=10, textColor=ACCENT, fontName='Helvetica-Bold')
    
    elements = []

    # 1. Elegant Header
    header_data = [[
        [
            Paragraph("FACTURE", title_style),
            Paragraph(f"RÉFÉRENCE: {facture.numero}", meta_style),
            Spacer(1, 10),
            Paragraph(f"STATUT: {facture.statut.upper()}", accent_style)
        ],
        [
            Paragraph("DÉPÔT MANAGER", ParagraphStyle('Co', fontSize=18, fontName='Helvetica-Bold', alignment=TA_RIGHT, textColor=ACCENT)),
            Paragraph("Solutions de Gestion de Stock & Logistique<br/>Zone Industrielle, Casablanca, Maroc<br/>contact@depot-manager.ma<br/>+212 5XX XX XX XX", ParagraphStyle('CoAddr', fontSize=8, alignment=TA_RIGHT, textColor=SLATE_400, leading=10))
        ]
    ]]
    header_table = Table(header_data, colWidths=[10*cm, 8*cm])
    header_table.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'TOP')]))
    elements.append(header_table)
    elements.append(Spacer(1, 1*cm))

    # 2. Key Metadata Block (Issue Date, Due Date, Status)
    meta_block_data = [
        [Paragraph("ISSUE DATE", meta_style), Paragraph("DUE DATE", meta_style), Paragraph("STATUS", meta_style)],
        [
            Paragraph(f"<b>{facture.date_emission.strftime('%d %b, %Y')}</b>", body_style),
            Paragraph(f"<b>{facture.date_echeance.strftime('%d %b, %Y') if facture.date_echeance else 'Upon Receipt'}</b>", body_style),
            Paragraph(f"<b>{facture.statut.upper()}</b>", ParagraphStyle('St', parent=body_style, textColor=ACCENT if facture.statut == 'payee' else SLATE_900))
        ]
    ]
    meta_table = Table(meta_block_data, colWidths=[6*cm, 6*cm, 6*cm])
    meta_table.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), SLATE_100), ('LEFTPADDING', (0,0), (-1,-1), 15), ('TOPPADDING', (0,0), (-1,-1), 15), ('BOTTOMPADDING', (0,0), (-1,-1), 15)]))
    elements.append(meta_table)
    elements.append(Spacer(1, 1*cm))

    # 3. Client & Billing Address
    client_info_data = [[
        [
            Paragraph("ÉMETTEUR", meta_style),
            Spacer(1, 5),
            Paragraph("<b>DÉPÔT MANAGER SARL</b>", body_bold),
            Paragraph("ICE: 001234567890001", body_style),
            Paragraph("RC: 45678", body_style),
        ],
        [
            Paragraph("DESTINATAIRE", meta_style),
            Spacer(1, 5),
            Paragraph(f"<b>{facture.client.nom} {facture.client.prenom}</b>", ParagraphStyle('Cl', fontSize=12, fontName='Helvetica-Bold')),
            Paragraph(f"Email: {facture.client.email}", body_style),
            Paragraph(f"Tél: {facture.client.telephone}", body_style),
            Paragraph(f"ICE: {getattr(facture.client, 'ice', 'N/A')}", body_style),
        ]
    ]]
    client_info_table = Table(client_info_data, colWidths=[9*cm, 9*cm])
    elements.append(client_info_table)
    elements.append(Spacer(1, 1*cm))

    # 4. Premium Items Table
    data = [[
        Paragraph("DESCRIPTION", meta_style),
        Paragraph("QTY", meta_style),
        Paragraph("UNIT PRICE", meta_style),
        Paragraph("AMOUNT", meta_style)
    ]]
    
    for l in facture.lignes.all():
        data.append([
            Paragraph(f"<b>{l.produit.nom}</b><br/><font size=8 color='#94a3b8'>SKU: {l.produit.id}</font>", body_style),
            Paragraph(str(l.quantite), ParagraphStyle('q', parent=body_style, alignment=TA_CENTER)),
            Paragraph(f"{float(l.prix_unitaire):,.2f}", price_style),
            Paragraph(f"{(float(l.quantite) * float(l.prix_unitaire)):,.2f}", price_style)
        ])
    
    table = Table(data, colWidths=[9.5*cm, 1.5*cm, 3.5*cm, 3.5*cm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SLATE_100),
        ('TEXTCOLOR', (0,0), (-1,0), SLATE_900),
        ('ALIGN', (1,0), (1,-1), 'CENTER'),
        ('BOTTOMPADDING', (0,0), (-1,0), 12),
        ('TOPPADDING', (0,1), (-1,-1), 12),
        ('BOTTOMPADDING', (0,1), (-1,-1), 12),
        ('LINEBELOW', (0,0), (-1,0), 2, ACCENT),
        ('LINEBELOW', (0,1), (-1,-2), 0.5, colors.HexColor("#e2e8f0")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 1*cm))

    # 5. Totals & Tax Breakdown
    t_ht = float(facture.total_ht)
    t_tva = float(facture.total_tva)
    rem = (float(facture.total_ttc) * float(facture.remise) / 100)
    t_ttc = float(facture.total_ttc) - rem

    totals_data = [
        ["", "SOUS-TOTAL HT", f"{t_ht:,.2f} MAD"],
        ["", "TVA (20%)", f"{t_tva:,.2f} MAD"],
        ["", f"REMISE ({facture.remise}%)", f"- {rem:,.2f} MAD"],
        ["", Paragraph("TOTAL TTC", ParagraphStyle('TotL', fontName='Helvetica-Bold', fontSize=12, textColor=colors.white)), Paragraph(f"{t_ttc:,.2f} MAD", ParagraphStyle('TotV', fontName='Helvetica-Bold', fontSize=16, textColor=colors.white, alignment=TA_RIGHT))]
    ]
    totals_table = Table(totals_data, colWidths=[11*cm, 3.5*cm, 3.5*cm])
    totals_table.setStyle(TableStyle([
        ('ALIGN', (1,0), (1,-1), 'LEFT'),
        ('ALIGN', (2,0), (2,-1), 'RIGHT'),
        ('FONTSIZE', (1,0), (2,2), 9),
        ('FONTNAME', (1,0), (2,2), 'Helvetica-Bold'),
        ('TEXTCOLOR', (1,0), (2,2), SLATE_600),
        ('BACKGROUND', (1,3), (2,3), ACCENT),
        ('TOPPADDING', (1,3), (2,3), 15),
        ('BOTTOMPADDING', (1,3), (2,3), 15),
        ('LEFTPADDING', (1,3), (1,3), 15),
        ('RIGHTPADDING', (2,3), (2,3), 15),
    ]))
    elements.append(totals_table)

    # 6. Legal & Note
    elements.append(Spacer(1, 3*cm))
    legal = Paragraph("<b>Notes:</b> Please ensure payment is made within the agreed timeframe. This is a computer-generated invoice and requires no physical signature.<br/><font color='#94a3b8'>Dépôt Manager SARL • RC: 45678 • ICE: 001234567890001 • Patente: 321456</font>", ParagraphStyle('L', parent=body_style, fontSize=7, alignment=TA_CENTER))
    elements.append(legal)

    doc.build(elements, onFirstPage=draw_background, onLaterPages=draw_background)
    pdf = buffer.getvalue()
    buffer.close()
    return pdf
