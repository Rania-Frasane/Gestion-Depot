"use client"

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { ShoppingCart, Calendar, User, Truck, FileText, Download, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CommandeDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  commande: any
}

export function CommandeDetailDialog({ open, onOpenChange, commande }: CommandeDetailDialogProps) {
  if (!commande) return null

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'recue': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'en_cours': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'annulee': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="p-6 bg-slate-50/50">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-xs font-bold px-2 py-0.5">
                  {commande.numero}
                </Badge>
                <Badge className={`uppercase text-[10px] ${getStatutColor(commande.statut)}`}>
                  {commande.statut.replace('_', ' ')}
                </Badge>
              </div>
              <DialogTitle className="text-2xl font-black text-slate-900">
                Commande de {commande.type_commande === 'achat' ? 'Achat' : 'Vente'}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-4 text-slate-500 mt-2">
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(commande.date_commande).toLocaleDateString('fr-FR')}</span>
                <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> Créé par {commande.createur_nom}</span>
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-xl"><Printer className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" className="rounded-xl"><Download className="h-4 w-4" /></Button>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Truck className="h-3 w-3" /> Partenaire
                </h4>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="font-black text-lg text-slate-800">{commande.fournisseur_nom || commande.client_nom}</p>
                  <p className="text-sm text-slate-500">{commande.type_commande === 'achat' ? 'Fournisseur Principal' : 'Client Enregistré'}</p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <FileText className="h-3 w-3" /> Notes
                </h4>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 h-full">
                  <p className="text-sm text-slate-600 italic">
                    {commande.note || "Aucune note particulière."}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Détails des articles</h4>
              <div className="border rounded-2xl overflow-x-auto shadow-sm">
                <Table className="min-w-[500px]">
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead className="text-center">Quantité</TableHead>
                      <TableHead className="text-right">Prix Unitaire</TableHead>
                      <TableHead className="text-right">Total HT</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commande.lignes?.map((ligne: any) => (
                      <TableRow key={ligne.id}>
                        <TableCell className="font-medium">{ligne.produit_nom}</TableCell>
                        <TableCell className="text-center font-bold">{ligne.quantite}</TableCell>
                        <TableCell className="text-right">{parseFloat(ligne.prix_unitaire).toLocaleString()} MAD</TableCell>
                        <TableCell className="text-right font-black">
                          {(ligne.quantite * parseFloat(ligne.prix_unitaire)).toLocaleString()} MAD
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="bg-slate-900 text-white p-8">
          <div className="flex flex-col gap-3 max-w-[300px] ml-auto">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Total Hors Taxes</span>
              <span className="font-medium text-slate-200">{parseFloat(commande.total_ht).toLocaleString()} MAD</span>
            </div>
            <div className="flex justify-between text-sm text-slate-400">
              <span>TVA Estimée (20%)</span>
              <span className="font-medium text-slate-200">{(parseFloat(commande.total_ttc) - parseFloat(commande.total_ht)).toLocaleString()} MAD</span>
            </div>
            <Separator className="my-2 bg-white/10" />
            <div className="flex justify-between items-baseline">
              <span className="text-slate-400 font-bold">TOTAL TTC</span>
              <span className="text-2xl font-black text-white">{parseFloat(commande.total_ttc).toLocaleString()} MAD</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
