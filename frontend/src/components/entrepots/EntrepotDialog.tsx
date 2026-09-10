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
import { Warehouse, MapPin, User, CheckCircle2 } from "lucide-react"
import { createEntrepot, updateEntrepot, fetchAvailableResponsibles } from "@/lib/api"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"

interface EntrepotDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entrepot?: any
  onSuccess: () => void
}

export function EntrepotDialog({ open, onOpenChange, entrepot, onSuccess }: EntrepotDialogProps) {
  const isEdit = !!entrepot
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    nom: "",
    ville: "",
    adresse: "",
    responsable: "",
    actif: true
  })

  useEffect(() => {
    if (open) {
      fetchAvailableResponsibles().then(data => {
        setUsers(Array.isArray(data) ? data : data.results || [])
      }).catch(() => {})
      if (entrepot) {
        setFormData({
          nom: entrepot.nom || "",
          ville: entrepot.ville || "",
          adresse: entrepot.adresse || "",
          responsable: entrepot.responsable?.toString() || "",
          actif: entrepot.actif ?? true
        })
      } else {
        setFormData({
          nom: "",
          ville: "",
          adresse: "",
          responsable: "",
          actif: true
        })
      }
    }
  }, [open, entrepot])

  const handleSubmit = async () => {
    if (!formData.nom.trim()) {
      toast.error("Le nom de l'entrepôt est obligatoire")
      return
    }
    if (!formData.responsable) {
      toast.error("Le responsable de l'entrepôt est obligatoire")
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...formData,
        responsable: formData.responsable || null
      }
      if (isEdit) {
        await updateEntrepot(entrepot.id, payload)
        toast.success("Entrepôt mis à jour")
      } else {
        await createEntrepot(payload)
        toast.success("Entrepôt créé")
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
      <DialogContent className="sm:max-w-[500px] rounded-3xl overflow-hidden p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            <Warehouse className="h-6 w-6 text-primary" />
            {isEdit ? "Modifier l'Entrepôt" : "Nouvel Entrepôt"}
          </DialogTitle>
          <DialogDescription>
            Configurez les informations de localisation et de gestion.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="nom" className="font-bold flex items-center gap-2">
                 Nom de l'entrepôt <span className="text-rose-500">*</span>
              </Label>
              <Input 
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                placeholder="Ex: Dépôt Central"
                className="h-11 rounded-xl shadow-sm border-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ville" className="font-bold flex items-center gap-2">
                  <MapPin size={14} /> Ville
                </Label>
                <Input 
                  id="ville"
                  value={formData.ville}
                  onChange={(e) => setFormData({...formData, ville: e.target.value})}
                  placeholder="Ex: Casablanca"
                  className="h-11 rounded-xl shadow-sm border-slate-200"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="responsable" className="font-bold flex items-center gap-2">
                  <User size={14} /> Responsable <span className="text-rose-500">*</span>
                </Label>
                <select 
                  className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.responsable}
                  onChange={(e) => setFormData({...formData, responsable: e.target.value})}
                >
                  <option value="">Sélectionner</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id.toString()}>{u.display_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="adresse" className="font-bold">Adresse complète</Label>
              <Textarea 
                id="adresse"
                value={formData.adresse}
                onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                placeholder="Zone Industrielle..."
                className="rounded-xl min-h-[100px] border-slate-200 shadow-sm"
              />
            </div>

            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
               <input 
                 type="checkbox" 
                 id="actif" 
                 checked={formData.actif}
                 onChange={(e) => setFormData({...formData, actif: e.target.checked})}
                 className="size-5 rounded-md accent-primary"
               />
               <Label htmlFor="actif" className="font-bold cursor-pointer">Cet entrepôt est actif</Label>
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
            {loading ? "Traitement..." : isEdit ? "Sauvegarder" : "Créer l'entrepôt"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
