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
import { Textarea } from "@/components/ui/textarea"
import { Receipt, User, Calendar, Plus, Trash2, ShoppingBag } from "lucide-react"
import { createFacture, updateFacture, api } from "@/lib/api"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface FactureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  facture?: any
  onSuccess: () => void
}

export function FactureDialog({ open, onOpenChange, facture, onSuccess }: FactureDialogProps) {
  const isEdit = !!facture
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [produits, setProduits] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    client: "",
    date_echeance: "",
    remise: 0,
    note: "",
    statut: "brouillon",
    lignes: [] as any[]
  })

  useEffect(() => {
    if (open) {
      api.get('clients/').then(res => setClients(res.data)).catch(() => {})
      api.get('produits/').then(res => setProduits(res.data)).catch(() => {})
      
      if (facture) {
        setFormData({
          client: facture.client?.toString() || "",
          date_echeance: facture.date_echeance || "",
          remise: facture.remise || 0,
          note: facture.note || "",
          statut: facture.statut || "brouillon",
          lignes: facture.lignes || []
        })
      } else {
        setFormData({
          client: "",
          date_echeance: "",
          remise: 0,
          note: "",
          statut: "brouillon",
          lignes: []
        })
      }
    }
  }, [open, facture])

  const addLigne = () => {
    setFormData({
      ...formData,
      lignes: [...formData.lignes, { produit: "", quantite: 1, prix_unitaire: 0, tva: 20 }]
    })
  }

  const removeLigne = (index: number) => {
    const newLignes = [...formData.lignes]
    newLignes.splice(index, 1)
    setFormData({ ...formData, lignes: newLignes })
  }

  const updateLigne = (index: number, field: string, value: any) => {
    const newLignes = [...formData.lignes]
    newLignes[index][field] = value
    
    if (field === 'produit') {
      const p = produits.find(item => item.id.toString() === value)
      if (p) {
        newLignes[index].prix_unitaire = p.prix_vente
      }
    }
    
    setFormData({ ...formData, lignes: newLignes })
  }

  const calculateTotal = () => {
    const totalHT = formData.lignes.reduce((acc, l) => acc + (l.quantite * l.prix_unitaire), 0)
    const totalTVA = formData.lignes.reduce((acc, l) => acc + (l.quantite * l.prix_unitaire * (l.tva / 100)), 0)
    const totalTTC = totalHT + totalTVA
    const final = totalTTC * (1 - formData.remise / 100)
    return { totalHT, totalTVA, totalTTC, final }
  }

  const handleSubmit = async () => {
    if (!formData.client) {
      toast.error("Veuillez sélectionner un client")
      return
    }
    if (formData.lignes.length === 0) {
      toast.error("Ajoutez au moins un article")
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...formData,
        date_echeance: formData.date_echeance || null,
        remise: parseFloat(formData.remise.toString()) || 0
      }

      if (isEdit) {
        await updateFacture(facture.id, payload)
        toast.success("Facture mise à jour")
      } else {
        await createFacture(payload)
        toast.success("Facture créée avec succès")
      }
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Save Error:", error.response?.data)
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setLoading(false)
    }
  }

  const totals = calculateTotal()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] rounded-3xl overflow-hidden p-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="p-8 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-3xl font-black flex items-center gap-3">
                <Receipt className="h-8 w-8 text-primary" />
                {isEdit ? "Modifier Facture" : "Nouvelle Facture"}
              </DialogTitle>
              <DialogDescription className="text-lg">
                Générez une facture professionnelle pour votre client.
              </DialogDescription>
            </div>
            {isEdit && (
              <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary text-primary font-black uppercase tracking-widest">
                {facture.numero}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <Separator />

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Client & Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Label className="font-bold text-slate-900 flex items-center gap-2">
                <User size={16} className="text-primary" /> Client Destinataire
              </Label>
              <select 
                className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                value={formData.client}
                onChange={(e) => setFormData({...formData, client: e.target.value})}
              >
                <option value="">Sélectionner un client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
              </select>
            </div>
            <div className="space-y-4">
              <Label className="font-bold text-slate-900 flex items-center gap-2">
                <Calendar size={16} className="text-primary" /> Date d'échéance
              </Label>
              <Input 
                type="date"
                value={formData.date_echeance}
                onChange={(e) => setFormData({...formData, date_echeance: e.target.value})}
                className="h-12 rounded-2xl border-slate-200 bg-slate-50"
              />
            </div>
          </div>

          {/* Lignes Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag size={16} className="text-primary" /> Articles & Prestations
              </Label>
              <Button onClick={addLigne} variant="outline" size="sm" className="rounded-xl gap-2 border-primary text-primary hover:bg-primary/5">
                <Plus size={14} /> Ajouter une ligne
              </Button>
            </div>

            <div className="space-y-3">
              {formData.lignes.map((ligne, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-end bg-slate-50/50 p-4 rounded-2xl border border-slate-100 group transition-all hover:border-primary/20">
                  <div className="col-span-5 space-y-2">
                    <Label className="text-[10px] uppercase font-black text-slate-400">Produit</Label>
                    <select 
                      className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                      value={ligne.produit}
                      onChange={(e) => updateLigne(index, 'produit', e.target.value)}
                    >
                      <option value="">Article...</option>
                      {produits.map(p => <option key={p.id} value={p.id}>{p.nom} ({p.stock_actuel} en stock)</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="text-[10px] uppercase font-black text-slate-400">Qté</Label>
                    <Input 
                      type="number"
                      value={ligne.quantite || 0}
                      onChange={(e) => updateLigne(index, 'quantite', parseInt(e.target.value) || 0)}
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="text-[10px] uppercase font-black text-slate-400">P.U (HT)</Label>
                    <Input 
                      type="number"
                      value={ligne.prix_unitaire || 0}
                      onChange={(e) => updateLigne(index, 'prix_unitaire', parseFloat(e.target.value) || 0)}
                      className="h-10 rounded-xl"
                    />
                  </div>
                  <div className="col-span-2 text-right py-2 pr-2">
                    <p className="text-[10px] uppercase font-black text-slate-400">Total HT</p>
                    <p className="font-bold text-slate-700">{(ligne.quantite * ligne.prix_unitaire).toLocaleString()} <span className="text-[8px]">DH</span></p>
                  </div>
                  <div className="col-span-1 text-right">
                    <Button variant="ghost" size="icon" onClick={() => removeLigne(index)} className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <Label className="font-bold text-slate-900">Notes & Conditions</Label>
              <Textarea 
                placeholder="Conditions de paiement, RIB, etc..."
                value={formData.note}
                onChange={(e) => setFormData({...formData, note: e.target.value})}
                className="rounded-2xl min-h-[120px] bg-slate-50 border-slate-200"
              />
            </div>
            <div className="bg-slate-900 text-white rounded-3xl p-8 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center text-slate-400">
                <span className="font-bold">Total HT</span>
                <span className="font-mono">{totals.totalHT.toLocaleString()} MAD</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span className="font-bold">Total TVA (20%)</span>
                <span className="font-mono">{totals.totalTVA.toLocaleString()} MAD</span>
              </div>
              <div className="flex items-center gap-4 py-2 border-y border-white/10">
                <span className="text-slate-400 font-bold shrink-0">Remise (%)</span>
                <Input 
                  type="number"
                  value={formData.remise || 0}
                  onChange={(e) => setFormData({...formData, remise: parseFloat(e.target.value) || 0})}
                  className="h-8 bg-white/10 border-white/20 text-white text-right rounded-lg w-24"
                />
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xl font-black uppercase tracking-widest text-primary">Total TTC</span>
                <span className="text-3xl font-black">{totals.final.toLocaleString()} MAD</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <DialogFooter className="p-8 bg-slate-50/50">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl h-12 px-8 font-bold">Annuler</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="h-12 px-12 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
          >
            {loading ? "Génération..." : isEdit ? "Mettre à jour" : "Valider & Générer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
