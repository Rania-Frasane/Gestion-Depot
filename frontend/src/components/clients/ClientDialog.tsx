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
import { User, Mail, Phone, MapPin, Building2, Banknote, ShieldCheck, Camera } from "lucide-react"
import { createClient, updateClient } from "@/lib/api"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: any
  onSuccess: () => void
}

export function ClientDialog({ open, onOpenChange, client, onSuccess }: ClientDialogProps) {
  const isEdit = !!client
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    ville: "",
    adresse: "",
    type_client: "particulier",
    plafond_credit: 5000,
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
    if (open && client) {
      setFormData({
        nom: client.nom || "",
        prenom: client.prenom || "",
        email: client.email || "",
        telephone: client.telephone || "",
        ville: client.ville || "",
        adresse: client.adresse || "",
        type_client: client.type_client || "particulier",
        plafond_credit: parseFloat(client.plafond_credit) || 5000,
        actif: client.actif ?? true,
        logo: null
      })
      setLogoPreview(getLogoUrl(client.logo) || null)
    } else if (open) {
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        ville: "",
        adresse: "",
        type_client: "particulier",
        plafond_credit: 5000,
        actif: true,
        logo: null
      })
      setLogoPreview(null)
    }
  }, [open, client])

  const handleSubmit = async () => {
    if (!formData.nom) {
      toast.error("Le nom est obligatoire")
      return
    }

    setLoading(true)
    try {
      const data = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'logo') {
          if (value) data.append(key, value as File)
        } else if (value !== null && value !== undefined) {
          data.append(key, value.toString())
        }
      })

      if (isEdit) {
        await updateClient(client.id, data)
        toast.success("Client mis à jour")
      } else {
        await createClient(data)
        toast.success("Client créé")
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
               <User className="h-7 w-7 text-primary" />
            </div>
            {isEdit ? "Modifier Profil Client" : "Nouveau Partenaire Client"}
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium text-base">
            Gérez les informations d'identité, de contact et de solvabilité du client.
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
                    {(formData.nom?.[0] || "") + (formData.prenom?.[0] || "") || "CL"}
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
              <p className="text-sm font-bold text-neutral-900">Logo ou Photo de Profil</p>
              <p className="text-[11px] text-slate-500 font-medium max-w-xs">Formats recommandés: PNG ou JPG.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-bold text-slate-500 uppercase text-[10px] tracking-widest ml-1">Type de compte</Label>
              <div className="flex bg-slate-100 p-1 rounded-2xl h-12">
                <Button 
                  type="button"
                  variant={formData.type_client === "particulier" ? "default" : "ghost"} 
                  className={`flex-1 rounded-xl h-full font-bold text-xs gap-2 ${formData.type_client === 'particulier' ? 'shadow-lg' : 'text-slate-500'}`}
                  onClick={() => setFormData({...formData, type_client: "particulier"})}
                >
                  <User size={14} /> Particulier
                </Button>
                <Button 
                  type="button"
                  variant={formData.type_client === "entreprise" ? "default" : "ghost"} 
                  className={`flex-1 rounded-xl h-full font-bold text-xs gap-2 ${formData.type_client === 'entreprise' ? 'shadow-lg' : 'text-slate-500'}`}
                  onClick={() => setFormData({...formData, type_client: "entreprise"})}
                >
                  <Building2 size={14} /> Entreprise
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-500 uppercase text-[10px] tracking-widest ml-1">Statut Partenaire</Label>
              <div className="flex bg-slate-100 p-1 rounded-2xl h-12">
                <Button 
                  type="button"
                  variant={formData.actif ? "default" : "ghost"} 
                  className={`flex-1 rounded-xl h-full font-bold text-xs gap-2 ${formData.actif ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 shadow-lg' : 'text-slate-500'}`}
                  onClick={() => setFormData({...formData, actif: true})}
                >
                  Actif
                </Button>
                <Button 
                  type="button"
                  variant={!formData.actif ? "default" : "ghost"} 
                  className={`flex-1 rounded-xl h-full font-bold text-xs gap-2 ${!formData.actif ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200 shadow-lg' : 'text-slate-500'}`}
                  onClick={() => setFormData({...formData, actif: false})}
                >
                  Inactif
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prenom" className="font-bold ml-1">Prénom</Label>
              <Input 
                id="prenom"
                value={formData.prenom}
                onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                placeholder="Ex: Ahmed"
                className="h-12 rounded-2xl border-slate-200 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nom" className="font-bold ml-1">{formData.type_client === 'entreprise' ? 'Raison Sociale' : 'Nom'}</Label>
              <Input 
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                placeholder="Ex: El Amrani"
                className="h-12 rounded-2xl border-slate-200 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold ml-1 flex items-center gap-2"><Mail size={14} /> Email</Label>
              <Input 
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="contact@client.com"
                className="h-12 rounded-2xl border-slate-200 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone" className="font-bold ml-1 flex items-center gap-2"><Phone size={14} /> Téléphone</Label>
              <Input 
                id="telephone"
                value={formData.telephone}
                onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                placeholder="+212 6..."
                className="h-12 rounded-2xl border-slate-200 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ville" className="font-bold ml-1 flex items-center gap-2"><MapPin size={14} /> Ville</Label>
              <Input 
                id="ville"
                value={formData.ville}
                onChange={(e) => setFormData({...formData, ville: e.target.value})}
                placeholder="Ex: Casablanca"
                className="h-12 rounded-2xl border-slate-200 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="credit" className="font-bold ml-1 flex items-center gap-2 text-primary"><Banknote size={14} /> Plafond de Crédit</Label>
              <div className="relative">
                <Input 
                  id="credit"
                  type="number"
                  value={formData.plafond_credit}
                  onChange={(e) => setFormData({...formData, plafond_credit: parseFloat(e.target.value) || 0})}
                  className="h-12 rounded-2xl border-primary/20 shadow-sm pr-12 font-bold"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">MAD</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 pt-4 bg-slate-50/50">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl h-12 px-6 font-bold">Annuler</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="px-10 h-12 rounded-2xl bg-primary shadow-xl shadow-primary/20 hover:scale-105 transition-all font-black"
          >
            {loading ? "Traitement..." : isEdit ? "Enregistrer" : "Créer le Client"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
