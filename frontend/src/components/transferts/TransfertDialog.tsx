"use client"

import { useState, useEffect } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Plus, Trash2, ArrowRightLeft, Warehouse, Package } from "lucide-react"
import { api, fetchProduits, fetchEntrepots, createTransfert, updateTransfert } from "@/lib/api"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface TransfertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transfert?: any
  onSuccess: () => void
}

export function TransfertDialog({ open, onOpenChange, transfert, onSuccess }: TransfertDialogProps) {
  const isEdit = !!transfert
  const [sourceId, setSourceId] = useState<string>(transfert?.entrepot_source?.toString() || "")
  const [destId, setDestId] = useState<string>(transfert?.entrepot_destination?.toString() || "")
  const [statut, setStatut] = useState<string>(transfert?.statut || "brouillon")
  const [notes, setNotes] = useState<string>(transfert?.notes || "")
  const [lignes, setLignes] = useState<any[]>(transfert?.lignes || [])
  
  const [produits, setProduits] = useState<any[]>([])
  const [entrepots, setEntrepots] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchProduits().then(data => setProduits(Array.isArray(data) ? data : data.results || []))
      fetchEntrepots().then(data => setEntrepots(Array.isArray(data) ? data : data.results || []))
    }
  }, [open])

  useEffect(() => {
    if (transfert) {
      setSourceId(transfert.entrepot_source?.toString())
      setDestId(transfert.entrepot_destination?.toString())
      setStatut(transfert.statut)
      setNotes(transfert.notes || "")
      setLignes(transfert.lignes || [])
    } else {
      setSourceId("")
      setDestId("")
      setStatut("brouillon")
      setNotes("")
      setLignes([])
    }
  }, [transfert, open])

  const addLigne = () => {
    setLignes([...lignes, { produit: "", quantite: 1 }])
  }

  const removeLigne = (index: number) => {
    setLignes(lignes.filter((_, i) => i !== index))
  }

  const updateLigne = (index: number, field: string, value: any) => {
    const newLignes = [...lignes]
    newLignes[index][field] = value
    setLignes(newLignes)
  }

  const handleSubmit = async () => {
    if (!sourceId || !destId) {
      toast.error("Veuillez sélectionner les entrepôts source et destination")
      return
    }
    if (sourceId === destId) {
      toast.error("L'entrepôt source et destination doivent être différents")
      return
    }
    if (lignes.length === 0) {
      toast.error("Veuillez ajouter au moins un produit")
      return
    }

    setLoading(true)
    const payload = {
      entrepot_source: sourceId,
      entrepot_destination: destId,
      statut: statut,
      notes: notes,
      lignes: lignes.map(l => ({
        produit: l.produit,
        quantite: l.quantite
      }))
    }

    try {
      if (isEdit) {
        await updateTransfert(transfert.id, payload)
        toast.success("Transfert mis à jour")
      } else {
        await createTransfert(payload)
        toast.success("Transfert créé")
      }
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-3xl shadow-2xl border-none">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-black flex items-center gap-2 tracking-tight">
            <ArrowRightLeft className="h-6 w-6 text-primary" />
            {isEdit ? "Modifier le Transfert" : "Nouveau Transfert Inter-Dépôt"}
          </DialogTitle>
          <DialogDescription>
            Déplacez des stocks entre vos différents entrepôts.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
              <div className="space-y-3">
                <Label className="font-bold text-slate-500 uppercase text-[10px] tracking-widest flex items-center gap-2">
                  <Warehouse size={14} /> Entrepôt Source
                </Label>
                <Select value={sourceId} onValueChange={(v) => setSourceId(v || "")}>
                  <SelectTrigger className="h-12 rounded-2xl bg-white border-slate-200 shadow-sm">
                    <SelectValue placeholder="Depuis..." />
                  </SelectTrigger>
                  <SelectContent>
                    {entrepots.map(e => (
                      <SelectItem key={e.id} value={e.id.toString()}>{e.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="font-bold text-slate-500 uppercase text-[10px] tracking-widest flex items-center gap-2">
                  <Warehouse size={14} /> Entrepôt Destination
                </Label>
                <Select value={destId} onValueChange={(v) => setDestId(v || "")}>
                  <SelectTrigger className="h-12 rounded-2xl bg-white border-slate-200 shadow-sm">
                    <SelectValue placeholder="Vers..." />
                  </SelectTrigger>
                  <SelectContent>
                    {entrepots.map(e => (
                      <SelectItem key={e.id} value={e.id.toString()}>{e.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Statut du Transfert</Label>
                <Select value={statut} onValueChange={(v) => setStatut(v || "brouillon")}>
                  <SelectTrigger className="h-12 rounded-2xl bg-white border-slate-200 shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brouillon">Brouillon</SelectItem>
                    <SelectItem value="expedie">Expédié</SelectItem>
                    <SelectItem value="recu">Reçu</SelectItem>
                    <SelectItem value="annule">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Notes de transfert</Label>
                <Input 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Ex: Transport par camion interne..." 
                  className="h-12 rounded-2xl bg-white border-slate-200 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <Label className="text-xl font-black text-slate-900 tracking-tight">Liste des Articles</Label>
                <Button type="button" onClick={addLigne} size="sm" className="rounded-xl gap-2 shadow-lg shadow-primary/10">
                  <Plus className="h-4 w-4" /> Ajouter
                </Button>
              </div>

              <div className="border border-slate-100 rounded-[2rem] overflow-hidden shadow-xl bg-white">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="h-12">
                      <TableHead className="pl-6">Produit</TableHead>
                      <TableHead className="w-[150px] text-center">Quantité</TableHead>
                      <TableHead className="w-[80px] text-right pr-6"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lignes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-12 text-slate-400 italic">
                          <div className="flex flex-col items-center gap-2">
                             <Package size={32} className="opacity-10" />
                             <p>Aucun produit à transférer.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      lignes.map((ligne, index) => (
                        <TableRow key={index} className="border-b border-slate-50">
                          <TableCell className="pl-6 py-4">
                            <Select 
                              value={ligne.produit?.toString()} 
                              onValueChange={(v) => updateLigne(index, 'produit', v || "")}
                            >
                              <SelectTrigger className="h-10 border-none bg-slate-50/50 rounded-xl hover:bg-slate-100 transition-colors">
                                <SelectValue placeholder="Sélectionner..." />
                              </SelectTrigger>
                              <SelectContent>
                                {produits.map(p => (
                                  <SelectItem key={p.id} value={p.id.toString()}>{p.nom} ({p.code})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-center">
                            <Input 
                              type="number" 
                              value={ligne.quantite} 
                              onChange={(e) => updateLigne(index, 'quantite', parseInt(e.target.value) || 0)}
                              className="h-10 w-24 mx-auto text-center font-bold rounded-xl bg-slate-50/50 border-none"
                            />
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeLigne(index)}
                              className="h-9 w-9 text-rose-500 hover:bg-rose-50 rounded-xl"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 bg-slate-50 border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold">Annuler</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="px-10 rounded-xl bg-primary font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
          >
            {loading ? "Chargement..." : isEdit ? "Confirmer les modifications" : "Lancer le transfert"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
