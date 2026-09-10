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
import { ArrowRightLeft, Calendar, User, Warehouse, Package, Truck, FileText, Printer, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TransfertDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transfert: any
}

export function TransfertDetailDialog({ open, onOpenChange, transfert }: TransfertDetailDialogProps) {
  if (!transfert) return null

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'recu': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'expedie': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'annule': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl">
        <DialogHeader className="p-8 bg-slate-50/50">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="font-mono text-xs font-bold px-2 py-1 bg-white border-slate-200">
                  {transfert.numero || `TR-${transfert.id}`}
                </Badge>
                <Badge className={`uppercase text-[10px] font-bold px-3 py-1 rounded-full ${getStatutColor(transfert.statut)}`}>
                  {transfert.statut}
                </Badge>
              </div>
              <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight">
                Détails du Transfert
              </DialogTitle>
              <DialogDescription className="flex items-center gap-4 text-slate-500 mt-2 font-medium">
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 opacity-50" /> {new Date(transfert.created_at).toLocaleDateString('fr-FR')}</span>
                <span className="flex items-center gap-1.5"><User className="h-4 w-4 opacity-50" /> Géré par {transfert.createur_nom}</span>
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-xl h-11 w-11 border-slate-200"><Printer className="h-5 w-5" /></Button>
              <Button variant="outline" size="icon" className="rounded-xl h-11 w-11 border-slate-200"><Download className="h-5 w-5" /></Button>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <ScrollArea className="flex-1 p-8">
          <div className="space-y-10">
            {/* Movement Path */}
            <div className="flex items-center justify-between bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-2 h-full bg-primary/20"></div>
               <div className="space-y-1.5 text-center flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Origine</p>
                  <Warehouse className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-black text-lg text-slate-800">{transfert.entrepot_source_nom}</p>
               </div>
               
               <div className="flex flex-col items-center px-8">
                  <div className="h-px w-24 bg-slate-200 relative">
                     <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-white px-2">
                        <Truck className="h-4 w-4 text-primary animate-pulse" />
                     </div>
                  </div>
               </div>

               <div className="space-y-1.5 text-center flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Destination</p>
                  <Warehouse className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-black text-lg text-slate-800">{transfert.entrepot_destination_nom}</p>
               </div>
            </div>

            {/* Articles Table */}
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                 <div className="p-2 bg-slate-100 rounded-lg">
                    <Package size={18} className="text-slate-600" />
                 </div>
                 <h4 className="text-lg font-black text-slate-900 tracking-tight">Inventaire Transféré</h4>
              </div>
              
              <div className="border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="h-12">
                      <TableHead className="pl-6 font-bold text-slate-600">Article</TableHead>
                      <TableHead className="text-center font-bold text-slate-600">Quantité</TableHead>
                      <TableHead className="text-right pr-6 font-bold text-slate-600">Unité</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transfert.lignes?.map((ligne: any) => (
                      <TableRow key={ligne.id} className="border-b border-slate-50 group hover:bg-slate-50/30 transition-colors">
                        <TableCell className="pl-6 py-4 font-bold text-slate-700">{ligne.produit_nom}</TableCell>
                        <TableCell className="text-center font-black text-slate-900">{ligne.quantite}</TableCell>
                        <TableCell className="text-right pr-6 text-slate-400 font-medium">Unités</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Notes Section */}
            {transfert.notes && (
               <div className="bg-orange-50/50 border border-orange-100 p-6 rounded-2xl flex gap-4">
                  <FileText className="h-6 w-6 text-orange-400 shrink-0" />
                  <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase tracking-widest text-orange-600">Notes d'expédition</p>
                     <p className="text-sm text-orange-800 leading-relaxed font-medium">{transfert.notes}</p>
                  </div>
               </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-6 bg-slate-900 text-white flex items-center justify-between px-10">
           <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Articles</span>
              <span className="text-2xl font-black">{transfert.lignes?.reduce((acc: number, l: any) => acc + l.quantite, 0)} <span className="text-sm font-normal opacity-50">Unités</span></span>
           </div>
           <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold px-8 shadow-xl shadow-white/5">
              Modifier le Statut
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
