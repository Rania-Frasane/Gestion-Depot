"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { fetchEntrepots, deleteEntrepot } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Warehouse, 
  MapPin, 
  User, 
  ArrowRight, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  MoreVertical,
  Eye,
  Package,
  TrendingUp,
  Activity
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { EntrepotDialog } from "@/components/entrepots/EntrepotDialog"
import { PageHeader } from "@/components/PageHeader"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"

export default function EntrepotsPage() {
  const router = useRouter()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedEntrepot, setSelectedEntrepot] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setLoading(true)
    fetchEntrepots().then(res => {
      setData(Array.isArray(res) ? res : res.results || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  const filteredData = useMemo(() => {
    return data.filter(e => 
      e.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.ville.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.adresse && e.adresse.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [data, searchTerm])

  const handleDelete = async (id: number) => {
    try {
      await deleteEntrepot(id)
      setData(prev => prev.filter(e => e.id !== id))
      toast.success("Entrepôt supprimé")
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    }
  }

  const handleOpenForm = (entrepot?: any) => {
    setSelectedEntrepot(entrepot || null)
    setIsFormOpen(true)
  }

  const headerActions = (
    <Button size="sm" className="rounded-xl shadow-sm gap-1.5 font-bold px-3.5 bg-black text-white hover:bg-slate-800 transition-all text-xs h-9" onClick={() => handleOpenForm()}>
      <Plus className="h-3.5 w-3.5" /> Nouvel Entrepôt
    </Button>
  )

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader 
        title="Réseau Logistique" 
        description="Gérez vos sites de stockage et la distribution régionale."
        actions={headerActions}
      />

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-md bg-white rounded-3xl overflow-hidden relative group">
           <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                 <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                    <Warehouse size={24} />
                 </div>
                 <Badge variant="secondary" className="bg-blue-50 text-blue-700">Total Sites</Badge>
              </div>
              <div className="text-3xl font-black text-slate-900">{data.length}</div>
              <p className="text-sm text-slate-400 mt-1">Entrepôts actifs sur le réseau</p>
           </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white rounded-3xl overflow-hidden relative group">
           <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                 <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                    <Activity size={24} />
                 </div>
                 <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">Performance</Badge>
              </div>
              <div className="text-3xl font-black text-slate-900">94%</div>
              <p className="text-sm text-slate-400 mt-1">Taux d'occupation moyen</p>
           </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white rounded-3xl overflow-hidden relative group">
           <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                 <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
                    <MapPin size={24} />
                 </div>
                 <Badge variant="secondary" className="bg-orange-50 text-orange-700">Couverture</Badge>
              </div>
              <div className="text-3xl font-black text-slate-900">{new Set(data.map(e => e.ville)).size}</div>
              <p className="text-sm text-slate-400 mt-1">Villes desservies au Maroc</p>
           </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-white/20 shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Rechercher un entrepôt par nom, ville ou adresse..." 
            className="pl-11 h-12 bg-white border-slate-200 rounded-2xl focus-visible:ring-primary shadow-sm" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="lg" className="rounded-2xl h-12 gap-2 border-slate-200 bg-white">
          <Filter className="h-5 w-5" /> Filtrer
        </Button>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredData.length === 0 ? (
        <Card className="border-none shadow-xl rounded-3xl p-20 flex flex-col items-center justify-center text-center bg-white">
           <div className="size-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Warehouse size={48} className="text-slate-200" />
           </div>
           <h3 className="text-2xl font-black text-slate-800">Aucun site trouvé</h3>
           <p className="text-slate-500 mt-2 max-w-xs">
             Ajustez vos filtres de recherche ou créez un nouvel entrepôt pour commencer.
           </p>
           <Button className="mt-8 rounded-xl px-8" onClick={() => handleOpenForm()}>
             <Plus className="mr-2" /> Ajouter un entrepôt
           </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredData.map((ent: any) => (
            <Card key={ent.id} className="border-none shadow-md hover:shadow-2xl transition-all duration-300 group rounded-[2.5rem] overflow-hidden bg-white border border-slate-50 relative">
              <div className="absolute top-6 right-6 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-md shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-primary">
                      <MoreVertical className="h-5 w-5 text-slate-600" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 p-2 rounded-2xl shadow-xl border-slate-100">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs uppercase text-slate-400 font-bold tracking-widest px-2 py-1">Options</DropdownMenuLabel>
                      <DropdownMenuItem className="rounded-xl cursor-pointer py-2.5" onClick={() => handleOpenForm(ent)}>
                        <Edit className="mr-3 h-4 w-4 text-slate-500" /> Modifier le site
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-xl cursor-pointer py-2.5" onClick={() => router.push(`/entrepots/${ent.id}/emplacements`)}>
                        <Package className="mr-3 h-4 w-4 text-slate-500" /> Gérer Emplacements
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="my-2" />
                    <AlertDialog>
                      <AlertDialogTrigger nativeButton={false} render={<div className="flex items-center px-2 py-2.5 text-sm text-rose-600 cursor-pointer hover:bg-rose-50 rounded-xl transition-colors" />}>
                          <Trash2 className="mr-3 h-4 w-4" /> Supprimer du réseau
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-3xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl font-bold">Confirmer la fermeture</AlertDialogTitle>
                          <AlertDialogDescription className="text-base">
                            Voulez-vous vraiment retirer l'entrepôt <span className="font-black text-slate-900">{ent.nom}</span> ? Cette action affectera les stocks qui y sont rattachés.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-4">
                          <AlertDialogCancel className="rounded-xl">Conserver le site</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(ent.id)} className="bg-rose-600 hover:bg-rose-700 rounded-xl">
                            Confirmer la suppression
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <CardHeader className="pb-4 pt-8 px-8">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-[1.5rem] shadow-inner ${ent.actif ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Warehouse size={32} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-2xl font-black text-slate-900 truncate tracking-tight">{ent.nom}</CardTitle>
                    <Badge variant="outline" className={`mt-1 border-none font-bold uppercase text-[10px] px-2 py-0.5 rounded-lg ${ent.actif ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                      {ent.actif ? "Opérationnel" : "Hors Service"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-8 pb-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                     <div className="mt-1 p-1.5 bg-slate-50 rounded-lg text-slate-400">
                        <MapPin size={16} />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Localisation</span>
                        <span className="text-slate-700 font-medium leading-tight">{ent.ville}</span>
                        <span className="text-xs text-slate-400 line-clamp-1 mt-0.5">{ent.adresse || "Adresse non spécifiée"}</span>
                     </div>
                  </div>

                  <div className="flex items-start gap-3">
                     <div className="mt-1 p-1.5 bg-slate-50 rounded-lg text-slate-400">
                        <User size={16} />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Responsable</span>
                        <span className="text-slate-700 font-medium leading-tight">{ent.responsable_nom || "Non assigné"}</span>
                     </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-0 border-t border-slate-50">
                <Button variant="ghost" className="w-full h-14 rounded-none hover:bg-primary hover:text-white transition-all font-bold text-slate-500 text-sm group/btn" onClick={() => router.push(`/entrepots/${ent.id}/inventaire`)}>
                  Explorer l'Inventaire <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <EntrepotDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        entrepot={selectedEntrepot} 
        onSuccess={loadData} 
      />
    </div>
  )
}
