"use client"

import { useEffect, useState, useMemo } from "react"
import { fetchProduits, api, regenerateQr } from "@/lib/api"
import { toast } from "sonner"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Filter, 
  Pencil, 
  Trash2, 
  Eye,
  FileDown,
  LayoutGrid,
  List,
  Package,
  QrCode,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Banknote,
  MoreVertical,
  ChevronRight,
  Download
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { PageHeader } from "@/components/PageHeader"

export default function ProduitsPage() {
  const [produits, setProduits] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [projets, setProjets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedProduit, setSelectedProduit] = useState<any>(null)
  const [newProduit, setNewProduit] = useState({
    nom: "",
    code: "",
    code_barre: "",
    categorie: "",
    projet: "",
    prix_vente: 0,
    stock_actuel: 0,
    stock_minimum: 10
  })

  useEffect(() => {
    loadProduits()
    api.get('categories/').then(res => setCategories(res.data))
    api.get('projets/').then(res => setProjets(res.data))
  }, [])

  const loadProduits = () => {
    setLoading(true)
    fetchProduits().then(data => {
      const items = Array.isArray(data) ? data : (data?.results || [])
      setProduits(items)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  const filteredProduits = useMemo(() => {
    return produits.filter(p => 
      p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.code_barre && p.code_barre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.categorie_nom && p.categorie_nom.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [produits, searchTerm])

  const stats = useMemo(() => {
    const total = produits.length
    const lowStock = produits.filter(p => p.stock_actuel <= p.stock_minimum).length
    const totalValue = produits.reduce((acc, p) => acc + (parseFloat(p.prix_vente) * p.stock_actuel), 0)
    return { total, lowStock, totalValue }
  }, [produits])

  const handleDelete = async (id: number, nom?: string) => {
    try {
      await api.delete(`produits/${id}/`)
      setProduits(prev => prev.filter(p => p.id !== id))
      toast.success("Produit supprimé", {
        description: nom ? `« ${nom} » a été retiré du catalogue.` : "L'article a été supprimé."
      })
    } catch (error) {
      toast.error("Erreur de suppression", {
        description: "Impossible de supprimer ce produit."
      })
    }
  }

  const handleRegenerateQr = async (id: number) => {
    try {
      const res = await regenerateQr(id)
      if (res.success) {
        setProduits(prev => prev.map(p => p.id === id ? res.produit : p))
        toast.success("QR Code régénéré", {
          description: `Nouveau code généré pour ${res.produit.nom}`
        })
      }
    } catch (error) {
      toast.error("Erreur lors de la régénération")
    }
  }

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleAddSubmit = async () => {
    const nomProduit = newProduit.nom
    try {
      const payload = new FormData()
      Object.keys(newProduit).forEach(key => {
        let value = (newProduit as any)[key]
        if (key === 'categorie' && value === "") value = null
        if (key === 'projet' && value === "") value = null
        if (value !== null && value !== undefined) {
          payload.append(key, value.toString())
        }
      })
      if (imageFile) {
        payload.append('image', imageFile)
      }

      const response = await api.post("produits/", payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setProduits(prev => [response.data, ...prev])
      setIsAddDialogOpen(false)
      setNewProduit({ nom: "", code: "", code_barre: "", categorie: "", projet: "", prix_vente: 0, stock_actuel: 0, stock_minimum: 10 })
      setImageFile(null)
      setImagePreview(null)
      toast.success("Produit ajouté avec succès ✔️", {
        description: `« ${nomProduit} » a été ajouté au catalogue.`,
      })
    } catch (error) {
      toast.error("Erreur lors de l'ajout", {
        description: "Vérifiez les champs et réessayez."
      })
    }
  }

  const headerActions = (
    <>
      <Button variant="outline" size="sm" className="rounded-xl border-slate-200 hover:bg-slate-50 transition-all font-bold gap-1.5 text-xs h-9" onClick={() => {}}>
        <FileDown className="h-3.5 w-3.5 text-slate-500" /> Exporter
      </Button>
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger render={<Button size="sm" className="rounded-xl shadow-sm gap-1.5 font-bold px-3.5 bg-black text-white hover:bg-slate-800 transition-all text-xs h-9" />}>
          <Plus className="h-3.5 w-3.5" /> Nouveau Produit
        </DialogTrigger>
        <DialogContent className="sm:max-w-[550px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Ajouter un Produit</DialogTitle>
            <DialogDescription className="text-base">
              Configurez les détails techniques et commerciaux de votre nouvel article.
            </DialogDescription>
          </DialogHeader>
          <Separator className="my-2" />
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-semibold">Photo</Label>
              <div className="col-span-3 flex items-center gap-4">
                <div className="relative size-16 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden bg-slate-50 group hover:border-primary/50 transition-colors cursor-pointer">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
                  ) : (
                    <Package className="size-6 text-slate-300 group-hover:text-primary transition-colors" />
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setImageFile(file)
                        setImagePreview(URL.createObjectURL(file))
                      }
                    }}
                  />
                </div>
                {imageFile ? (
                  <Button variant="ghost" size="sm" onClick={() => { setImageFile(null); setImagePreview(null); }} className="text-rose-500">Retirer</Button>
                ) : (
                  <span className="text-xs text-slate-400">Cliquez pour ajouter une image (optionnel)</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right font-semibold">Désignation</Label>
              <Input id="name" className="col-span-3 h-11" value={newProduit.nom} onChange={(e) => setNewProduit({...newProduit, nom: e.target.value})} placeholder="Nom du produit..." />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right font-semibold">Code SKU</Label>
              <Input id="code" className="col-span-3 h-11 font-mono" value={newProduit.code} onChange={(e) => setNewProduit({...newProduit, code: e.target.value})} placeholder="EX: PRD-001" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Catégorie</Label>
                      <select 
                        className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newProduit.categorie}
                        onChange={(e) => setNewProduit({...newProduit, categorie: e.target.value})}
                      >
                        <option value="">Sélectionner</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Projet / Dépôt</Label>
                      <select 
                        className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newProduit.projet}
                        onChange={(e) => setNewProduit({...newProduit, projet: e.target.value})}
                      >
                        <option value="">Sélectionner</option>
                        {projets.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                      </select>
                    </div>
                  </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="barcode" className="text-right font-semibold">Code Barre</Label>
              <div className="col-span-3 flex gap-2">
                <Input id="barcode" className="flex-1 h-11 font-mono" value={newProduit.code_barre || ""} onChange={(e) => setNewProduit({...newProduit, code_barre: e.target.value})} placeholder="EX: 6111234567890" />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  className="h-11 w-11 rounded-xl"
                  onClick={() => {
                    const randomBarcode = Math.floor(Math.random() * 9000000000000 + 1000000000000).toString();
                    setNewProduit({...newProduit, code_barre: randomBarcode});
                  }}
                  title="Générer un code barre aléatoire"
                >
                  <RefreshCw size={18} />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="flex flex-col gap-2 pl-24">
                 <Label htmlFor="price" className="font-semibold">Prix Vente</Label>
                 <Input id="price" type="number" className="h-11" value={isNaN(newProduit.prix_vente) ? "" : newProduit.prix_vente} onChange={(e) => setNewProduit({...newProduit, prix_vente: parseFloat(e.target.value)})} />
               </div>
               <div className="flex flex-col gap-2">
                 <Label htmlFor="stock" className="font-semibold">Stock Initial</Label>
                 <Input id="stock" type="number" className="h-11" value={isNaN(newProduit.stock_actuel) ? "" : newProduit.stock_actuel} onChange={(e) => setNewProduit({...newProduit, stock_actuel: parseInt(e.target.value)})} />
               </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
            <Button type="button" onClick={handleAddSubmit} className="px-8 rounded-xl shadow-md">Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )

  return (
    <div className="flex flex-col gap-8 w-full">
      <PageHeader 
        title="Catalogue Produits" 
        description="Gérez votre inventaire avec une interface intelligente et intuitive."
        actions={headerActions}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border border-slate-200/80 shadow-sm bg-white rounded-3xl relative overflow-hidden group transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 group-hover:scale-105 transition-transform size-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
             <Package size={36} />
          </div>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-2">
              <TrendingUp size={14} /> Total Produits
            </div>
            <div className="text-4xl font-black text-slate-900">{stats.total}</div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Articles enregistrés en stock</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-sm bg-white rounded-3xl relative overflow-hidden group transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 group-hover:scale-105 transition-transform size-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
             <AlertCircle size={36} />
          </div>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-rose-500 font-bold uppercase text-[10px] tracking-widest mb-2">
              <AlertCircle size={14} /> Stock Faible
            </div>
            <div className="text-4xl font-black text-rose-600">{stats.lowStock}</div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Nécessitent un réapprovisionnement</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-sm bg-white rounded-3xl relative overflow-hidden group transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 group-hover:scale-105 transition-transform size-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
             <Banknote size={36} />
          </div>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-2">
              <Banknote size={14} /> Valeur Stock
            </div>
            <div className="text-3xl font-black text-slate-900 leading-tight">
               {stats.totalValue.toLocaleString('fr-FR', { style: 'currency', currency: 'MAD' })}
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Évaluation totale basée sur PV</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <Card className="border border-slate-100/80 shadow-xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/30">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input
                type="search"
                placeholder="Rechercher par nom, SKU, catégorie..."
                className="pl-11 h-12 bg-white border-slate-200 rounded-2xl focus-visible:ring-primary shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 p-1 rounded-xl flex items-center h-12">
                <Button 
                  variant={viewMode === "list" ? "secondary" : "ghost"} 
                  size="icon" 
                  className={`rounded-lg h-10 w-10 transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-5 w-5" />
                </Button>
                <Button 
                  variant={viewMode === "grid" ? "secondary" : "ghost"} 
                  size="icon" 
                  className={`rounded-lg h-10 w-10 transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
             <div className="py-32 flex flex-col items-center justify-center gap-4">
                <div className="relative">
                   <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-100 border-t-primary" />
                   <RefreshCw className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" size={24} />
                </div>
                <p className="text-slate-500 font-medium animate-pulse">Synchronisation du catalogue...</p>
             </div>
          ) : viewMode === "list" ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-b border-slate-100 h-14">
                    <TableHead className="pl-8 font-bold text-slate-900">Produit</TableHead>
                    <TableHead className="font-bold text-slate-900">Référence</TableHead>
                    <TableHead className="font-bold py-5">Projet</TableHead>
                    <TableHead className="font-bold text-slate-900">Catégorie</TableHead>
                    <TableHead className="text-center font-bold text-slate-900">Niveau Stock</TableHead>
                    <TableHead className="text-right font-bold text-slate-900">Prix Unitaire</TableHead>
                    <TableHead className="text-center font-bold text-slate-900">QR Code</TableHead>
                    <TableHead className="text-right pr-8 font-bold text-slate-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProduits.length === 0 ? (
                    <TableRow>
                       <TableCell colSpan={8} className="h-64 text-center">
                          <div className="flex flex-col items-center gap-3 text-slate-400">
                             <Package size={48} className="opacity-20" />
                             <p>Aucun produit trouvé</p>
                          </div>
                       </TableCell>
                    </TableRow>
                  ) : (
                    filteredProduits.map((p: any) => (
                      <TableRow key={p.id} className="group hover:bg-slate-50/80 transition-all border-b border-slate-50">
                        <TableCell className="pl-8 py-4">
                          <div className="flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shadow-inner">
                              {p.image ? (
                                <img src={p.image} alt={p.nom} className="object-cover size-full" />
                              ) : (
                                <Package className="text-slate-300" size={24} />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 text-base">{p.nom}</span>
                              <span className="text-xs text-slate-400">{p.fournisseur_nom || "Vendeur Direct"}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline" className="font-mono bg-slate-50 text-slate-700 border-slate-200/80 px-2 py-0.5 w-fit rounded-lg font-semibold">
                              {p.code}
                            </Badge>
                            {p.code_barre && (
                              <span className="text-[10px] text-slate-400 font-mono ml-1">
                                {p.code_barre}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                           <span className="text-sm font-medium text-slate-600">
                             {p.projet_nom || "Standard"}
                           </span>
                        </TableCell>
                        <TableCell>
                           <Badge variant="outline" className={`border-none rounded-lg font-bold text-xs px-2.5 py-0.5 transition-all ${
                             (p.categorie_nom || "").toLowerCase().includes("accessoire") ? "bg-blue-50 text-blue-700" :
                             (p.categorie_nom || "").toLowerCase().includes("électro") ? "bg-brand-cyan/10 text-brand-cyan" :
                             "bg-slate-100 text-slate-700"
                           }`}>
                             {p.categorie_nom || "Divers"}
                           </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                           <div className="flex flex-col items-center gap-1 mx-auto w-fit">
                              <span className={`text-base font-black ${p.stock_actuel <= p.stock_minimum ? 'text-rose-600' : 'text-slate-700'}`}>
                                {p.stock_actuel} <span className="text-[10px] font-normal text-slate-400 ml-0.5">{p.unite || 'pcs'}</span>
                              </span>
                              <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                                 <div 
                                   className={`h-full transition-all duration-500 ${p.stock_actuel <= p.stock_minimum ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                                   style={{ width: `${Math.min((p.stock_actuel/p.stock_maximum)*100, 100)}%` }}
                                 />
                              </div>
                           </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-slate-700">
                          {parseFloat(p.prix_vente).toLocaleString('fr-FR', { style: 'currency', currency: 'MAD' })}
                        </TableCell>
                        <TableCell className="text-center">
                          {p.qr_code ? (
                            <Dialog>
                              <DialogTrigger nativeButton={false} render={<div className="size-10 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm cursor-pointer hover:bg-slate-50 hover:shadow-md transition-all group/qr" />}>
                                   <img src={p.qr_code} alt="QR" className="size-8 rounded group-hover/qr:scale-110 transition-transform" />
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[350px] rounded-3xl p-6">
                                <DialogHeader>
                                  <DialogTitle className="text-center text-xl font-bold">Code QR du Produit</DialogTitle>
                                  <DialogDescription className="text-center flex flex-col gap-1">
                                    <span className="font-medium text-slate-900">{p.nom}</span>
                                    {p.code_barre && <span className="text-xs font-mono text-slate-400">Barcode: {p.code_barre}</span>}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex flex-col items-center gap-6 py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                  <img src={p.qr_code} alt="QR Large" className="size-48 bg-white border rounded-2xl p-4 shadow-xl" />
                                  <div className="flex gap-2">
                                     <Button variant="default" size="sm" onClick={() => window.open(p.qr_code, '_blank')} className="gap-2 rounded-xl">
                                       <Download className="size-4" /> PNG
                                     </Button>
                                     <Button variant="outline" size="sm" onClick={() => handleRegenerateQr(p.id)} className="gap-2 rounded-xl">
                                       <RefreshCw className="size-4" /> Régénérer
                                     </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <Button variant="ghost" size="icon" onClick={() => handleRegenerateQr(p.id)} className="text-slate-300">
                               <QrCode size={20} />
                            </Button>
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-8">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary">
                                <MoreVertical className="h-5 w-5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52 p-2 rounded-2xl shadow-xl border-slate-100">
                              <DropdownMenuGroup>
                                <DropdownMenuLabel className="text-xs uppercase text-slate-400 font-bold tracking-widest px-2 py-1">Gestion</DropdownMenuLabel>
                                <DropdownMenuItem className="rounded-xl cursor-pointer py-2.5" render={<Link href={`/produits/${p.id}`} />}>
                                  <Eye className="mr-3 h-4 w-4 text-slate-500" /> Fiche Détaillée
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl cursor-pointer py-2.5" render={<Link href={`/produits/${p.id}/edit`} />}>
                                  <Pencil className="mr-3 h-4 w-4 text-slate-500" /> Modifier Produit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl cursor-pointer py-2.5" onClick={() => handleRegenerateQr(p.id)}>
                                  <RefreshCw className="mr-3 h-4 w-4 text-blue-500" /> Régénérer Code QR
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                              <DropdownMenuSeparator className="my-2" />
                              <AlertDialog>
                                <AlertDialogTrigger nativeButton={false} render={<div className="flex items-center px-2 py-2.5 text-sm text-rose-600 cursor-pointer hover:bg-rose-50 rounded-xl transition-colors" />}>
                                    <Trash2 className="mr-3 h-4 w-4" /> Supprimer du Stock
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-3xl">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-xl font-bold">Suppression Irréversible</AlertDialogTitle>
                                    <AlertDialogDescription className="text-base">
                                      Vous allez retirer <span className="font-black text-slate-900 underline decoration-rose-500">{p.nom}</span> du catalogue. Cette action ne peut pas être annulée.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="mt-4">
                                    <AlertDialogCancel className="rounded-xl">Conserver</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(p.id)} className="bg-rose-600 hover:bg-rose-700 rounded-xl">
                                      Confirmer la Suppression
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            /* Grid View Implementation */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-8 bg-slate-50/50">
               {filteredProduits.length === 0 ? (
                  <div className="col-span-full py-20 text-center text-slate-400">
                     <Package size={48} className="mx-auto mb-4 opacity-10" />
                     <p>Aucun produit dans cette sélection</p>
                  </div>
               ) : (
                 filteredProduits.map((p: any) => (
                   <Card key={p.id} className="border-none shadow-sm hover:shadow-xl transition-all duration-300 group rounded-3xl overflow-hidden bg-white border border-slate-100">
                      <div className="relative aspect-square bg-slate-100 overflow-hidden">
                         {p.image ? (
                            <img src={p.image} alt={p.nom} className="object-cover size-full group-hover:scale-110 transition-transform duration-500" />
                         ) : (
                            <div className="size-full flex items-center justify-center text-slate-200">
                               <Package size={64} />
                            </div>
                         )}
                         <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="secondary" className="rounded-xl shadow-lg bg-white/90 backdrop-blur" onClick={() => handleRegenerateQr(p.id)}>
                               <RefreshCw size={18} />
                            </Button>
                         </div>
                         <div className="absolute bottom-3 left-3">
                            <Badge className={`${p.stock_actuel <= p.stock_minimum ? 'bg-rose-500' : 'bg-emerald-500'} border-none shadow-lg px-3 py-1 rounded-full`}>
                               {p.stock_actuel} en stock
                            </Badge>
                         </div>
                      </div>
                      <CardContent className="p-5">
                         <div className="flex justify-between items-start mb-2">
                            <div className="flex flex-col">
                               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{p.categorie_nom || "GENERAL"}</span>
                               <h3 className="font-black text-slate-800 text-lg line-clamp-1">{p.nom}</h3>
                            </div>
                            <div className="text-right">
                               <span className="text-primary font-black text-lg">
                                  {Math.round(parseFloat(p.prix_vente))} <span className="text-[10px]">MAD</span>
                               </span>
                            </div>
                         </div>
                         <div className="flex items-center justify-between mt-4">
                            <code className="text-[10px] bg-slate-50 px-2 py-1 rounded-lg text-slate-500 font-mono">{p.code}</code>
                            <div className="flex gap-1">
                               <Button size="icon" variant="ghost" className="rounded-full h-8 w-8 hover:bg-slate-100">
                                  <Eye size={16} className="text-slate-400" />
                               </Button>
                               <Button size="icon" variant="ghost" className="rounded-full h-8 w-8 hover:bg-rose-50 group-hover:text-rose-500">
                                  <Trash2 size={16} className="text-slate-400 group-hover:text-rose-500" />
                               </Button>
                            </div>
                         </div>
                      </CardContent>
                   </Card>
                 ))
               )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Bottom Action Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-6 border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-700">
         <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sélection Totale</span>
            <span className="text-white font-bold">{filteredProduits.length} Produits</span>
         </div>
         <div className="h-8 w-px bg-white/10" />
         <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 gap-2">
               <RefreshCw size={14} /> Rafraîchir
            </Button>
            <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-xl gap-2">
               <Plus size={16} /> Ajouter Rapide
            </Button>
         </div>
      </div>
    </div>
  )
}
