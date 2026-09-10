"use client"

import { useEffect, useState, useMemo } from "react"
import { fetchTransferts, deleteTransfert } from "@/lib/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Plus, 
  MoreVertical, 
  ArrowRightLeft, 
  Warehouse, 
  Calendar, 
  Eye, 
  Pencil, 
  Trash2, 
  Filter, 
  Download,
  ArrowRight,
  TrendingUp,
  PackageCheck
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
import { TransfertDialog } from "@/components/transferts/TransfertDialog"
import { TransfertDetailDialog } from "@/components/transferts/TransfertDetailDialog"
import { PageHeader } from "@/components/PageHeader"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"

export default function TransfertsPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatut, setFilterStatut] = useState<string>("all")
  
  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedTransfert, setSelectedTransfert] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setLoading(true)
    fetchTransferts().then(res => {
      setData(Array.isArray(res) ? res : res.results || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  const filteredData = useMemo(() => {
    return data.filter(t => {
      const matchesSearch = (t.numero || `TR-${t.id}`).toLowerCase().includes(searchTerm.toLowerCase()) ||
                           t.entrepot_source_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           t.entrepot_destination_nom.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatut = filterStatut === "all" || t.statut === filterStatut
      return matchesSearch && matchesStatut
    })
  }, [data, searchTerm, filterStatut])

  const handleDelete = async (id: number) => {
    try {
      await deleteTransfert(id)
      setData(prev => prev.filter(t => t.id !== id))
      toast.success("Transfert annulé et supprimé")
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    }
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'recu': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'expedie': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'annule': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  }

  const handleOpenForm = (transfert?: any) => {
    setSelectedTransfert(transfert || null)
    setIsFormOpen(true)
  }

  const handleOpenDetail = (transfert: any) => {
    setSelectedTransfert(transfert)
    setIsDetailOpen(true)
  }

  const headerActions = (
    <>
      <Button variant="outline" size="sm" className="rounded-xl border-slate-200 hover:bg-slate-50 transition-all font-bold gap-1.5 text-xs h-9">
        <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> Analytics
      </Button>
      <Button size="sm" className="rounded-xl shadow-sm gap-1.5 font-bold px-3.5 bg-black text-white hover:bg-slate-800 transition-all text-xs h-9" onClick={() => handleOpenForm()}>
        <Plus className="h-3.5 w-3.5" /> Nouveau Transfert
      </Button>
    </>
  )

  return (
    <div className="flex flex-col gap-8 w-full">
      <PageHeader 
        title="Mouvements de Stock" 
        description="Suivez les transferts inter-dépôts en temps réel."
        actions={headerActions}
      />

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", val: data.length, color: "text-slate-900", bg: "bg-slate-50 border-slate-200" },
          { label: "Expédiés", val: data.filter(t => t.statut === 'expedie').length, color: "text-blue-700", bg: "bg-blue-50 border-blue-100" },
          { label: "Reçus", val: data.filter(t => t.statut === 'recu').length, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
          { label: "Annulés", val: data.filter(t => t.statut === 'annule').length, color: "text-rose-700", bg: "bg-rose-50 border-rose-100" },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} border rounded-2xl p-4 flex flex-col gap-1`}>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{s.label}</span>
            <span className={`text-3xl font-black ${s.color}`}>{s.val}</span>
          </div>
        ))}
      </div>
      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-md border border-white/20">
        <CardHeader className="p-8 border-b border-slate-100 bg-slate-50/30">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-all" />
              <Input 
                placeholder="Rechercher par référence ou entrepôt..." 
                className="pl-12 h-12 bg-white border-slate-200 rounded-2xl focus-visible:ring-primary shadow-sm" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex border rounded-2xl p-1 bg-slate-100 h-12 items-center">
                {['all', 'brouillon', 'expedie', 'recu'].map((s) => (
                  <Button 
                    key={s}
                    variant={filterStatut === s ? "secondary" : "ghost"} 
                    size="sm" 
                    className={`h-9 rounded-xl px-4 text-xs font-bold transition-all uppercase tracking-wider ${filterStatut === s ? 'bg-white shadow-sm text-primary' : 'text-slate-500'}`}
                    onClick={() => setFilterStatut(s)}
                  >
                    {s === 'all' ? 'Tous' : s}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-b border-slate-100 h-16">
                  <TableHead className="pl-10 font-black text-slate-900 uppercase text-[10px] tracking-widest">Référence</TableHead>
                  <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest">Itinéraire</TableHead>
                  <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest">Date</TableHead>
                  <TableHead className="text-center font-black text-slate-900 uppercase text-[10px] tracking-widest">Articles</TableHead>
                  <TableHead className="text-center font-black text-slate-900 uppercase text-[10px] tracking-widest">Statut</TableHead>
                  <TableHead className="text-right pr-10 font-black text-slate-900 uppercase text-[10px] tracking-widest">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-24 text-slate-400 animate-pulse font-medium">Chargement des flux logistiques...</TableCell></TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-24">
                      <div className="flex flex-col items-center gap-4 text-slate-400">
                        <ArrowRightLeft size={64} className="opacity-10" />
                        <p className="text-lg font-medium">Aucun mouvement trouvé dans cette catégorie</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((t: any) => (
                    <TableRow key={t.id} className="group hover:bg-slate-50/80 transition-all border-b border-slate-50">
                      <TableCell className="pl-10 py-6 font-mono text-xs font-black text-slate-600">
                        <div className="flex flex-col">
                           <span>{t.numero || `TR-${t.id}`}</span>
                           <span className="text-[10px] font-normal text-slate-400">ID: {t.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                             <span className="text-sm font-bold text-slate-700">{t.entrepot_source_nom}</span>
                             <span className="text-[10px] uppercase text-slate-400 font-bold tracking-tighter">Source</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-primary animate-pulse" />
                          <div className="flex flex-col">
                             <span className="text-sm font-bold text-slate-700">{t.entrepot_destination_nom}</span>
                             <span className="text-[10px] uppercase text-slate-400 font-bold tracking-tighter">Destination</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        <span className="flex items-center gap-2 font-medium">
                           <Calendar className="h-4 w-4 opacity-40" /> 
                           {new Date(t.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                         <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-black rounded-lg">
                            {t.lignes?.length || 0} Ref
                         </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`border uppercase text-[10px] font-black px-4 py-1.5 rounded-full shadow-sm ${getStatutColor(t.statut)}`}>
                          {t.statut}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary">
                              <MoreVertical className="h-5 w-5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl border-slate-100">
                            <DropdownMenuGroup>
                              <DropdownMenuLabel className="text-[10px] uppercase text-slate-400 font-black tracking-widest px-3 py-2">Opérations Logistiques</DropdownMenuLabel>
                              <DropdownMenuItem className="rounded-xl cursor-pointer py-3" onClick={() => handleOpenDetail(t)}>
                                <Eye className="mr-3 h-4 w-4 text-slate-500" /> Visualiser Détails
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-xl cursor-pointer py-3" onClick={() => handleOpenForm(t)}>
                                <Pencil className="mr-3 h-4 w-4 text-slate-500" /> Editer Transfert
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-xl cursor-pointer py-3">
                                <PackageCheck className="mr-3 h-4 w-4 text-emerald-500" /> Valider Réception
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator className="my-2" />
                            <AlertDialog>
                              <AlertDialogTrigger nativeButton={false} render={<div className="flex items-center px-3 py-3 text-sm text-rose-600 font-bold cursor-pointer hover:bg-rose-50 rounded-xl transition-colors" />}>
                                  <Trash2 className="mr-3 h-4 w-4" /> Annuler Transfert
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-2xl font-black text-slate-900">Confirmation d'Annulation</AlertDialogTitle>
                                  <AlertDialogDescription className="text-base text-slate-500">
                                    Êtes-vous certain de vouloir annuler le transfert <span className="font-black text-slate-900 underline decoration-primary">{t.numero || `TR-${t.id}`}</span> ? 
                                    Cette action rétablira les stocks théoriques sur les entrepôts.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-6">
                                  <AlertDialogCancel className="rounded-xl font-bold">Conserver</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(t.id)} className="bg-rose-600 hover:bg-rose-700 rounded-xl font-bold px-8 shadow-lg shadow-rose-200">
                                    Confirmer l'annulation
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
        </CardContent>
      </Card>

      {/* Dialogs */}
      <TransfertDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        transfert={selectedTransfert} 
        onSuccess={loadData} 
      />
      
      <TransfertDetailDialog 
        open={isDetailOpen} 
        onOpenChange={setIsDetailOpen} 
        transfert={selectedTransfert} 
      />
    </div>
  )
}
