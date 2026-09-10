"use client"

import { useEffect, useState, useMemo } from "react"
import { fetchCommandes, deleteCommande, patchCommande, downloadCommandePdf } from "@/lib/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Plus, 
  MoreVertical, 
  ShoppingCart, 
  Calendar, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Eye, 
  Pencil, 
  Trash2, 
  Filter, 
  Download,
  CheckCircle2,
  Clock,
  AlertCircle
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
import { CommandeDialog } from "@/components/commandes/CommandeDialog"
import { CommandeDetailDialog } from "@/components/commandes/CommandeDetailDialog"
import { PageHeader } from "@/components/PageHeader"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"

export default function CommandesPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "achat" | "vente">("all")
  
  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedCommande, setSelectedCommande] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setLoading(true)
    fetchCommandes().then(res => {
      setData(Array.isArray(res) ? res : res.results || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  const filteredData = useMemo(() => {
    return data.filter(c => {
      const matchesSearch = c.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (c.fournisseur_nom && c.fournisseur_nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (c.client_nom && c.client_nom.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesType = filterType === "all" || c.type_commande === filterType
      return matchesSearch && matchesType
    })
  }, [data, searchTerm, filterType])

  const handleDelete = async (id: number) => {
    try {
      await deleteCommande(id)
      setData(prev => prev.filter(c => c.id !== id))
      toast.success("Commande supprimée")
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    }
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'recue': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'en_cours': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'annulee': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  }

  const handleOpenForm = (commande?: any) => {
    setSelectedCommande(commande || null)
    setIsFormOpen(true)
  }

  const handleOpenDetail = async (commande: any) => {
    const t = toast.loading("Préparation de la visualisation...")
    try {
      const response = await downloadCommandePdf(commande.id)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
      toast.dismiss(t)
    } catch (error) {
      toast.error("Échec de la visualisation", { id: t })
    }
  }

  const handleDownloadPdf = async (commande: any) => {
    const t = toast.loading("Génération du PDF...")
    try {
      const response = await downloadCommandePdf(commande.id)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Commande_${commande.numero}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success("PDF téléchargé", { id: t })
    } catch (error) {
      toast.error("Échec du téléchargement", { id: t })
    }
  }

  const handleUpdateStatus = async (commande: any, newStatus: string) => {
    try {
      await patchCommande(commande.id, { statut: newStatus })
      toast.success(`Statut mis à jour : ${newStatus}`)
      loadData()
    } catch (e) {
      toast.error("Erreur lors de la mise à jour")
    }
  }

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'recue':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 py-1 rounded-lg flex items-center gap-1.5 font-bold uppercase text-[9px]"><CheckCircle2 size={12} /> Reçue</Badge>
      case 'en_cours':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 px-3 py-1 rounded-lg flex items-center gap-1.5 font-bold uppercase text-[9px]"><Clock size={12} /> En Cours</Badge>
      case 'annulee':
        return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 px-3 py-1 rounded-lg flex items-center gap-1.5 font-bold uppercase text-[9px]"><AlertCircle size={12} /> Annulée</Badge>
      default:
        return <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/20 px-3 py-1 rounded-lg flex items-center gap-1.5 font-bold uppercase text-[9px]">{statut}</Badge>
    }
  }

  const headerActions = (
    <>
      <Button variant="outline" size="sm" className="rounded-xl border-slate-200 hover:bg-slate-50 transition-all font-bold gap-1.5 text-xs h-9">
        <Download className="h-3.5 w-3.5 text-slate-500" /> Exporter
      </Button>
      <Button size="sm" className="rounded-xl shadow-sm gap-1.5 font-bold px-3.5 bg-black text-white hover:bg-slate-800 transition-all text-xs h-9" onClick={() => handleOpenForm()}>
        <Plus className="h-3.5 w-3.5" /> Nouvelle Commande
      </Button>
    </>
  )

  return (
    <div className="flex flex-col gap-8 w-full">
      <PageHeader 
        title="Flux de Commandes" 
        description="Gérez vos ordres d'achat et de vente en temps réel."
        actions={headerActions}
      />

      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", val: data.length, color: "text-slate-900", bg: "bg-slate-50 border-slate-200" },
          { label: "En Cours", val: data.filter(c => c.statut === 'en_cours').length, color: "text-blue-700", bg: "bg-blue-50 border-blue-100" },
          { label: "Reçues", val: data.filter(c => c.statut === 'recue').length, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
          { label: "Annulées", val: data.filter(c => c.statut === 'annulee').length, color: "text-rose-700", bg: "bg-rose-50 border-rose-100" },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} border rounded-2xl p-4 flex flex-col gap-1`}>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{s.label}</span>
            <span className={`text-3xl font-black ${s.color}`}>{s.val}</span>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <Card className="border border-slate-100/80 shadow-xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/30">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Rechercher par numéro, partenaire..." 
                className="pl-11 h-12 bg-white border-slate-200 rounded-2xl focus-visible:ring-primary shadow-sm" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex border rounded-2xl p-1 bg-slate-100 h-12 items-center gap-1">
                {(["all","achat","vente"] as const).map((type) => (
                  <Button 
                    key={type}
                    variant={filterType === type ? "secondary" : "ghost"} 
                    size="sm" 
                    className={`h-9 rounded-xl px-4 text-xs font-bold transition-all ${filterType === type ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                    onClick={() => setFilterType(type)}
                  >
                    {type === "all" ? "Toutes" : type === "achat" ? "Achats" : "Ventes"}
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
                  <TableHead className="pl-8 font-bold text-slate-900 w-[140px]">Numéro</TableHead>
                  <TableHead className="font-bold text-slate-900 w-[100px]">Type</TableHead>
                  <TableHead className="font-bold text-slate-900 min-w-[200px]">Partenaire</TableHead>
                  <TableHead className="font-bold text-slate-900 w-[150px]">Date</TableHead>
                  <TableHead className="text-right font-bold text-slate-900 w-[150px]">Total TTC</TableHead>
                  <TableHead className="text-center font-bold text-slate-900 w-[150px]">Statut</TableHead>
                  <TableHead className="text-right pr-8 font-bold text-slate-900 w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-20 text-slate-400 animate-pulse font-medium">Chargement des données...</TableCell></TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-20">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <ShoppingCart size={48} className="opacity-20" />
                        <p>Aucune commande trouvée</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((c: any) => (
                    <TableRow key={c.id} className="group hover:bg-slate-50/80 transition-all border-b border-slate-50">
                      <TableCell className="pl-8 py-4 font-mono text-xs font-black text-slate-600">{c.numero}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`font-black text-[10px] px-2 py-0.5 border-none shadow-sm ${c.type_commande === 'achat' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {c.type_commande === 'achat' ? 'ACHAT' : 'VENTE'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-slate-700">{c.fournisseur_nom || c.client_nom || "N/A"}</TableCell>
                      <TableCell className="text-sm text-slate-500">
                        <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 opacity-50" /> {new Date(c.date_commande).toLocaleDateString('fr-FR')}</span>
                      </TableCell>
                      <TableCell className="text-right font-black text-slate-900">{parseFloat(c.total_ttc).toLocaleString('fr-FR')} <span className="text-[10px] font-normal text-slate-400">MAD</span></TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-2">
                          {getStatutBadge(c.statut)}
                          <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                c.statut === 'recue' ? 'bg-emerald-500 w-full' : 
                                c.statut === 'en_cours' ? 'bg-blue-500 w-2/3' : 
                                'bg-slate-300 w-1/3'
                              }`}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors">
                              <MoreVertical className="h-5 w-5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52 p-2 rounded-2xl shadow-xl border-slate-100">
                            <DropdownMenuGroup>
                              <DropdownMenuItem className="rounded-xl cursor-pointer py-2.5" onClick={() => handleOpenDetail(c)}>
                                <Eye className="mr-3 h-4 w-4 text-blue-500" /> Visualiser & Imprimer
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-xl cursor-pointer py-2.5" onClick={() => handleDownloadPdf(c)}>
                                <Download className="mr-3 h-4 w-4 text-emerald-500" /> Télécharger PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-xl cursor-pointer py-2.5" onClick={() => handleOpenForm(c)}>
                                <Pencil className="mr-3 h-4 w-4 text-slate-500" /> Modifier Commande
                              </DropdownMenuItem>
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator className="my-2" />
                            
                            <DropdownMenuGroup>
                              <DropdownMenuLabel className="text-[9px] uppercase text-slate-400 font-black tracking-widest px-2 py-1">Statut</DropdownMenuLabel>
                              <div className="grid grid-cols-2 gap-1 p-1">
                                <Button size="sm" variant="outline" className="h-7 text-[8px] font-bold" onClick={() => handleUpdateStatus(c, 'en_cours')}>EN COURS</Button>
                                <Button size="sm" variant="outline" className="h-7 text-[8px] font-bold text-emerald-600" onClick={() => handleUpdateStatus(c, 'recue')}>REÇUE</Button>
                                <Button size="sm" variant="outline" className="h-7 text-[8px] font-bold text-rose-600" onClick={() => handleUpdateStatus(c, 'annulee')}>ANNULÉE</Button>
                                <Button size="sm" variant="outline" className="h-7 text-[8px] font-bold" onClick={() => handleUpdateStatus(c, 'brouillon')}>BROUILLON</Button>
                              </div>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator className="my-2" />
                            <AlertDialog>
                              <AlertDialogTrigger 
                                nativeButton={false}
                                render={
                                  <div className="flex items-center px-2 py-2.5 text-sm text-rose-600 cursor-pointer hover:bg-rose-50 rounded-xl transition-colors font-black">
                                    <Trash2 className="mr-3 h-4 w-4" /> Supprimer
                                  </div>
                                } 
                              />

                              <AlertDialogContent className="rounded-3xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-xl font-bold text-slate-900">Confirmation de Suppression</AlertDialogTitle>
                                  <AlertDialogDescription className="text-base">
                                    Voulez-vous vraiment supprimer la commande <span className="font-black text-slate-900">{c.numero}</span> ? Cette action est irréversible.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-4">
                                  <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(c.id)} className="bg-rose-600 hover:bg-rose-700 rounded-xl px-6">
                                    Supprimer définitivement
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
      <CommandeDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        commande={selectedCommande} 
        onSuccess={loadData} 
      />
      
      <CommandeDetailDialog 
        open={isDetailOpen} 
        onOpenChange={setIsDetailOpen} 
        commande={selectedCommande} 
      />
    </div>
  )
}
