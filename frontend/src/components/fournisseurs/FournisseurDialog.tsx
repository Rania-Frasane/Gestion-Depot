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
import { Truck, Mail, Phone, MapPin, Globe, Award, ShieldCheck, Camera } from "lucide-react"
import { createFournisseur, updateFournisseur, api } from "@/lib/api"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface FournisseurDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fournisseur?: any
  onSuccess: () => void
}

export function FournisseurDialog({ open, onOpenChange, fournisseur, onSuccess }: FournisseurDialogProps) {
  const isEdit = !!fournisseur
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    nom: "",
    contact_nom: "",
    email: "",
    telephone: "",
    adresse: "",
    ville: "",
    categorie: "",
    actif: true,
    logo: null as File | null
  })

  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const getLogoUrl = (url: string | null) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `http://localhost:8000${url}`
  }

  useEffect(() => {
    if (open) {
      api.get('categories/').then(res => setCategories(res.data)).catch(() => {})
      if (fournisseur) {
        setFormData({
          nom: fournisseur.nom || "",
          contact_nom: fournisseur.contact_nom || "",
          email: fournisseur.email || "",
          telephone: fournisseur.telephone || "",
          adresse: fournisseur.adresse || "",
          ville: fournisseur.ville || "",
          categorie: fournisseur.categorie?.toString() || "",
          actif: fournisseur.actif ?? true,
          logo: null
        })
        setLogoPreview(getLogoUrl(fournisseur.logo) || null)
      } else {
        setFormData({
          nom: "",
          contact_nom: "",
          email: "",
          telephone: "",
          adresse: "",
          ville: "",
          categorie: "",
          actif: true,
          logo: null
        })
        setLogoPreview(null)
      }
    }
  }, [open, fournisseur])

  const handleSubmit = async () => {
    if (!formData.nom) {
      toast.error("Le nom de l'entreprise est obligatoire")
      return
    }

    setLoading(true)
    try {
      const data = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'logo') {
          if (value) data.append(key, value as File)
        } else if (key === 'categorie' && value === "") {
          // Skip empty foreign keys
        } else if (value !== null && value !== undefined) {
          data.append(key, value.toString())
        }
      })

      if (isEdit) {
        await updateFournisseur(fournisseur.id, data)
        toast.success("Fournisseur mis à jour")
      } else {
        await createFournisseur(data)
        toast.success("Fournisseur créé")
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
      <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-0 overflow-hidden shadow-2xl border-none">
        <DialogHeader className="p-8 pb-4 bg-slate-50/50">
          <DialogTitle className="text-3xl font-black flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-primary/10 rounded-xl">
               <Truck className="h-7 w-7 text-primary" />
            </div>
            {isEdit ? "Editer Fournisseur" : "Nouveau Partenaire Logistique"}
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium text-base">
            Configurez les informations d'approvisionnement et de contact.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* Logo Section */}
          <div className="flex flex-col items-center gap-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
            <div className="relative group">
              <Avatar className="size-32 border-4 border-white shadow-2xl bg-neutral-900 text-white flex items-center justify-center">
                {logoPreview ? (
                  <AvatarImage src={logoPreview} className="object-cover animate-fade-in" />
                ) : (
                  <div className="size-full bg-gradient-to-br from-neutral-800 to-neutral-950 flex items-center justify-center text-4xl font-extrabold tracking-tight text-white uppercase">
                    {formData.nom?.[0] || "FR"}
                  </div>
                )}
              </Avatar>
              <label className="absolute bottom-0 right-0 p-2.5 bg-neutral-900 text-white hover:bg-neutral-800 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform border border-neutral-800">
                <Camera size={20} />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setFormData({ ...formData, logo: file })
                      setLogoPreview(URL.createObjectURL(file))
                    }
                  }}
                />
              </label>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-neutral-900">Logo de l'entreprise</p>
              <p className="text-[11px] text-slate-500 font-medium max-w-xs">Formats recommandés: PNG ou JPG.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="nom" className="font-bold ml-1 text-slate-700">Raison Sociale / Nom Entreprise</Label>
              <Input 
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                placeholder="Ex: Distribution Express S.A."
                className="h-12 rounded-2xl border-slate-200 shadow-sm font-bold text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact" className="font-bold ml-1 text-slate-700">Personne de contact</Label>
              <Input 
                id="contact"
                value={formData.contact_nom}
                onChange={(e) => setFormData({...formData, contact_nom: e.target.value})}
                placeholder="Ex: M. Khalid"
                className="h-12 rounded-2xl border-slate-200 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categorie" className="font-bold ml-1 text-slate-700">Catégorie Principale</Label>
              <select 
                className="flex h-12 w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.categorie}
                onChange={(e) => setFormData({...formData, categorie: e.target.value})}
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold ml-1 text-slate-700 flex items-center gap-2"><Mail size={14} /> Email pro</Label>
              <Input 
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="achats@fournisseur.ma"
                className="h-12 rounded-2xl border-slate-200 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone" className="font-bold ml-1 text-slate-700 flex items-center gap-2"><Phone size={14} /> Téléphone</Label>
              <Input 
                id="telephone"
                value={formData.telephone}
                onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                placeholder="+212 5..."
                className="h-12 rounded-2xl border-slate-200 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ville" className="font-bold ml-1 text-slate-700 flex items-center gap-2"><MapPin size={14} /> Ville</Label>
              <Input 
                id="ville"
                value={formData.ville}
                onChange={(e) => setFormData({...formData, ville: e.target.value})}
                placeholder="Ex: Tanger"
                className="h-12 rounded-2xl border-slate-200 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold ml-1 text-slate-700 flex items-center gap-2"><Award size={14} /> Fiabilité</Label>
              <div className="flex bg-slate-100 p-1 rounded-2xl h-12">
                <Button 
                  type="button"
                  variant={formData.actif ? "default" : "ghost"} 
                  className={`flex-1 rounded-xl h-full font-bold text-xs gap-2 ${formData.actif ? 'bg-primary shadow-lg shadow-primary/20' : 'text-slate-500'}`}
                  onClick={() => setFormData({...formData, actif: true})}
                >
                  <ShieldCheck size={14} /> Certifié
                </Button>
                <Button 
                  type="button"
                  variant={!formData.actif ? "default" : "ghost"} 
                  className={`flex-1 rounded-xl h-full font-bold text-xs gap-2 ${!formData.actif ? 'bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-200' : 'text-slate-500'}`}
                  onClick={() => setFormData({...formData, actif: false})}
                >
                  Suspendu
                </Button>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="adresse" className="font-bold ml-1 text-slate-700">Adresse Administrative</Label>
              <Textarea 
                id="adresse"
                value={formData.adresse}
                onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                placeholder="Siège social, Avenue..."
                className="rounded-2xl min-h-[80px] border-slate-200 shadow-sm"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 pt-4 bg-slate-50/50">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl h-12 px-6 font-bold">Annuler</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="px-12 h-12 rounded-2xl bg-primary shadow-xl shadow-primary/20 hover:scale-105 transition-all font-black text-white"
          >
            {loading ? "Traitement..." : isEdit ? "Mettre à jour" : "Valider Partenaire"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
