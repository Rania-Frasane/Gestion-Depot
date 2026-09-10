"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Pencil, 
  Package, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  Tag, 
  BarChart, 
  Clock, 
  History,
  QrCode as QrIcon,
  Download,
  ArrowUp,
  ArrowDown,
  Plus,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import Link from "next/link"
import { toast } from "sonner"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [produit, setProduit] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mouvementForm, setMouvementForm] = useState({
    type_mouvement: 'entree',
    quantite: 1,
    motif: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchProduit = () => {
    if (params.id) {
      api.get(`produits/${params.id}/`).then(res => {
        setProduit(res.data)
        setLoading(false)
      }).catch(err => {
        toast.error("Erreur de chargement", { description: "Le produit est introuvable." })
        router.push("/produits")
      })
    }
  }

  useEffect(() => {
    fetchProduit()
  }, [params.id])

  const handleMouvementSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('scanner/', {
        code: produit.code,
        action: mouvementForm.type_mouvement,
        quantite: mouvementForm.quantite
      })
      toast.success("Mouvement enregistré !")
      fetchProduit()
      // Reset form
      setMouvementForm({ type_mouvement: 'entree', quantite: 1, motif: '' })
    } catch (error: any) {
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegenerateQr = async () => {
    try {
      const res = await api.post(`produits/${produit.id}/regenerate-qr/`)
      if (res.data.success) {
        setProduit(res.data.produit)
        toast.success("Code QR régénéré")
      }
    } catch (error) {
      toast.error("Erreur de régénération")
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="rounded-xl gap-2 text-slate-500">
          <ArrowLeft size={18} /> Retour au catalogue
        </Button>
        <Link href={`/produits/${params.id}/edit`}>
          <Button className="rounded-xl gap-2 shadow-lg">
            <Pencil size={18} /> Modifier le produit
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image & Quick Stats */}
        <div className="space-y-6">
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
            <div className="aspect-square relative bg-slate-50 flex items-center justify-center group">
              {produit.image ? (
                <img src={produit.image} alt={produit.nom} className="object-cover size-full" />
              ) : (
                <Package size={100} className="text-slate-200" />
              )}
              <div className="absolute top-4 right-4">
                <Badge className={produit.actif ? "bg-emerald-500" : "bg-slate-400"}>
                  {produit.actif ? "Actif" : "Archivé"}
                </Badge>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Code SKU</span>
                  <code className="text-lg font-black text-slate-900">{produit.code}</code>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Prix Vente</span>
                  <span className="text-2xl font-black text-primary">
                    {parseFloat(produit.prix_vente).toLocaleString('fr-FR', { style: 'currency', currency: 'MAD' })}
                  </span>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-2xl bg-slate-50 text-center border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Stock Actuel</p>
                    <p className="text-2xl font-black text-slate-800">{produit.stock_actuel}</p>
                    <p className="text-[10px] text-slate-400">{produit.unite}</p>
                 </div>
                 <div className="p-4 rounded-2xl bg-slate-50 text-center border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Stock Min</p>
                    <p className="text-2xl font-black text-slate-800">{produit.stock_minimum}</p>
                    <p className="text-[10px] text-slate-400">{produit.unite}</p>
                 </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg rounded-3xl overflow-hidden bg-slate-900 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                 <QrIcon size={16} /> Code QR d'Identification
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 py-6">
              <div className="bg-white p-3 rounded-2xl shadow-inner">
                <img src={produit.qr_code} alt="QR" className="size-40" />
              </div>
              <div className="grid grid-cols-2 w-full gap-3">
                <Button variant="outline" className="rounded-xl border-white/20 text-white hover:bg-white/10 gap-2" onClick={() => window.open(produit.qr_code, '_blank')}>
                  <Download size={16} /> Étiquette
                </Button>
                <Button variant="outline" className="rounded-xl border-white/20 text-white hover:bg-white/10 gap-2" onClick={handleRegenerateQr}>
                  <RefreshCw size={16} /> Régénérer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Details & Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
             <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white border-slate-200 text-slate-500">
                   {produit.categorie_nom || "Général"}
                </Badge>
                <Badge variant="outline" className="bg-blue-50 border-blue-100 text-blue-600 font-bold">
                   {produit.projet_nom || "Aucun Projet"}
                </Badge>
                <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 flex items-center gap-1">
                   <MapPin size={10} /> {produit.emplacement || "Non assigné"}
                </Badge>
             </div>
             <h1 className="text-5xl font-black text-slate-900 leading-tight">{produit.nom}</h1>
             <p className="text-lg text-slate-500 max-w-2xl">{produit.description || "Aucune description fournie pour ce produit."}</p>
          </div>

          <Card className="border-none shadow-xl rounded-3xl bg-white/80 backdrop-blur-sm">
             <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                   <BarChart size={20} className="text-primary" /> Informations Techniques
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <div className="flex items-start gap-4">
                      <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                         <Tag size={20} />
                      </div>
                      <div>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Code Barre / EAN</p>
                         <p className="text-lg font-bold text-slate-700">{produit.code_barre || "Non configuré"}</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-4">
                      <div className="size-10 rounded-xl bg-brand-cyan/10 flex items-center justify-center text-brand-cyan shrink-0">
                         <Clock size={20} />
                      </div>
                      <div>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dernière Mise à Jour</p>
                         <p className="text-lg font-bold text-slate-700">{new Date(produit.updated_at).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="flex items-start gap-4">
                      <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                         <TrendingUp size={20} />
                      </div>
                      <div>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rotation Stock</p>
                         <p className="text-lg font-bold text-slate-700">Moyenne (Calculé par IA)</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-4">
                      <div className="size-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                         <History size={20} />
                      </div>
                      <div>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date de Création</p>
                         <p className="text-lg font-bold text-slate-700">{new Date(produit.created_at).toLocaleDateString('fr-FR', { dateStyle: 'long' })}</p>
                      </div>
                   </div>
                </div>
             </CardContent>
          </Card>

          <Card className="border-none shadow-xl rounded-3xl bg-white overflow-hidden">
             <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Historique des Mouvements</CardTitle>
                <Dialog>
                   <DialogTrigger className="inline-flex h-8 items-center justify-center rounded-xl bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors gap-2">
                      <Plus size={14} /> Nouveau
                   </DialogTrigger>
                   <DialogContent className="rounded-[32px]">
                      <DialogHeader>
                         <DialogTitle>Enregistrer un mouvement</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleMouvementSubmit} className="space-y-4 py-4">
                         <div className="space-y-2">
                            <Label>Type de mouvement</Label>
                            <Select 
                              value={mouvementForm.type_mouvement} 
                              onValueChange={(v) => setMouvementForm({...mouvementForm, type_mouvement: v || 'entree'})}
                            >
                               <SelectTrigger className="rounded-xl">
                                  <SelectValue />
                               </SelectTrigger>
                               <SelectContent>
                                  <SelectItem value="entree">Entrée (Réception)</SelectItem>
                                  <SelectItem value="sortie">Sortie (Expédition)</SelectItem>
                               </SelectContent>
                            </Select>
                         </div>
                         <div className="space-y-2">
                            <Label>Quantité ({produit.unite})</Label>
                            <Input 
                              type="number" 
                              min="1" 
                              className="rounded-xl"
                              value={mouvementForm.quantite}
                              onChange={(e) => setMouvementForm({...mouvementForm, quantite: parseInt(e.target.value) || 0})}
                            />
                         </div>
                         <DialogFooter className="pt-4">
                            <Button type="submit" className="w-full rounded-xl" disabled={submitting}>
                               {submitting ? "Enregistrement..." : "Confirmer le mouvement"}
                            </Button>
                         </DialogFooter>
                      </form>
                   </DialogContent>
                </Dialog>
             </CardHeader>
             <CardContent className="p-0">
                <div className="flex flex-col divide-y divide-slate-50">
                   {produit.mouvements && produit.mouvements.length > 0 ? (
                     produit.mouvements.map((m: any, i: number) => (
                       <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                             <div className={`size-8 rounded-full flex items-center justify-center ${m.type_mouvement === 'sortie' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                {m.type_mouvement === 'sortie' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                             </div>
                             <div>
                                <p className="text-sm font-bold text-slate-700">
                                  {m.type_mouvement === 'entree' ? "Réception" : 
                                   m.type_mouvement === 'sortie' ? "Sortie de Stock" : 
                                   m.type_mouvement === 'retour' ? "Retour" : "Ajustement"}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  {new Date(m.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} • Par {m.utilisateur_nom || "Système"}
                                </p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className={`font-black ${m.type_mouvement === 'sortie' ? 'text-rose-600' : 'text-emerald-600'}`}>
                               {m.type_mouvement === 'sortie' ? "-" : "+"}{m.quantite}
                             </p>
                             <p className="text-[10px] text-slate-400">Stock: {m.stock_apres}</p>
                          </div>
                       </div>
                     ))
                   ) : (
                     <div className="p-8 text-center text-slate-400 text-sm italic">
                       Aucun mouvement enregistré pour ce produit.
                     </div>
                   )}
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
