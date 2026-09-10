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
import { Plus, Trash2, ShoppingCart, Calculator, Calendar } from "lucide-react"
import { api, fetchProduits, fetchFournisseurs, fetchClients, createCommande, updateCommande, patchCommande } from "@/lib/api"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface CommandeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  commande?: any
  onSuccess: () => void
}

export function CommandeDialog({ open, onOpenChange, commande, onSuccess }: CommandeDialogProps) {
  const isEdit = !!commande
  const [type, setType] = useState<"achat" | "vente">(commande?.type_commande || "achat")
  const [partnerId, setPartnerId] = useState<string>(
    commande ? (commande.type_commande === 'achat' ? commande.fournisseur : commande.client) : ""
  )
  const [statut, setStatut] = useState<string>(commande?.statut || "brouillon")
  const [dateLivraison, setDateLivraison] = useState<string>(commande?.date_livraison_prevue || "")
  const [note, setNote] = useState<string>(commande?.note || "")
  const [lignes, setLignes] = useState<any[]>(commande?.lignes || [])
  
  const [produits, setProduits] = useState<any[]>([])
  const [partners, setPartners] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchProduits().then(data => setProduits(Array.isArray(data) ? data : data.results || []))
      if (type === "achat") {
        fetchFournisseurs().then(data => setPartners(Array.isArray(data) ? data : data.results || []))
      } else {
        fetchClients().then(data => setPartners(Array.isArray(data) ? data : data.results || []))
      }
    }
  }, [open, type])

  useEffect(() => {
    if (commande) {
      setType(commande.type_commande)
      const fId = typeof commande.fournisseur === 'object' ? commande.fournisseur?.id : commande.fournisseur
      const cId = typeof commande.client === 'object' ? commande.client?.id : commande.client
      setPartnerId((commande.type_commande === 'achat' ? fId?.toString() : cId?.toString()) || "")
      setStatut(commande.statut)
      setDateLivraison(commande.date_livraison_prevue || "")
      setNote(commande.note || "")
      setLignes(commande.lignes || [])
    } else {
      setType("achat")
      setPartnerId("")
      setStatut("brouillon")
      setDateLivraison("")
      setNote("")
      setLignes([])
    }
  }, [commande, open])

  const addLigne = () => {
    setLignes([...lignes, { produit: "", quantite: 1, prix_unitaire: 0, tva: 20 }])
  }

  const removeLigne = (index: number) => {
    setLignes(lignes.filter((_, i) => i !== index))
  }

  const updateLigne = (index: number, field: string, value: any) => {
    const newLignes = [...lignes]
    newLignes[index][field] = value
    
    if (field === 'produit') {
      const p = produits.find(prd => prd.id.toString() === value)
      if (p) {
        newLignes[index].prix_unitaire = type === 'achat' ? p.prix_achat : p.prix_vente
        newLignes[index].tva = p.tva || 20
      }
    }
    
    setLignes(newLignes)
  }

  const calculateTotalHT = () => {
    return lignes.reduce((acc, l) => acc + (l.quantite * l.prix_unitaire), 0)
  }

  const calculateTotalTTC = () => {
    return lignes.reduce((acc, l) => {
      const ht = l.quantite * l.prix_unitaire
      return acc + (ht * (1 + (l.tva || 20) / 100))
    }, 0)
  }

  const handleSubmit = async () => {
    if (!partnerId) {
      toast.error("Veuillez sélectionner un " + (type === 'achat' ? "fournisseur" : "client"))
      return
    }
    if (lignes.length === 0) {
      toast.error("Veuillez ajouter au moins un produit")
      return
    }

    setLoading(true)
    const payload = {
      type_commande: type,
      statut: statut,
      note: note,
      date_livraison_prevue: dateLivraison || null,
      [type === 'achat' ? 'fournisseur' : 'client']: partnerId,
      lignes: lignes.map(l => ({
        produit: l.produit,
        quantite: l.quantite,
        prix_unitaire: l.prix_unitaire,
        tva: l.tva
      }))
    }

    try {
      if (isEdit) {
        await patchCommande(commande.id, payload)
        toast.success("Commande mise à jour")
      } else {
        await createCommande(payload)
        toast.success("Commande créée")
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            {isEdit ? "Modifier la Commande" : "Nouvelle Commande"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "Modifiez les détails de la commande existante." : "Créez une nouvelle commande d'achat ou de vente."}
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <ScrollArea className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-semibold">Type de Commande</Label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <Button 
                    type="button"
                    variant={type === "achat" ? "default" : "ghost"} 
                    className="flex-1 rounded-lg h-9 text-sm"
                    onClick={() => setType("achat")}
                    disabled={isEdit}
                  >
                    Achat (Fournisseur)
                  </Button>
                  <Button 
                    type="button"
                    variant={type === "vente" ? "default" : "ghost"} 
                    className="flex-1 rounded-lg h-9 text-sm"
                    onClick={() => setType("vente")}
                    disabled={isEdit}
                  >
                    Vente (Client)
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">{type === "achat" ? "Fournisseur" : "Client"}</Label>
                <Select value={partnerId} onValueChange={(v) => setPartnerId(v || "")}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder={`Sélectionner un ${type === 'achat' ? 'fournisseur' : 'client'}`} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {partners.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Statut</Label>
                <Select value={statut} onValueChange={(v) => setStatut(v || "brouillon")}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brouillon">Brouillon</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="recue">Reçue / Livrée</SelectItem>
                    <SelectItem value="annulee">Annulée</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Date de Livraison Prévue</Label>
                <Input 
                  type="date" 
                  className="h-11 rounded-xl" 
                  value={dateLivraison}
                  onChange={(e) => setDateLivraison(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-bold">Articles</Label>
                <Button type="button" onClick={addLigne} size="sm" className="rounded-xl gap-2 shadow-sm">
                  <Plus className="h-4 w-4" /> Ajouter un produit
                </Button>
              </div>

              <div className="border rounded-2xl overflow-x-auto shadow-sm">
                <Table className="min-w-[600px]">
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="w-[300px]">Produit</TableHead>
                      <TableHead className="w-[100px]">Quantité</TableHead>
                      <TableHead>Prix Unitaire</TableHead>
                      <TableHead className="text-right">Total HT</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lignes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground italic">
                          Aucun produit ajouté.
                        </TableCell>
                      </TableRow>
                    ) : (
                      lignes.map((ligne, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Select 
                              value={ligne.produit?.toString()} 
                              onValueChange={(v) => updateLigne(index, 'produit', v || "")}
                            >
                              <SelectTrigger className="h-9 border-none bg-transparent hover:bg-slate-50">
                                <SelectValue placeholder="Produit..." />
                              </SelectTrigger>
                              <SelectContent className="max-h-[300px]">
                                {produits.map(p => (
                                  <SelectItem key={p.id} value={p.id.toString()}>{p.nom} ({p.code})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              value={ligne.quantite} 
                              onChange={(e) => updateLigne(index, 'quantite', parseInt(e.target.value) || 0)}
                              className="h-9 border-none bg-transparent focus-visible:ring-0"
                            />
                          </TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              value={ligne.prix_unitaire} 
                              onChange={(e) => updateLigne(index, 'prix_unitaire', parseFloat(e.target.value) || 0)}
                              className="h-9 border-none bg-transparent focus-visible:ring-0"
                            />
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {(ligne.quantite * ligne.prix_unitaire).toLocaleString()} MAD
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeLigne(index)}
                              className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
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

            <div className="space-y-2">
              <Label className="font-semibold">Note / Instructions</Label>
              <Input 
                value={note} 
                onChange={(e) => setNote(e.target.value)} 
                placeholder="Notes additionnelles..." 
                className="rounded-xl"
              />
            </div>
          </div>
        </ScrollArea>

        <div className="bg-slate-50 p-6 border-t">
          <div className="flex flex-col gap-2 max-w-[300px] ml-auto">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Total HT</span>
              <span>{calculateTotalHT().toLocaleString()} MAD</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500">
              <span>TVA (20%)</span>
              <span>{(calculateTotalTTC() - calculateTotalHT()).toLocaleString()} MAD</span>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between text-lg font-black text-slate-900">
              <span>Total TTC</span>
              <span>{calculateTotalTTC().toLocaleString()} MAD</span>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">Annuler</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="px-8 rounded-xl bg-primary shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
          >
            {loading ? "Traitement..." : isEdit ? "Mettre à jour" : "Créer la commande"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
