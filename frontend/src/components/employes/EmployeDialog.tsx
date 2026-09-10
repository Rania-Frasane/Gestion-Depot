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
  User as UserIcon,
  Briefcase,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Banknote,
  ShieldCheck,
  UserCheck,
  Camera,
  Image as ImageIcon,
  Check
} from "lucide-react"
import { createEmploye, updateEmploye, api } from "@/lib/api"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface EmployeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employe?: any
  onSuccess: () => void
}

export function EmployeDialog({ open, onOpenChange, employe, onSuccess }: EmployeDialogProps) {
  const isEdit = !!employe
  const [loading, setLoading] = useState(false)
  const [postes, setPostes] = useState<any[]>([])
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    matricule: "",
    poste: "",
    email: "",
    telephone: "",
    date_embauche: new Date().toISOString().split('T')[0],
    salaire: 0,
    actif: true,
    avatar_type: "default",
    photo: null as File | null
  })

  useEffect(() => {
    if (open) {
      api.get('postes/').then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data.results || []
        setPostes(data)
      }).catch(() => { })
      if (employe) {
        setFormData({
          nom: employe.nom || "",
          prenom: employe.prenom || "",
          matricule: employe.matricule || "",
          poste: employe.poste?.toString() || "",
          email: employe.email || "",
          telephone: employe.telephone || "",
          date_embauche: employe.date_embauche || new Date().toISOString().split('T')[0],
          salaire: parseFloat(employe.salaire) || 0,
          actif: employe.actif ?? true,
          avatar_type: employe.avatar_type || "default",
          photo: null
        })
        setPhotoPreview(getPhotoUrl(employe.photo) || null)
      } else {
        setFormData({
          nom: "",
          prenom: "",
          matricule: "",
          poste: "",
          email: "",
          telephone: "",
          date_embauche: new Date().toISOString().split('T')[0],
          salaire: 0,
          actif: true,
          avatar_type: "default",
          photo: null
        })
        setPhotoPreview(null)
      }
    }
  }, [open, employe])

  const getPhotoUrl = (url: string | null) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `http://localhost:8000${url}`
  }

  const handleSubmit = async () => {
    if (!formData.nom || !formData.prenom) {
      toast.error("Le nom et le prénom sont obligatoires")
      return
    }

    setLoading(true)
    try {
      const data = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'photo') {
          if (value) data.append(key, value as File)
        } else if (key === 'poste' && value === "") {
          // Skip empty foreign keys
        } else if (value !== null && value !== undefined) {
          data.append(key, value.toString())
        }
      })

      if (isEdit) {
        await updateEmploye(employe.id, data)
        toast.success("Profil employé mis à jour ✔️", {
          description: `Les informations de ${formData.prenom} ${formData.nom} ont été enregistrées.`
        })
      } else {
        await createEmploye(data)
        toast.success("Nouvel employé enregistré ✔️", {
          description: `${formData.prenom} ${formData.nom} a été intégré(e) avec succès.`
        })
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
      <DialogContent className="sm:max-w-[650px] rounded-[2.5rem] p-0 overflow-hidden shadow-2xl border-none">
        <DialogHeader className="p-8 pb-4 bg-slate-50/50">
          <DialogTitle className="text-3xl font-black flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-primary/10 rounded-xl">
              <UserCheck className="h-7 w-7 text-primary" />
            </div>
            {isEdit ? "Editer Profil RH" : "Intégration Nouvel Employé"}
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium text-base">
            Gérez les informations administratives et contractuelles du collaborateur.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
          {/* Photo Section */}
          <div className="flex flex-col items-center gap-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
            <div className="relative group">
              <Avatar className="size-32 border-4 border-white shadow-2xl bg-neutral-900 text-white flex items-center justify-center">
                {photoPreview ? (
                  <AvatarImage src={photoPreview} className="object-cover animate-fade-in" />
                ) : (
                  <div className="size-full bg-gradient-to-br from-neutral-800 to-neutral-950 flex items-center justify-center text-4xl font-extrabold tracking-tight text-white uppercase">
                    {(formData.prenom[0] || "") + (formData.nom[0] || "") || "EMP"}
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
                      setFormData({ ...formData, photo: file })
                      setPhotoPreview(URL.createObjectURL(file))
                    }
                  }}
                />
              </label>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-neutral-900">Photo d'identité réelle</p>
              <p className="text-[11px] text-slate-500 font-medium max-w-xs">Formats recommandés: PNG ou JPG. La photo sera utilisée pour son badge officiel.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="matricule" className="font-bold ml-1 text-slate-500 uppercase text-[10px] tracking-widest">Matricule Interne</Label>
              <Input
                id="matricule"
                value={formData.matricule}
                readOnly
                className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-mono text-primary font-bold"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold ml-1 text-slate-500 uppercase text-[10px] tracking-widest">Statut Contrat</Label>
              <div className="flex bg-slate-100 p-1 rounded-2xl h-12">
                <Button
                  type="button"
                  variant={formData.actif ? "default" : "ghost"}
                  className={`flex-1 rounded-xl h-full font-bold text-xs gap-2 ${formData.actif ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 shadow-lg text-white' : 'text-slate-500'}`}
                  onClick={() => setFormData({ ...formData, actif: true })}
                >
                  Actif
                </Button>
                <Button
                  type="button"
                  variant={!formData.actif ? "default" : "ghost"}
                  className={`flex-1 rounded-xl h-full font-bold text-xs gap-2 ${!formData.actif ? 'bg-slate-500 hover:bg-slate-600 shadow-slate-200 shadow-lg' : 'text-slate-500'}`}
                  onClick={() => setFormData({ ...formData, actif: false })}
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
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                placeholder="Ex: Yassine"
                className="h-12 rounded-2xl border-slate-200 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nom" className="font-bold ml-1">Nom de famille</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Ex: Mansouri"
                className="h-12 rounded-2xl border-slate-200 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="poste" className="font-bold ml-1 flex items-center gap-2"><Briefcase size={14} /> Poste / Fonction</Label>
              <select
                className="flex h-12 w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.poste}
                onChange={(e) => setFormData({ ...formData, poste: e.target.value })}
              >
                <option value="">Sélectionner un poste</option>
                {postes.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salaire" className="font-bold ml-1 flex items-center gap-2 text-emerald-600"><Banknote size={14} /> Salaire Brut (MAD)</Label>
              <Input
                id="salaire"
                type="number"
                value={formData.salaire}
                onChange={(e) => setFormData({ ...formData, salaire: parseFloat(e.target.value) || 0 })}
                className="h-12 rounded-2xl border-emerald-100 shadow-sm font-bold"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold ml-1 flex items-center gap-2"><Mail size={14} /> Email Professionnel</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="y.mansouri@depot.com"
                className="h-12 rounded-2xl border-slate-200 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone" className="font-bold ml-1 flex items-center gap-2"><Phone size={14} /> Mobile</Label>
              <Input
                id="telephone"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                placeholder="+212 6..."
                className="h-12 rounded-2xl border-slate-200 shadow-sm"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="date" className="font-bold ml-1 flex items-center gap-2"><Calendar size={14} /> Date d'entrée en fonction</Label>
              <Input
                id="date"
                type="date"
                value={formData.date_embauche}
                onChange={(e) => setFormData({ ...formData, date_embauche: e.target.value })}
                className="h-12 rounded-2xl border-slate-200 shadow-sm"
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
            {loading ? "Traitement..." : isEdit ? "Sauvegarder" : "Confirmer Embauche"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
