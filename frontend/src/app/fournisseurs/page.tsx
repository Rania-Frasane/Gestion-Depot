"use client"

import { useEffect, useState, useMemo } from "react"
import { fetchFournisseurs, deleteFournisseur, api } from "@/lib/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Truck, 
  Mail, 
  Phone, 
  MapPin, 
  Trash2, 
  Edit, 
  Filter, 
  Download,
  Award,
  Globe,
  Briefcase,
  History,
  ExternalLink,
  FileText,
  UploadCloud,
  Calendar,
  CheckCircle2,
  CircleDashed
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { FournisseurDialog } from "@/components/fournisseurs/FournisseurDialog"
import { PageHeader } from "@/components/PageHeader"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"

export default function FournisseursPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isFluxOpen, setIsFluxOpen] = useState(false)
  const [isDocsOpen, setIsDocsOpen] = useState(false)
  const [selectedFournisseur, setSelectedFournisseur] = useState<any>(null)
  
  const [fluxCommandes, setFluxCommandes] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setLoading(true)
    fetchFournisseurs().then(res => {
      setData(Array.isArray(res) ? res : res.results || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  const filteredData = useMemo(() => {
    return data.filter(f => 
      f.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.contact_nom && f.contact_nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
      f.ville.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [data, searchTerm])

  const handleDelete = async (id: number) => {
    try {
      await deleteFournisseur(id)
      setData(prev => prev.filter(f => f.id !== id))
      toast.success("Fournisseur retiré de la liste active")
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    }
  }

  const handleOpenForm = (fournisseur?: any) => {
    setSelectedFournisseur(fournisseur || null)
    setIsFormOpen(true)
  }

  const handleOpenFlux = (fournisseur: any) => {
    setSelectedFournisseur(fournisseur)
    setIsFluxOpen(true)
  }

  const handleOpenDocs = (fournisseur: any) => {
    setSelectedFournisseur(fournisseur)
    setIsDocsOpen(true)
  }

  useEffect(() => {
    if (isFluxOpen && selectedFournisseur) {
      api.get('commandes/', { params: { fournisseur: selectedFournisseur.id } })
        .then(res => setFluxCommandes(res.data.results || res.data))
        .catch(() => toast.error("Erreur de chargement des commandes"))
    }
  }, [isFluxOpen, selectedFournisseur])

  const fetchDocuments = () => {
    api.get('documents-fournisseurs/', { params: { fournisseur: selectedFournisseur.id } })
      .then(res => setDocuments(res.data.results || res.data))
      .catch(() => toast.error("Erreur de chargement des documents"))
  }

  useEffect(() => {
    if (isDocsOpen && selectedFournisseur) {
      fetchDocuments()
    }
  }, [isDocsOpen, selectedFournisseur])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedFournisseur) return
    
    setUploading(true)
    const formData = new FormData()
    formData.append('fichier', file)
    formData.append('nom', file.name)
    formData.append('fournisseur', selectedFournisseur.id.toString())
    
    try {
      await api.post('documents-fournisseurs/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success("Document téléchargé avec succès")
      fetchDocuments()
    } catch (err) {
      toast.error("Erreur lors du téléchargement")
    } finally {
      setUploading(false)
    }
  }

  const headerActions = (
    <>
      <Button variant="outline" size="sm" className="rounded-xl border-slate-200 hover:bg-slate-50 transition-all font-bold gap-1.5 text-xs h-9">
        <Download className="h-3.5 w-3.5 text-slate-500" /> Catalogue
      </Button>
      <Button size="sm" className="rounded-xl shadow-sm gap-1.5 font-bold px-3.5 bg-black text-white hover:bg-slate-800 transition-all text-xs h-9" onClick={() => handleOpenForm()}>
        <Plus className="h-3.5 w-3.5" /> Nouveau Partenaire
      </Button>
    </>
  )

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader 
        title="Chaîne d'Approvisionnement" 
        description="Gérez vos relations fournisseurs et optimisez vos délais de livraison."
        actions={headerActions}
      />

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <Card className="border-none shadow-xl rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
               <Truck size={120} />
            </div>
            <CardContent className="p-8 relative z-10">
               <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-2">Total Partenaires</p>
               <h3 className="text-5xl font-black">{data.length}</h3>
               <div className="mt-6 flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Award size={16} /> 100% Fiabilité Réseau
               </div>
            </CardContent>
         </Card>

         <Card className="border-none shadow-lg rounded-[2.5rem] bg-white overflow-hidden flex items-center">
            <CardContent className="p-8 w-full flex items-center gap-6">
               <div className="size-16 rounded-[1.5rem] bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Globe size={32} />
               </div>
               <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Villes Couvertes</p>
                  <h3 className="text-3xl font-black text-slate-900">{new Set(data.map(f => f.ville)).size}</h3>
               </div>
            </CardContent>
         </Card>

         <Card className="border-none shadow-lg rounded-[2.5rem] bg-white overflow-hidden flex items-center">
            <CardContent className="p-8 w-full flex items-center gap-6">
               <div className="size-16 rounded-[1.5rem] bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <Briefcase size={32} />
               </div>
               <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Commandes en cours</p>
                  <h3 className="text-3xl font-black text-slate-900">12</h3>
               </div>
            </CardContent>
         </Card>
      </div>

      {/* Main Container */}
      <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-md border border-white/20">
        <CardHeader className="p-10 border-b border-slate-100 bg-slate-50/30">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-4 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-all" />
              <Input 
                placeholder="Filtrer par entreprise, contact ou ville..." 
                className="pl-14 h-14 bg-white border-slate-200 rounded-3xl focus-visible:ring-primary shadow-sm text-lg" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="lg" className="rounded-3xl h-14 px-8 gap-3 border-slate-200 bg-white font-bold shadow-sm">
              <Filter className="h-5 w-5" /> Filtres Avancés
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-b border-slate-100 h-20">
                  <TableHead className="pl-12 font-black text-slate-900 uppercase text-[10px] tracking-widest">Fournisseur</TableHead>
                  <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest">Contact Principal</TableHead>
                  <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest">Coordonnées</TableHead>
                  <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest">Localisation</TableHead>
                  <TableHead className="text-center font-black text-slate-900 uppercase text-[10px] tracking-widest">Statut</TableHead>
                  <TableHead className="text-right pr-12 font-black text-slate-900 uppercase text-[10px] tracking-widest">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-32 text-slate-400 animate-pulse font-medium text-lg">Synchronisation avec le registre des partenaires...</TableCell></TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-32">
                      <div className="flex flex-col items-center gap-6">
                        <div className="size-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                           <Truck size={48} />
                        </div>
                        <p className="text-xl font-bold text-slate-400">Aucun partenaire trouvé pour cette recherche</p>
                        <Button variant="link" onClick={() => setSearchTerm("")}>Réinitialiser la recherche</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((f: any) => (
                    <TableRow key={f.id} className="group hover:bg-slate-50/50 transition-all border-b border-slate-50">
                      <TableCell className="pl-12 py-8">
                        <div className="flex items-center gap-5">
                           {f.logo ? (
                              <img src={f.logo} alt={f.nom} className="size-14 rounded-2xl object-cover shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform bg-white" />
                           ) : (
                              <div className="size-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform">
                                 {f.nom[0]}
                              </div>
                           )}
                           <div className="flex flex-col">
                              <span className="font-black text-slate-900 text-lg">{f.nom}</span>
                              <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Fournisseur ID: #{f.id}</span>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex flex-col">
                            <span className="font-bold text-slate-700">{f.contact_nom || "N/A"}</span>
                            <span className="text-xs text-slate-400 italic">Responsable Compte</span>
                         </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5 text-sm font-medium text-slate-600">
                           <span className="flex items-center gap-2.5"><Mail size={14} className="text-primary/60" /> {f.email || "N/A"}</span>
                           <span className="flex items-center gap-2.5"><Phone size={14} className="text-primary/60" /> {f.telephone || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3 font-bold text-slate-800">
                           <div className="size-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                              <MapPin size={16} />
                           </div>
                           {f.ville}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`border uppercase text-[10px] font-black px-5 py-2 rounded-full shadow-sm ${f.actif ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          {f.actif ? "OPÉRATIONNEL" : "SUSPENDU"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-12">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-12 w-12 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-md transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary">
                              <MoreVertical className="h-6 w-6" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-64 p-3 rounded-3xl shadow-2xl border-slate-100">
                            <DropdownMenuGroup>
                              <DropdownMenuLabel className="text-[10px] uppercase text-slate-400 font-black tracking-widest px-4 py-3">Gestion Partenaire</DropdownMenuLabel>
                              <DropdownMenuItem className="rounded-2xl cursor-pointer py-3.5" onClick={() => handleOpenForm(f)}>
                                <Edit className="mr-3 h-4 w-4 text-slate-500" /> Modifier Profil
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-2xl cursor-pointer py-3.5" onClick={() => handleOpenFlux(f)}>
                                <History className="mr-3 h-4 w-4 text-slate-500" /> Flux de Livraison
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-2xl cursor-pointer py-3.5" onClick={() => handleOpenDocs(f)}>
                                <ExternalLink className="mr-3 h-4 w-4 text-slate-500" /> Documents Partagés
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator className="my-2" />
                            <AlertDialog>
                              <AlertDialogTrigger nativeButton={false} render={<div className="flex items-center px-4 py-3.5 text-sm text-rose-600 font-bold cursor-pointer hover:bg-rose-50 rounded-2xl transition-colors" />}>
                                  <Trash2 className="mr-3 h-4 w-4" /> Retirer du Réseau
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl p-10">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-3xl font-black text-slate-900 leading-tight">Confirmation de Dissolution de Partenariat</AlertDialogTitle>
                                  <AlertDialogDescription className="text-lg text-slate-500 mt-4">
                                    Souhaitez-vous vraiment retirer <span className="font-black text-slate-900 underline decoration-primary decoration-4 underline-offset-4">{f.nom}</span> de votre chaîne logistique active ? 
                                    Les commandes passées resteront archivées dans le système.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-10 gap-4">
                                  <AlertDialogCancel className="rounded-2xl h-14 px-8 font-black text-slate-500 border-slate-200">Conserver Partenaire</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(f.id)} className="bg-rose-600 hover:bg-rose-700 rounded-2xl h-14 px-10 font-black shadow-xl shadow-rose-200">
                                    Confirmer le Retrait
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
      <FournisseurDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        fournisseur={selectedFournisseur} 
        onSuccess={loadData} 
      />

      {/* Flux de Livraison Dialog */}
      <Dialog open={isFluxOpen} onOpenChange={setIsFluxOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-8 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-3 text-slate-900">
              <History className="text-primary" /> Flux de Livraison
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="flex flex-col gap-1 mb-4">
               <p className="text-sm font-bold text-slate-500">Partenaire</p>
               <h3 className="text-xl font-black text-slate-900">{selectedFournisseur?.nom}</h3>
            </div>
            <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2">
               {fluxCommandes.length === 0 ? (
                 <p className="text-center text-slate-400 italic py-8">Aucun flux de livraison pour ce fournisseur.</p>
               ) : (
                 fluxCommandes.map(cmd => (
                   <div key={cmd.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between hover:bg-white hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                         <div className={`size-12 rounded-xl flex items-center justify-center ${cmd.statut === 'recue' ? 'bg-emerald-100 text-emerald-600' : cmd.statut === 'en_cours' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                            {cmd.statut === 'recue' ? <CheckCircle2 size={24} /> : cmd.statut === 'en_cours' ? <CircleDashed size={24} /> : <Calendar size={24} />}
                         </div>
                         <div>
                            <p className="font-black text-slate-900 text-lg">{cmd.numero}</p>
                            <p className="text-sm text-slate-500 font-medium">
                              {cmd.statut === 'recue' ? `Livré le ${cmd.date_livraison_reelle || cmd.updated_at.split('T')[0]}` : 
                               cmd.statut === 'en_cours' ? `Prévu pour le ${cmd.date_livraison_prevue || '...'}` : 'En préparation'}
                            </p>
                         </div>
                      </div>
                      <Badge className={`${cmd.statut === 'recue' ? 'bg-emerald-50 text-emerald-700' : cmd.statut === 'en_cours' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'} border-none px-4 py-1 text-xs uppercase tracking-widest`}>
                        {cmd.statut === 'recue' ? 'Terminé' : cmd.statut === 'en_cours' ? 'En transit' : 'Brouillon'}
                      </Badge>
                   </div>
                 ))
               )}
            </div>
            <Button className="w-full h-14 rounded-2xl font-bold shadow-lg" onClick={() => setIsFluxOpen(false)}>Fermer</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Documents Partagés Dialog */}
      <Dialog open={isDocsOpen} onOpenChange={setIsDocsOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-8 border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-3 text-slate-900">
              <FileText className="text-primary" /> Documents Partagés
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
             <div className="flex flex-col gap-1 mb-2">
               <p className="text-sm font-bold text-slate-500">Partenaire</p>
               <h3 className="text-xl font-black text-slate-900">{selectedFournisseur?.nom}</h3>
             </div>
             
             <label className={`border-2 border-dashed ${uploading ? 'border-primary bg-primary/5' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'} rounded-[2rem] p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer relative`}>
                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileUpload} disabled={uploading} />
                <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-inner">
                   {uploading ? <CircleDashed size={28} className="animate-spin" /> : <UploadCloud size={28} />}
                </div>
                <h3 className="font-black text-slate-900 text-lg mb-1">{uploading ? "Transfert en cours..." : "Déposer un document"}</h3>
                <p className="text-sm text-slate-500 font-medium">Glissez-déposez ou cliquez (PDF, DOCX, JPG)</p>
             </label>

             <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                <h4 className="font-black text-slate-900 text-sm uppercase tracking-widest">Fichiers Récents</h4>
                {documents.length === 0 ? (
                  <p className="text-center text-slate-400 italic py-4">Aucun document partagé.</p>
                ) : (
                  documents.map(doc => (
                    <div key={doc.id} className="p-4 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-primary/30 hover:bg-slate-50 transition-all cursor-pointer" onClick={() => window.open(doc.fichier.startsWith('http') ? doc.fichier : `http://localhost:8000${doc.fichier}`, '_blank')}>
                       <div className="flex items-center gap-4">
                          <div className="size-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                             <FileText size={24} />
                          </div>
                          <div className="min-w-0 flex-1">
                             <p className="font-bold text-slate-900 text-base group-hover:text-primary transition-colors truncate">{doc.nom}</p>
                             <p className="text-xs text-slate-500 font-medium">
                               {new Date(doc.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} • {doc.taille}
                             </p>
                          </div>
                       </div>
                       <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 group-hover:text-primary bg-white shrink-0"><Download size={20} /></Button>
                    </div>
                  ))
                )}
             </div>
             <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-slate-200" onClick={() => setIsDocsOpen(false)}>Fermer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
