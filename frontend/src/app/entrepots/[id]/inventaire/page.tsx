"use client"

import { useEffect, useState, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { fetchEntrepots, fetchEmplacements, fetchStocksEmplacement, fetchProduits, createStockEmplacement, updateStockEmplacement, deleteStockEmplacement } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Warehouse, Package, Plus, Edit, Trash2, ArrowLeft, Search, TrendingUp, AlertCircle, Filter } from "lucide-react"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"

export default function InventairePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const entrepotId = parseInt(id)

  const [entrepot, setEntrepot] = useState<any>(null)
  const [emplacements, setEmplacements] = useState<any[]>([])
  const [produits, setProduits] = useState<any[]>([])
  const [stocks, setStocks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterEmp, setFilterEmp] = useState(searchParams.get("emplacement") || "all")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState<any>(null)
  const [formData, setFormData] = useState({ emplacement: "", produit: "", quantite: "" })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadAll() }, [entrepotId])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [allEntrepots, emps, prods, stks] = await Promise.all([
        fetchEntrepots(),
        fetchEmplacements(entrepotId),
        fetchProduits(),
        fetchStocksEmplacement({ entrepot: entrepotId }),
      ])
      const entrepotList = Array.isArray(allEntrepots) ? allEntrepots : allEntrepots.results || []
      setEntrepot(entrepotList.find((e: any) => e.id === entrepotId) || null)
      setEmplacements(Array.isArray(emps) ? emps : emps.results || [])
      setProduits(Array.isArray(prods) ? prods : prods.results || [])
      setStocks(Array.isArray(stks) ? stks : stks.results || [])
    } finally {
      setLoading(false)
    }
  }

  const filteredStocks = stocks.filter(s => {
    const matchSearch = !search ||
      s.produit_nom?.toLowerCase().includes(search.toLowerCase()) ||
      s.emplacement_code?.toLowerCase().includes(search.toLowerCase())
    const matchEmp = filterEmp === "all" || s.emplacement?.toString() === filterEmp
    return matchSearch && matchEmp
  })

  const totalStock = filteredStocks.reduce((sum, s) => sum + (s.quantite || 0), 0)
  const lowStockCount = filteredStocks.filter(s => s.quantite <= 5).length

  const openCreate = () => {
    setSelected(null)
    setFormData({ emplacement: filterEmp !== "all" ? filterEmp : "", produit: "", quantite: "" })
    setDialogOpen(true)
  }

  const openEdit = (s: any) => {
    setSelected(s)
    setFormData({ emplacement: s.emplacement?.toString(), produit: s.produit?.toString(), quantite: s.quantite?.toString() })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.emplacement || !formData.produit || !formData.quantite) {
      toast.error("Tous les champs sont obligatoires"); return
    }
    setSaving(true)
    try {
      const payload = {
        emplacement: parseInt(formData.emplacement),
        produit: parseInt(formData.produit),
        quantite: parseInt(formData.quantite),
      }
      if (selected) {
        await updateStockEmplacement(selected.id, payload)
        toast.success("Stock mis à jour")
      } else {
        await createStockEmplacement(payload)
        toast.success("Stock ajouté")
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
      await deleteStockEmplacement(id)
      setStocks(prev => prev.filter(s => s.id !== id))
      toast.success("Stock supprimé")
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
            <div className="p-3 bg-emerald-50 rounded-2xl"><Package className="h-8 w-8 text-emerald-600" /></div>
            Inventaire
          </h2>
          {entrepot && (
            <p className="text-muted-foreground text-lg flex items-center gap-2">
              <Warehouse className="h-4 w-4" /> {entrepot.nom} — {entrepot.ville}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl gap-2" onClick={() => router.push(`/entrepots/${entrepotId}/emplacements`)}>
            Gérer les emplacements
          </Button>
          <Button size="lg" className="rounded-xl shadow-lg shadow-primary/20 gap-2" onClick={openCreate}>
            <Plus className="h-5 w-5" /> Ajouter un stock
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-md bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-3xl">
          <CardContent className="pt-6">
            <p className="text-emerald-100 text-sm font-medium flex items-center gap-1.5"><TrendingUp className="h-4 w-4" /> Unités totales</p>
            <p className="text-5xl font-black mt-2">{totalStock.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white rounded-3xl">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-sm font-medium">Références stockées</p>
            <p className="text-5xl font-black mt-2 text-slate-800">{filteredStocks.length}</p>
          </CardContent>
        </Card>
        <Card className={`border-none shadow-md rounded-3xl ${lowStockCount > 0 ? 'bg-rose-50' : 'bg-white'}`}>
          <CardContent className="pt-6">
            <p className={`text-sm font-medium flex items-center gap-1.5 ${lowStockCount > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
              <AlertCircle className="h-4 w-4" /> Stock faible (≤5)
            </p>
            <p className={`text-5xl font-black mt-2 ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>{lowStockCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-white/20 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Rechercher par produit ou emplacement..."
            className="pl-11 h-12 bg-white border-slate-200 rounded-2xl shadow-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterEmp} onValueChange={(v) => setFilterEmp(v || "all")}>
          <SelectTrigger className="h-12 w-full md:w-64 rounded-2xl border-slate-200 bg-white">
            <Filter className="h-4 w-4 mr-2 text-slate-400" />
            <SelectValue placeholder="Tous les emplacements" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="all">Tous les emplacements</SelectItem>
            {emplacements.map(e => (
              <SelectItem key={e.id} value={e.id.toString()}>{e.code} — {e.description || "Sans description"}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-md overflow-hidden border border-slate-50">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-bold text-slate-600 pl-6">Produit</TableHead>
                <TableHead className="font-bold text-slate-600">Emplacement</TableHead>
                <TableHead className="font-bold text-slate-600 text-center">Quantité</TableHead>
                <TableHead className="font-bold text-slate-600">Entrepôt</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(5)].map((_, j) => (
                      <TableCell key={j}><div className="h-4 bg-slate-100 rounded animate-pulse" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredStocks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16 text-slate-400">
                    <Package className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                    Aucun stock trouvé. Ajoutez des produits à cet entrepôt.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStocks.map((s: any) => (
                  <TableRow key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="pl-6 font-semibold text-slate-800">{s.produit_nom}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono font-bold bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20">
                        {s.emplacement_code}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={`font-black text-base px-3 py-1 rounded-xl ${
                          s.quantite <= 5
                            ? 'bg-rose-100 text-rose-700'
                            : s.quantite <= 20
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {s.quantite}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">{s.entrepot_nom}</TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl" onClick={() => openEdit(s)}>
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
                              <AlertDialogTitle>Supprimer ce stock ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Le stock de <strong>{s.produit_nom}</strong> dans l'emplacement <strong>{s.emplacement_code}</strong> sera supprimé.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(s.id)} className="bg-rose-600 hover:bg-rose-700 rounded-xl">
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[440px] rounded-3xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              {selected ? "Modifier le stock" : "Ajouter un stock"}
            </DialogTitle>
            <DialogDescription>
              Associez un produit à un emplacement et définissez la quantité.
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <div className="p-6 space-y-4">
            <div className="grid gap-2">
              <Label className="font-bold">Emplacement <span className="text-rose-500">*</span></Label>
              <Select value={formData.emplacement} onValueChange={v => setFormData({ ...formData, emplacement: v || "" })}>
                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                  <SelectValue placeholder="Choisir un emplacement..." />
                </SelectTrigger>
                <SelectContent className="max-h-[250px]">
                  {emplacements.map(e => (
                    <SelectItem key={e.id} value={e.id.toString()}>{e.code} {e.description ? `— ${e.description}` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="font-bold">Produit <span className="text-rose-500">*</span></Label>
              <Select value={formData.produit} onValueChange={v => setFormData({ ...formData, produit: v || "" })}>
                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                  <SelectValue placeholder="Choisir un produit..." />
                </SelectTrigger>
                <SelectContent className="max-h-[250px]">
                  {produits.map((p: any) => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.nom} ({p.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="qty" className="font-bold">Quantité <span className="text-rose-500">*</span></Label>
              <Input
                id="qty"
                type="number"
                min="0"
                value={formData.quantite}
                onChange={e => setFormData({ ...formData, quantite: e.target.value })}
                placeholder="0"
                className="h-11 rounded-xl border-slate-200"
              />
            </div>
          </div>
          <DialogFooter className="p-6 pt-0">
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="rounded-xl">Annuler</Button>
            <Button onClick={handleSave} disabled={saving} className="px-8 rounded-xl">
              {saving ? "Sauvegarde..." : selected ? "Mettre à jour" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
