"use client"

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Printer, Download, Mail, Building2, User, Calendar, Receipt } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { downloadFacturePdf } from "@/lib/api"
import { toast } from "sonner"
import DepotManagerLogo from "@/components/Logo"

interface FactureDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  facture: any
}

export function FactureDetailDialog({ open, onOpenChange, facture }: FactureDetailDialogProps) {
  if (!facture) return null

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = async () => {
    try {
      const response = await downloadFacturePdf(facture.id)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Facture_${facture.numero}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success("Téléchargement lancé")
    } catch (error) {
      toast.error("Erreur lors du téléchargement")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px] p-0 overflow-hidden rounded-[2.5rem] bg-white print:shadow-none print:border-none">
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Action Bar (Hidden in print) */}
          <div className="flex items-center justify-between p-6 bg-slate-50 border-b print:hidden">
            <div className="flex items-center gap-3">
              <Receipt className="text-black h-5 w-5" />
              <h3 className="font-black text-slate-900 uppercase tracking-wider text-xs">Visualisation de la Facture</h3>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-xl gap-2 font-bold text-xs" onClick={handlePrint}>
                <Printer size={14} /> Imprimer
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl gap-2 font-bold text-xs" onClick={handleDownload}>
                <Download size={14} /> PDF
              </Button>
              <Button size="sm" className="rounded-xl gap-2 bg-black text-white hover:bg-slate-800 transition-all font-bold text-xs">
                <Mail size={14} /> Envoyer
              </Button>
            </div>
          </div>

          {/* Invoice Body */}
          <div className="flex-1 overflow-y-auto p-8 print:p-0">
             <div id="invoice-content" className="space-y-8">
                {/* Header: Company vs Client */}
                <div className="flex justify-between items-start">
                   <div className="space-y-3">
                      <DepotManagerLogo variant="full" size="md" theme="dark" />
                      <div className="text-xs text-slate-500 space-y-1">
                         <p className="flex items-center gap-1.5"><Building2 size={12} /> 123 Rue de l'Industrie, Casablanca</p>
                         <p className="flex items-center gap-1.5"><Mail size={12} /> contact@depot-manager.ma</p>
                      </div>
                   </div>

                   <div className="text-right space-y-1.5">
                      <h2 className="text-3xl font-black text-slate-950 uppercase tracking-widest">FACTURE</h2>
                      <div className="flex flex-col items-end gap-1">
                         <Badge variant="outline" className="text-sm font-mono border-slate-200 px-3 py-0.5 rounded-lg">{facture.numero}</Badge>
                         <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                            <p className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(facture.date_emission).toLocaleDateString()}</p>
                         </div>
                      </div>
                   </div>
                </div>

                <Separator className="bg-slate-100" />

                {/* Client Info */}
                <div className="grid grid-cols-2 gap-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                   <div className="space-y-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Facturé à</p>
                      <div className="space-y-0.5">
                         <p className="text-base font-black text-slate-950">{facture.client_nom}</p>
                         <p className="text-xs text-slate-500 font-medium">Casablanca, Maroc</p>
                         <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-1.5"><User size={12} /> Client ID: #{facture.client}</p>
                      </div>
                   </div>
                   <div className="text-right space-y-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Échéance</p>
                      <div className="space-y-0.5">
                         <p className="text-base font-black text-black">{facture.date_echeance ? new Date(facture.date_echeance).toLocaleDateString() : 'N/A'}</p>
                         <p className="text-[9px] text-slate-400 font-black uppercase">Condition: Paiement à réception</p>
                      </div>
                   </div>
                </div>

                {/* Table */}
                <div className="space-y-4">
                   <table className="w-full">
                      <thead>
                         <tr className="border-b-2 border-black">
                            <th className="text-left py-3 font-black text-slate-900 uppercase text-[10px] tracking-widest">Désignation</th>
                            <th className="text-center py-3 font-black text-slate-900 uppercase text-[10px] tracking-widest">Qté</th>
                            <th className="text-right py-3 font-black text-slate-900 uppercase text-[10px] tracking-widest">Prix Unitaire</th>
                            <th className="text-right py-3 font-black text-slate-900 uppercase text-[10px] tracking-widest">Total HT</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {facture.lignes?.map((l: any, i: number) => (
                            <tr key={i}>
                               <td className="py-4">
                                  <p className="font-bold text-slate-900 text-sm">{l.produit_nom}</p>
                                  <p className="text-[10px] text-slate-400">Réf: {l.produit}</p>
                               </td>
                               <td className="text-center font-bold text-slate-700 text-sm">{l.quantite}</td>
                               <td className="text-right font-medium text-slate-600 text-xs">{parseFloat(l.prix_unitaire).toLocaleString()} MAD</td>
                               <td className="text-right font-black text-slate-900 text-sm">{(l.quantite * l.prix_unitaire).toLocaleString()} MAD</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>

                {/* Summary */}
                <div className="flex justify-end pt-4">
                   <div className="w-72 space-y-3">
                      <div className="flex justify-between items-center text-slate-500 font-medium text-xs">
                         <span>Total HT</span>
                         <span className="text-slate-950">{parseFloat(facture.total_ht).toLocaleString()} MAD</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-500 font-medium text-xs">
                         <span>TVA (20%)</span>
                         <span className="text-slate-950">{parseFloat(facture.total_tva).toLocaleString()} MAD</span>
                      </div>
                      {parseFloat(facture.remise) > 0 && (
                        <div className="flex justify-between items-center text-slate-600 font-bold text-xs">
                           <span>Remise ({facture.remise}%)</span>
                           <span>- {(parseFloat(facture.total_ttc) * facture.remise / 100).toLocaleString()} MAD</span>
                        </div>
                      )}
                      <Separator className="bg-black h-0.5" />
                      <div className="flex justify-between items-center pt-1.5">
                         <span className="text-xs font-black uppercase tracking-wider text-slate-900">Total TTC</span>
                         <span className="text-xl font-black text-slate-950">{parseFloat(facture.total_apres_remise).toLocaleString()} MAD</span>
                      </div>
                   </div>
                </div>

                {/* Footer */}
                <div className="pt-12 text-center space-y-1 pb-4">
                   <p className="text-xs font-bold text-slate-950">Merci de votre confiance !</p>
                   <p className="text-[9px] text-slate-400 font-medium">DEPOT MANAGER SARL - ICE: 001234567890001 - RC: 45678 - CNSS: 9876543</p>
                </div>
             </div>
          </div>
        </div>
      </DialogContent>
      
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-content, #invoice-content * {
            visibility: visible;
          }
          #invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </Dialog>
  )
}
