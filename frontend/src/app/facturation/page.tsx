"use client"

import { useEffect, useState, useMemo } from "react"
import { fetchFactures, deleteFacture, downloadFacturePdf, patchFacture } from "@/lib/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/PageHeader"
import { 
  Search, 
  Plus, 
  MoreVertical, 
  FileText, 
  Calendar, 
  Trash2, 
  Edit, 
  Download,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Receipt,
  Layers,
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
} from "@/components/ui/alert-dialog"
import { FactureDialog } from "@/components/facturation/FactureDialog"
import { FactureDetailDialog } from "@/components/facturation/FactureDetailDialog"
import { toast } from "sonner"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { motion } from "framer-motion"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
}

export default function FacturationPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatut, setFilterStatut] = useState<string>("all")
  
  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedFacture, setSelectedFacture] = useState<any>(null)
  const [factureToDelete, setFactureToDelete] = useState<any>(null)
  
  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setLoading(true)
    fetchFactures().then(res => {
      setData(Array.isArray(res) ? res : res.results || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  const filteredData = useMemo(() => {
    return data.filter(f => {
      const matchesSearch = f.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (f.client_nom && f.client_nom.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatut = filterStatut === "all" || f.statut === filterStatut
      return matchesSearch && matchesStatut
    })
  }, [data, searchTerm, filterStatut])

  const stats = useMemo(() => {
    const totalCount = data.length
    const paid = data.filter(f => f.statut === 'payee').length
    const pending = data.filter(f => f.statut === 'emise').length
    const totalValue = data.reduce((acc, f) => acc + parseFloat(f.total_ttc), 0)
    
    // Prepare chart data (last 7 days grouped)
    const chartData = data.slice(-7).map(f => ({
      date: new Date(f.date_emission).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      amount: parseFloat(f.total_ttc)
    }))

    return { totalCount, paid, pending, totalValue, chartData }
  }, [data])

  const handleOpenForm = (facture?: any) => {
    setSelectedFacture(facture || null)
    setIsFormOpen(true)
  }

  // Improved: Open custom modal inside the app instead of raw PDF in new tab
  const handleOpenDetail = (facture: any) => {
    setSelectedFacture(facture)
    setIsDetailOpen(true)
  }

  const handleDelete = async () => {
    if (!factureToDelete) return
    try {
      await deleteFacture(factureToDelete.id)
      setData(prev => prev.filter(f => f.id !== factureToDelete.id))
      toast.success("Facture supprimée définitivement")
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    } finally {
      setFactureToDelete(null)
    }
  }

  const handleDownloadPdf = async (facture: any) => {
    const t = toast.loading("Génération du PDF...")
    try {
      const response = await downloadFacturePdf(facture.id)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Facture_${facture.numero}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success("PDF téléchargé avec succès", { id: t })
    } catch (error) {
      toast.error("Échec du téléchargement", { id: t })
    }
  }

  const handleUpdateStatus = async (facture: any, newStatus: string) => {
    try {
      await patchFacture(facture.id, { statut: newStatus })
      toast.success(`Facture passée en ${newStatus}`)
      loadData()
    } catch (e) {
      toast.error("Erreur lors du changement de statut")
    }
  }

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'payee':
        return <Badge className="bg-slate-900 text-white hover:bg-slate-800 border-none px-2 py-0.5 rounded-lg flex items-center gap-1 font-bold uppercase text-[8px]"><CheckCircle2 size={10} /> Payée</Badge>
      case 'emise':
        return <Badge className="bg-slate-500 text-white hover:bg-slate-600 border-none px-2 py-0.5 rounded-lg flex items-center gap-1 font-bold uppercase text-[8px]"><Clock size={10} /> Émise</Badge>
      case 'brouillon':
        return <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-300 border-none px-2 py-0.5 rounded-lg flex items-center gap-1 font-bold uppercase text-[8px]"><FileText size={10} /> Brouillon</Badge>
      case 'annulee':
        return <Badge className="bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-lg flex items-center gap-1 font-bold uppercase text-[8px]"><AlertCircle size={10} /> Annulée</Badge>
      default:
        return <Badge className="text-[8px] font-bold uppercase">{statut}</Badge>
    }
  }

  const headerActions = (
    <>
      <Button variant="outline" size="sm" className="rounded-xl border-slate-200 hover:bg-slate-50 transition-all font-bold gap-2 text-xs">
        <Download className="h-3.5 w-3.5 text-slate-500" /> Export CSV
      </Button>
      <Button size="sm" className="rounded-xl shadow-sm gap-2 font-black px-4 bg-black text-white hover:bg-slate-800 transition-all text-xs" onClick={() => handleOpenForm()}>
        <Plus className="h-3.5 w-3.5" /> Créer une Facture
      </Button>
    </>
  )

  return (
    <motion.div 
      className="flex flex-col gap-6 w-full"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      <PageHeader 
        title="Facturation" 
        description="Gérez les factures clients, suivez les encaissements et exportez les rapports comptables."
        actions={headerActions}
      />

      {/* Monochrome Advanced Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div className="col-span-2" variants={itemVariants}>
          <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <div className="space-y-1">
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Revenus Consolidés (MAD)</p>
                  <h3 className="text-3xl font-black text-slate-950">{stats.totalValue.toLocaleString()} MAD</h3>
               </div>
               <div className="size-9 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                  <TrendingUp size={16} />
               </div>
            </div>
            <div className="h-28 w-full mt-4">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                     <defs>
                        <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <XAxis dataKey="date" hide />
                     <YAxis hide />
                     <Area type="monotone" dataKey="amount" stroke="#000000" fillOpacity={1} fill="url(#colorAmt)" strokeWidth={2} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div className="grid grid-cols-1 gap-4" variants={itemVariants}>
          <Card className="border border-slate-200 shadow-sm bg-white">
             <CardContent className="p-4 flex items-center gap-4">
                <div className="size-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                   {stats.paid}
                </div>
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Factures Payées</p>
                   <p className="text-base font-black text-slate-900">Trésorerie Sécurisée</p>
                </div>
             </CardContent>
          </Card>
          
          <Card className="border border-slate-200 shadow-sm bg-white">
             <CardContent className="p-4 flex items-center gap-4">
                <div className="size-11 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center font-black text-sm">
                   {stats.pending}
                </div>
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Factures Émises</p>
                   <p className="text-base font-black text-slate-900">Encaissements en Attente</p>
                </div>
             </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Refined Invoice Table */}
      <motion.div variants={itemVariants}>
        <Card className="border border-slate-200 shadow-sm overflow-hidden bg-white">
          <CardHeader className="p-5 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-black transition-all" />
                <Input 
                  placeholder="Rechercher par référence, nom du client..." 
                  className="pl-10 h-10 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-black text-sm shadow-sm" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl max-w-fit overflow-x-auto">
                  {['all', 'brouillon', 'emise', 'payee'].map((s) => (
                    <Button 
                      key={s}
                      variant="ghost"
                      size="sm" 
                      className={`h-8 rounded-lg px-3 text-[9px] font-black transition-all uppercase tracking-wider ${filterStatut === s ? 'bg-white shadow-sm text-black border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
                      onClick={() => setFilterStatut(s)}
                    >
                      {s === 'all' ? 'Toutes' : s}
                    </Button>
                  ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
             <div className="overflow-x-auto">
               <Table>
                 <TableHeader className="bg-slate-50/60 border-b border-slate-100">
                   <TableRow>
                     <TableHead className="pl-5 font-black text-slate-900 uppercase text-[9px] tracking-widest w-[120px]">Référence</TableHead>
                     <TableHead className="font-black text-slate-900 uppercase text-[9px] tracking-widest">Client</TableHead>
                     <TableHead className="font-black text-slate-900 uppercase text-[9px] tracking-widest w-[150px]">Émission</TableHead>
                     <TableHead className="text-right font-black text-slate-900 uppercase text-[9px] tracking-widest w-[150px]">Montant</TableHead>
                     <TableHead className="text-center font-black text-slate-900 uppercase text-[9px] tracking-widest w-[130px]">Statut</TableHead>
                     <TableHead className="text-right pr-5 font-black text-slate-900 uppercase text-[9px] tracking-widest w-[80px]">Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {loading ? (
                     <TableRow><TableCell colSpan={6} className="text-center py-20 text-slate-400 font-bold text-xs animate-pulse">Chargement des flux de facturation...</TableCell></TableRow>
                   ) : filteredData.length === 0 ? (
                     <TableRow>
                       <TableCell colSpan={6} className="text-center py-20">
                         <div className="flex flex-col items-center gap-3 text-slate-400">
                           <div className="size-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                              <Receipt size={24} className="opacity-40" />
                           </div>
                           <p className="text-xs font-bold">Aucune facture enregistrée</p>
                         </div>
                       </TableCell>
                     </TableRow>
                   ) : (
                     filteredData.map((f: any) => (
                       <TableRow key={f.id} className="group hover:bg-slate-50/50 transition-all border-b border-slate-100">
                         <TableCell className="pl-5 py-4 font-mono text-xs font-black text-slate-900">#{f.numero}</TableCell>
                         <TableCell>
                            <div className="flex items-center gap-3">
                               <div className="size-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                                  {f.client_nom?.[0]?.toUpperCase() || "C"}
                               </div>
                               <div className="flex flex-col">
                                  <span className="font-black text-slate-800 text-xs">{f.client_nom}</span>
                                  <span className="text-[9px] text-slate-400 font-bold">Client: #{f.client}</span>
                               </div>
                            </div>
                         </TableCell>
                         <TableCell className="text-xs text-slate-500 font-bold">
                            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 opacity-40" /> {new Date(f.date_emission).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                         </TableCell>
                         <TableCell className="text-right">
                            <div className="flex flex-col items-end">
                               <span className="font-black text-slate-900 text-xs">{(parseFloat(f.total_apres_remise || f.total_ttc)).toLocaleString('fr-FR')} MAD</span>
                               {f.remise > 0 && <span className="text-[8px] text-slate-500 font-bold">Remise -{f.remise}%</span>}
                            </div>
                         </TableCell>
                          <TableCell className="text-center">
                             <div className="inline-flex justify-center w-full">
                               {getStatutBadge(f.statut)}
                             </div>
                          </TableCell>
                         <TableCell className="text-right pr-5">
                            <DropdownMenu>
                              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-black transition-all outline-none" />}>
                                <MoreVertical className="h-4 w-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-md border-slate-200 bg-white">
                                <DropdownMenuGroup>
                                  <DropdownMenuLabel className="text-[8px] uppercase text-slate-400 font-black tracking-wider px-2.5 py-1 mb-1">Actions</DropdownMenuLabel>
                                  
                                  <DropdownMenuItem className="rounded-lg cursor-pointer py-2 focus:bg-slate-50 transition-colors" onClick={() => handleOpenDetail(f)}>
                                    <Eye className="mr-2 h-4 w-4 text-slate-500" />
                                    <span className="font-bold text-slate-700 text-xs">Visualiser / Imprimer</span>
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuItem className="rounded-lg cursor-pointer py-2 focus:bg-slate-50 transition-colors" onClick={() => handleDownloadPdf(f)}>
                                    <Download className="mr-2 h-4 w-4 text-slate-500" />
                                    <span className="font-bold text-slate-700 text-xs">Télécharger PDF</span>
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuItem className="rounded-lg cursor-pointer py-2 focus:bg-slate-50 transition-colors" onClick={() => handleOpenForm(f)}>
                                    <Edit className="mr-2 h-4 w-4 text-slate-500" />
                                    <span className="font-bold text-slate-700 text-xs">Éditer la Facture</span>
                                  </DropdownMenuItem>
                                </DropdownMenuGroup>
                                
                                <DropdownMenuSeparator className="my-1.5" />
                                
                                <DropdownMenuGroup>
                                  <DropdownMenuLabel className="text-[8px] uppercase text-slate-400 font-black tracking-wider px-2.5 py-1 mb-1">Statut</DropdownMenuLabel>
                                  <div className="grid grid-cols-3 gap-1 px-2 py-0.5">
                                    <Button 
                                      size="sm" 
                                      variant={f.statut === 'brouillon' ? 'default' : 'outline'} 
                                      className="rounded text-[7px] font-black h-6 p-0 bg-slate-100 hover:bg-slate-200 text-slate-800"
                                      onClick={() => handleUpdateStatus(f, 'brouillon')}
                                    >
                                      DRAFT
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant={f.statut === 'emise' ? 'default' : 'outline'} 
                                      className="rounded text-[7px] font-black h-6 p-0 border-slate-300 text-slate-700 hover:bg-slate-50"
                                      onClick={() => handleUpdateStatus(f, 'emise')}
                                    >
                                      ISSUE
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant={f.statut === 'payee' ? 'default' : 'outline'} 
                                      className="rounded text-[7px] font-black h-6 p-0 bg-black text-white hover:bg-slate-900 border-none"
                                      onClick={() => handleUpdateStatus(f, 'payee')}
                                    >
                                      PAID
                                    </Button>
                                  </div>
                                </DropdownMenuGroup>

                                <DropdownMenuSeparator className="my-1.5" />
                                <DropdownMenuItem className="rounded-lg cursor-pointer py-2 focus:bg-red-50 text-red-600 transition-colors font-black text-xs" onClick={() => setFactureToDelete(f)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                </DropdownMenuItem>
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
      </motion.div>

      {/* Dialogs */}
      <FactureDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        facture={selectedFacture} 
        onSuccess={loadData} 
      />

      <FactureDetailDialog 
        open={isDetailOpen} 
        onOpenChange={setIsDetailOpen} 
        facture={selectedFacture} 
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!factureToDelete} onOpenChange={(open) => !open && setFactureToDelete(null)}>
        <AlertDialogContent className="rounded-2xl border-none shadow-md p-6 max-w-sm">
          <AlertDialogHeader>
            <div className="size-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
               <AlertCircle size={24} className="text-black" />
            </div>
            <AlertDialogTitle className="text-lg font-black text-slate-900">Suppression définitive</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500 font-medium leading-relaxed">
              Êtes-vous sûr de vouloir supprimer la facture <span className="text-black font-black">#{factureToDelete?.numero}</span> ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2">
            <AlertDialogCancel className="rounded-xl h-10 px-4 font-black border-slate-200 text-xs">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-black hover:bg-slate-900 text-white rounded-xl h-10 px-5 font-black text-xs">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
