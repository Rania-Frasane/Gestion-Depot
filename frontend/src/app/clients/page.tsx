"use client"

import { useEffect, useState, useMemo } from "react"
import { fetchClients, deleteClient, downloadClientsPdf } from "@/lib/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Plus, 
  MoreVertical, 
  User, 
  Mail, 
  MapPin, 
  Building2, 
  Trash2, 
  Edit, 
  Filter, 
  Download,
  Phone,
  Eye,
  UserCheck,
  CreditCard
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
import { ClientDialog } from "@/components/clients/ClientDialog"
import { PageHeader } from "@/components/PageHeader"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"

export default function ClientsPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  
  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [clientToDelete, setClientToDelete] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setLoading(true)
    fetchClients().then(res => {
      setData(Array.isArray(res) ? res : res.results || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  const filteredData = useMemo(() => {
    return data.filter(c => {
      const matchesSearch = (c.nom + " " + (c.prenom || "")).toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           c.ville.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === "all" || c.type_client === filterType
      return matchesSearch && matchesType
    })
  }, [data, searchTerm, filterType])

  const handleDelete = async () => {
    if (!clientToDelete) return
    try {
      await deleteClient(clientToDelete.id)
      setData(prev => prev.filter(c => c.id !== clientToDelete.id))
      toast.success("Client archivé avec succès")
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    } finally {
      setClientToDelete(null)
    }
  }

  const handleExport = async () => {
    try {
      const response = await downloadClientsPdf()
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'Clients_Export.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success("Export réussi")
    } catch (e) {
      toast.error("Erreur lors de l'exportation")
    }
  }

  const handleOpenForm = (client?: any) => {
    setSelectedClient(client || null)
    setIsFormOpen(true)
  }

  const headerActions = (
    <>
      <Button variant="outline" size="sm" className="rounded-xl border-slate-200 hover:bg-slate-50 transition-all font-bold gap-1.5 text-xs h-9" onClick={handleExport}>
        <Download className="h-3.5 w-3.5 text-slate-500" /> Exporter
      </Button>
      <Button size="sm" className="rounded-xl shadow-sm gap-1.5 font-bold px-3.5 bg-black text-white hover:bg-slate-800 transition-all text-xs h-9" onClick={() => handleOpenForm()}>
        <Plus className="h-3.5 w-3.5" /> Nouveau Client
      </Button>
    </>
  )

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader 
        title="Base Clients" 
        description="Gérez votre portefeuille client et suivez les plafonds de crédit."
        actions={headerActions}
      />

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Clients", val: data.length, icon: User, color: "blue" },
          { label: "Entreprises", val: data.filter(c => c.type_client === 'entreprise').length, icon: Building2, color: "cyan" },
          { label: "Plafond Total", val: data.reduce((acc, c) => acc + parseFloat(c.plafond_credit), 0).toLocaleString() + " MAD", icon: CreditCard, color: "emerald" },
          { label: "Actifs", val: data.filter(c => c.actif).length, icon: UserCheck, color: "orange" }
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-md rounded-[2rem] overflow-hidden bg-white group hover:scale-[1.02] transition-transform">
             <CardContent className="p-6">
                <div className={`size-12 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-4`}>
                   <stat.icon size={24} />
                </div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{stat.val}</p>
             </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Container */}
      <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-md border border-white/20">
        <CardHeader className="p-8 border-b border-slate-100 bg-slate-50/30">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-all" />
              <Input 
                placeholder="Rechercher par nom, email ou ville..." 
                className="pl-12 h-12 bg-white border-slate-200 rounded-2xl focus-visible:ring-primary shadow-sm" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex border rounded-2xl p-1 bg-slate-100 h-12 items-center">
                <Button 
                  variant={filterType === "all" ? "secondary" : "ghost"} 
                  size="sm" 
                  className={`h-9 rounded-xl px-6 text-xs font-bold transition-all ${filterType === 'all' ? 'bg-white shadow-sm text-primary' : 'text-slate-500'}`}
                  onClick={() => setFilterType("all")}
                >
                  Tous
                </Button>
                <Button 
                  variant={filterType === "particulier" ? "secondary" : "ghost"} 
                  size="sm" 
                  className={`h-9 rounded-xl px-6 text-xs font-bold transition-all ${filterType === 'particulier' ? 'bg-white shadow-sm text-primary' : 'text-slate-500'}`}
                  onClick={() => setFilterType("particulier")}
                >
                  Particuliers
                </Button>
                <Button 
                  variant={filterType === "entreprise" ? "secondary" : "ghost"} 
                  size="sm" 
                  className={`h-9 rounded-xl px-6 text-xs font-bold transition-all ${filterType === 'entreprise' ? 'bg-white shadow-sm text-primary' : 'text-slate-500'}`}
                  onClick={() => setFilterType("entreprise")}
                >
                  Entreprises
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-b border-slate-100 h-16">
                  <TableHead className="pl-10 font-black text-slate-900 uppercase text-[10px] tracking-widest">Identité</TableHead>
                  <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest">Contact</TableHead>
                  <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest">Localisation</TableHead>
                  <TableHead className="text-right font-black text-slate-900 uppercase text-[10px] tracking-widest">Plafond Crédit</TableHead>
                  <TableHead className="text-center font-black text-slate-900 uppercase text-[10px] tracking-widest">Statut</TableHead>
                  <TableHead className="text-right pr-10 font-black text-slate-900 uppercase text-[10px] tracking-widest">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-24 text-slate-400 animate-pulse font-medium">Analyse de la base client...</TableCell></TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-24">
                      <div className="flex flex-col items-center gap-4 text-slate-400">
                        <User size={64} className="opacity-10" />
                        <p className="text-lg font-medium">Aucun client ne correspond aux critères</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((c: any) => (
                    <TableRow key={c.id} className="group hover:bg-slate-50/80 transition-all border-b border-slate-50">
                      <TableCell className="pl-10 py-6">
                        <div className="flex items-center gap-4">
                           {c.logo ? (
                              <img src={c.logo} alt={c.nom} className="size-12 rounded-2xl object-cover shadow-sm border border-slate-100" />
                           ) : (
                              <div className={`size-12 rounded-2xl flex items-center justify-center font-black text-lg ${c.type_client === 'entreprise' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                                 {c.nom[0]}
                              </div>
                           )}
                           <div className="flex flex-col">
                              <span className="font-black text-slate-800">{c.prenom} {c.nom}</span>
                              <Badge variant="outline" className={`w-fit mt-1 border-none text-[9px] px-2 py-0 h-4 rounded-md font-bold uppercase tracking-tighter ${c.type_client === 'entreprise' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                                 {c.type_client}
                              </Badge>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                           <span className="flex items-center gap-2"><Mail size={14} className="text-slate-400" /> {c.email || "N/A"}</span>
                           <span className="flex items-center gap-2"><Phone size={14} className="text-slate-400" /> {c.telephone || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 font-bold text-slate-700">
                           <MapPin size={16} className="text-rose-400" />
                           {c.ville}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                         <span className="font-black text-slate-900">{parseFloat(c.plafond_credit).toLocaleString('fr-FR')}</span>
                         <span className="text-[10px] ml-1 font-bold text-slate-400">MAD</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`border uppercase text-[10px] font-black px-4 py-1.5 rounded-full shadow-sm ${c.actif ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500'}`}>
                          {c.actif ? "ACTIF" : "INACTIF"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary">
                              <MoreVertical className="h-5 w-5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl border-slate-100">
                            <DropdownMenuGroup>
                              <DropdownMenuLabel className="text-[10px] uppercase text-slate-400 font-black tracking-widest px-3 py-2">Dossier Client</DropdownMenuLabel>
                              <DropdownMenuItem className="rounded-xl cursor-pointer py-3" onClick={() => handleOpenForm(c)}>
                                <Edit className="mr-3 h-4 w-4 text-slate-500" /> Modifier Profil
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-xl cursor-pointer py-3">
                                <Eye className="mr-3 h-4 w-4 text-slate-500" /> Historique Achats
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator className="my-2" />
                            <DropdownMenuItem className="rounded-xl cursor-pointer py-3 text-rose-600 focus:bg-rose-50 focus:text-rose-700 font-bold" onClick={() => setClientToDelete(c)}>
                               <Trash2 className="mr-3 h-4 w-4" /> Archiver le Client
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

      {/* Dialogs */}
      <ClientDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        client={selectedClient} 
        onSuccess={loadData} 
      />

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-slate-900">Archivage Client</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-slate-500 mt-3">
              Voulez-vous vraiment désactiver le client <span className="font-black text-slate-900 underline decoration-primary underline-offset-4">{clientToDelete?.prenom} {clientToDelete?.nom}</span> ? <br/>
              Ses données resteront accessibles en mode lecture seule.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel className="rounded-2xl font-bold h-12 px-6 border-slate-200">Conserver</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700 rounded-2xl font-bold h-12 px-8 shadow-lg shadow-rose-200">
              Confirmer l'archivage
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
