"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Upload, 
  AlertTriangle,
  Info,
  Package,
  Barcode,
  Layers
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"

export default function ProductEditPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [projets, setProjets] = useState<any[]>([])
  const [formData, setFormData] = useState({
    nom: "",
    code: "",
    code_barre: "",
    description: "",
    prix_vente: 0,
    stock_actuel: 0,
    stock_minimum: 10,
    unite: "pcs",
    emplacement: "",
    categorie: "",
    projet: "",
    actif: true
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodRes, catRes, projRes] = await Promise.all([
          api.get(`produits/${params.id}/`),
          api.get('categories/'),
          api.get('projets/')
        ])
        setFormData(prodRes.data)
        setCategories(catRes.data)
        setProjets(projRes.data)
        setLoading(false)
      } catch (err) {
        toast.error("Erreur de chargement")
        router.push("/produits")
      }
    }
    if (params.id) loadData()
  }, [params.id])

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = new FormData()
      Object.keys(formData).forEach(key => {
        if (key !== 'image' && key !== 'qr_code' && key !== 'mouvements') {
          let value = (formData as any)[key]
          if (key === 'categorie' && value === "") value = null
          if (key === 'projet' && value === "") value = null
          if (value !== null && value !== undefined) {
            payload.append(key, value.toString())
          }
        }
      })
      if (imageFile) {
        payload.append('image', imageFile)
      }
      
      await api.patch(`produits/${params.id}/`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success("Produit mis à jour ✔️", {
        description: `« ${formData.nom} » a été enregistré avec succès.`
      })
      router.push(`/produits/${params.id}`)
    } catch (err) {
      toast.error("Erreur lors de la sauvegarde")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen text-primary">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-current"></div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Button variant="ghost" onClick={() => router.back()} className="w-fit p-0 hover:bg-transparent text-slate-500 gap-2 mb-2">
            <ArrowLeft size={16} /> Annuler
          </Button>
          <h1 className="text-3xl font-black text-slate-900">Édition Produit</h1>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleSubmit} disabled={saving} className="rounded-xl px-8 shadow-lg shadow-primary/20">
             {saving ? "Sauvegarde..." : "Sauvegarder"} <Save size={18} className="ml-2" />
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="space-y-6">
            <Card className="border-none shadow-md rounded-3xl bg-white p-6">
               <Label className="text-xs font-bold uppercase text-slate-400 mb-4 block">Classification</Label>
               <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700">Catégorie</Label>
                    <select 
                      className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={formData.categorie || ""}
                      onChange={(e) => setFormData({...formData, categorie: e.target.value})}
                    >
                      <option value="">Général</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Projet / Dépôt</Label>
                    <select 
                      className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold text-primary"
                      value={formData.projet || ""}
                      onChange={(e) => setFormData({...formData, projet: e.target.value})}
                    >
                      <option value="">Aucun Projet</option>
                      {projets.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                    </select>
                  </div>
               </div>
            </Card>
            
            <Card className="border-none shadow-md rounded-3xl bg-slate-900 text-white p-6 flex items-center gap-4">
               <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Layers className="text-primary" />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID Unique</p>
                  <p className="text-sm font-mono font-bold">PRD-{params.id}</p>
               </div>
            </Card>

            <Card className="border-none shadow-md rounded-3xl bg-white p-6">
               <Label className="text-xs font-bold uppercase text-slate-400 mb-4 block">Image du Produit</Label>
               <div className="flex flex-col items-center gap-4">
                 <div className="relative w-full aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden bg-slate-50 group hover:border-primary/50 transition-colors cursor-pointer">
                   {(imagePreview || (formData as any).image) ? (
                     <img src={imagePreview || (formData as any).image} alt="Preview" className="object-cover w-full h-full" />
                   ) : (
                     <div className="flex flex-col items-center text-slate-400">
                       <Upload className="mb-2 size-8 text-slate-300 group-hover:text-primary transition-colors" />
                       <span className="text-xs font-medium">Cliquez pour ajouter</span>
                     </div>
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
                 {imageFile && (
                   <Button variant="ghost" size="sm" onClick={() => { setImageFile(null); setImagePreview(null); }} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                     Retirer l'image
                   </Button>
                 )}
               </div>
            </Card>
         </div>

         <div className="md:col-span-2 space-y-6">
            <Card className="border-none shadow-xl rounded-3xl bg-white p-8">
               <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2 col-span-2 md:col-span-1">
                       <Label className="text-slate-700 font-bold ml-1">Nom du Produit</Label>
                       <Input value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2 col-span-2 md:col-span-1">
                       <Label className="text-slate-700 font-bold ml-1">SKU / Code</Label>
                       <Input value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} className="h-12 rounded-xl font-mono" />
                    </div>
                  </div>

                  <div className="space-y-2">
                     <Label className="text-slate-700 font-bold ml-1">Code Barre</Label>
                     <div className="flex gap-2">
                       <Input value={formData.code_barre || ""} onChange={(e) => setFormData({...formData, code_barre: e.target.value})} className="h-12 rounded-xl font-mono flex-1" />
                       <Button 
                         type="button" 
                         variant="outline" 
                         className="h-12 w-12 rounded-xl"
                         onClick={() => {
                           const randomBarcode = Math.floor(Math.random() * 9000000000000 + 1000000000000).toString();
                           setFormData({...formData, code_barre: randomBarcode});
                           toast.info("Nouveau code barre généré");
                         }}
                       >
                         <Barcode size={20} />
                       </Button>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <Label className="text-slate-700 font-bold ml-1">Description</Label>
                     <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="min-h-[100px] rounded-2xl resize-none" />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-3 gap-6">
                     <div className="space-y-2">
                        <Label className="text-slate-700 font-bold ml-1">Prix Vente</Label>
                        <Input type="number" value={isNaN(formData.prix_vente) ? "" : formData.prix_vente} onChange={(e) => setFormData({...formData, prix_vente: parseFloat(e.target.value)})} className="h-12 rounded-xl" />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-slate-700 font-bold ml-1">Stock Min.</Label>
                        <Input type="number" value={isNaN(formData.stock_minimum) ? "" : formData.stock_minimum} onChange={(e) => setFormData({...formData, stock_minimum: parseInt(e.target.value)})} className="h-12 rounded-xl" />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-slate-700 font-bold ml-1">Emplacement</Label>
                        <Input value={formData.emplacement || ""} onChange={(e) => setFormData({...formData, emplacement: e.target.value})} className="h-12 rounded-xl" />
                     </div>
                  </div>
               </div>
            </Card>
         </div>
      </form>
    </div>
  )
}
