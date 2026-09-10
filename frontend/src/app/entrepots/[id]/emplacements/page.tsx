"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { fetchEntrepots, fetchEmplacements, createEmplacement, updateEmplacement, deleteEmplacement } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Warehouse, MapPin, Plus, Edit, Trash2, ArrowLeft, Grid3X3, Package } from "lucide-react"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"

export default function EmplacementsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const entrepotId = parseInt(id)

  const [entrepot, setEntrepot] = useState<any>(null)
  const [emplacements, setEmplacements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [formData, setFormData] = useState({ code: "", description: "" })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadAll()
  }, [entrepotId])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [entrepots, emps] = await Promise.all([
        fetchEntrepots(),
        fetchEmplacements(entrepotId),
      ])
      const allEntrepots = Array.isArray(entrepots) ? entrepots : entrepots.results || []
      setEntrepot(allEntrepots.find((e: any) => e.id === entrepotId) || null)
      setEmplacements(Array.isArray(emps) ? emps : emps.results || [])
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setSelected(null)
    setFormData({ code: "", description: "" })
    setDialogOpen(true)
  }

  const openEdit = (emp: any) => {
    setSelected(emp)
    setFormData({ code: emp.code, description: emp.description || "" })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.code.trim()) { toast.error("Le code est obligatoire"); return }
    setSaving(true)
    try {
      const payload = { ...formData, entrepot: entrepotId }
      if (selected) {
        await updateEmplacement(selected.id, payload)
        toast.success("Emplacement mis à jour")
      } else {
        await createEmplacement(payload)
        toast.success("Emplacement créé")
      }
      setDialogOpen(false)
      loadAll()
    } catch {
      // handled by interceptor
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteEmplacement(id)
      setEmplacements(prev => prev.filter(e => e.id !== id))
      toast.success("Emplacement supprimé")
    } catch {
      toast.error("Erreur lors de la suppression")
    }
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <button
            onClick={() => router.push("/entrepots")}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" /> Retour aux entrepôts
          </button>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-2xl"><Grid3X3 className="h-8 w-8 text-blue-600" /></div>
            Emplacements
          </h2>
          {entrepot && (
            <p className="text-muted-foreground text-lg flex items-center gap-2">
              <Warehouse className="h-4 w-4" /> {entrepot.nom} — {entrepot.ville}
            </p>
          )}
        </div>
        <Button size="lg" className="rounded-xl shadow-lg shadow-primary/20 gap-2" onClick={openCreate}>
          <Plus className="h-5 w-5" /> Nouvel Emplacement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-3xl">
          <CardContent className="pt-6">
            <p className="text-blue-100 text-sm font-medium">Total Emplacements</p>
            <p className="text-5xl font-black mt-2">{emplacements.length}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white rounded-3xl">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm font-medium">Entrepôt</p>
            <p className="text-2xl font-black text-slate-800 mt-2">{entrepot?.nom || "—"}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white rounded-3xl">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm font-medium">Ville</p>
            <p className="text-2xl font-black text-slate-800 mt-2">{entrepot?.ville || "—"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-36 bg-slate-100 rounded-3xl animate-pulse" />)}
        </div>
      ) : emplacements.length === 0 ? (
        <Card className="border-none shadow-xl rounded-3xl p-20 flex flex-col items-center justify-center text-center bg-white">
          <div className="size-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <Grid3X3 size={48} className="text-slate-200" />
          </div>
          <h3 className="text-2xl font-black text-slate-800">Aucun emplacement</h3>
          <p className="text-slate-500 mt-2 max-w-xs">Créez des emplacements pour organiser votre entrepôt.</p>
          <Button className="mt-8 rounded-xl px-8" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Créer un emplacement
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {emplacements.map((emp: any) => (
            <Card key={emp.id} className="border-none shadow-md hover:shadow-xl transition-all duration-300 rounded-3xl bg-white overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-brand-cyan/10 rounded-2xl">
                    <MapPin className="h-6 w-6 text-brand-cyan" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl" onClick={() => openEdit(emp)}>
                      <Edit className="h-4 w-4 text-slate-500" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger nativeButton={false} render={
                        <div className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-rose-50 cursor-pointer transition-colors" />
                      }>
                        <Trash2 className="h-4 w-4 text-rose-500" />
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-3xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer l'emplacement ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            L'emplacement <strong>{emp.code}</strong> sera supprimé définitivement.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(emp.id)} className="bg-rose-600 hover:bg-rose-700 rounded-xl">
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <Badge variant="outline" className="font-mono font-black text-lg px-3 py-1 rounded-xl border-brand-cyan/20 text-brand-cyan bg-brand-cyan/10">
                  {emp.code}
                </Badge>
                {emp.description && (
                  <p className="text-sm text-slate-500 mt-3 line-clamp-2">{emp.description}</p>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 w-full rounded-xl text-xs text-slate-500 hover:text-primary hover:bg-primary/5"
                  onClick={() => router.push(`/entrepots/${entrepotId}/inventaire?emplacement=${emp.id}`)}
                >
                  <Package className="h-3.5 w-3.5 mr-1.5" /> Voir le stock
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-3xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <Grid3X3 className="h-5 w-5 text-primary" />
              {selected ? "Modifier l'emplacement" : "Nouvel emplacement"}
            </DialogTitle>
            <DialogDescription>
              Définissez un code unique pour identifier cet emplacement dans l'entrepôt.
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <div className="p-6 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="code" className="font-bold">Code <span className="text-rose-500">*</span></Label>
              <Input
                id="code"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                placeholder="Ex: A1, ZONE-B-12, RACK-C3"
                className="h-11 rounded-xl border-slate-200"
              />
              <p className="text-xs text-slate-400">Code court et unique identifiant l'emplacement physique.</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc" className="font-bold">Description</Label>
              <Input
                id="desc"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Allée centrale, rayonnage haut"
                className="h-11 rounded-xl border-slate-200"
              />
            </div>
          </div>
          <DialogFooter className="p-6 pt-0">
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="rounded-xl">Annuler</Button>
            <Button onClick={handleSave} disabled={saving} className="px-8 rounded-xl">
              {saving ? "Sauvegarde..." : selected ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
