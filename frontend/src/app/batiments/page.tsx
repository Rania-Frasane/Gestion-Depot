"use client"

import { useEffect, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Building2, Plus, Search, MapPin, Layers, Layout, 
  Trash2, Edit2, Shield, User, ArrowLeft, Filter, SquareDot
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/PageHeader"
import { toast } from "sonner"
import { 
  fetchBatiments, createBatiment, updateBatiment, deleteBatiment,
  fetchAvailableResponsibles, createLocal, updateLocal, deleteLocal, fetchLocaux
} from "@/lib/api"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog"

// Animation configurations
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

export default function BatimentsPage() {
  const [batiments, setBatiments] = useState<any[]>([])
  const [locaux, setLocaux] = useState<any[]>([])
  const [responsibles, setResponsibles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"batiments" | "locaux">("batiments")

  // Modals state
  const [isBatimentDialogOpen, setIsBatimentDialogOpen] = useState(false)
  const [selectedBatiment, setSelectedBatiment] = useState<any>(null)
  
  const [isLocalDialogOpen, setIsLocalDialogOpen] = useState(false)
  const [selectedLocal, setSelectedLocal] = useState<any>(null)

  // Forms state
  const [batimentForm, setBatimentForm] = useState({
    nom: "", adresse: "", ville: "", nb_etages: 1, description: ""
  })
  const [localForm, setLocalForm] = useState({
    code: "", nom: "", type_local: "bureau", superficie: 20, responsable: "", etage: ""
  })

  // We need to fetch floors dynamically for the rooms form
  const [allEtages, setAllEtages] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const batData = await fetchBatiments()
      setBatiments(batData)
      
      const locData = await fetchLocaux()
      setLocaux(locData)

      const respData = await fetchAvailableResponsibles()
      setResponsibles(respData)

      // Collect all floors from buildings for easy room assignment
      const floorsList: any[] = []
      batData.forEach((b: any) => {
        if (b.etages) {
          b.etages.forEach((et: any) => {
            floorsList.push({
              id: et.id,
              nom: `${b.nom} - ${et.nom}`,
              numero: et.numero_etage
            })
          })
        }
      })
      setAllEtages(floorsList)

    } catch (error) {
      toast.error("Erreur de chargement des données")
    } finally {
      setLoading(false)
    }
  }

  // Filtering Bâtiments & Rooms
  const filteredBatiments = useMemo(() => {
    return batiments.filter(b => 
      b.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.ville.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [batiments, searchTerm])

  const filteredLocaux = useMemo(() => {
    return locaux.filter(l => 
      l.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.responsable_nom && l.responsable_nom.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [locaux, searchTerm])

  // Handlers for Bâtiment CRUD
  const handleOpenBatimentForm = (bat?: any) => {
    if (bat) {
      setSelectedBatiment(bat)
      setBatimentForm({
        nom: bat.nom,
        adresse: bat.adresse || "",
        ville: bat.ville || "",
        nb_etages: bat.nb_etages || 1,
        description: bat.description || ""
      })
    } else {
      setSelectedBatiment(null)
      setBatimentForm({
        nom: "", adresse: "", ville: "", nb_etages: 1, description: ""
      })
    }
    setIsBatimentDialogOpen(true)
  }

  const handleSaveBatiment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (selectedBatiment) {
        await updateBatiment(selectedBatiment.id, batimentForm)
        toast.success("Bâtiment mis à jour avec succès")
      } else {
        await createBatiment(batimentForm)
        toast.success("Bâtiment créé avec succès")
      }
      setIsBatimentDialogOpen(false)
      loadData()
    } catch (error) {
      toast.error("Erreur d'enregistrement")
    }
  }

  const handleDeleteBatiment = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce bâtiment ? Cela supprimera tous ses étages et locaux.")) {
      try {
        await deleteBatiment(id)
        toast.success("Bâtiment supprimé")
        loadData()
      } catch (error) {
        toast.error("Impossible de supprimer ce bâtiment")
      }
    }
  }

  // Handlers for Local CRUD
  const handleOpenLocalForm = (loc?: any) => {
    if (loc) {
      setSelectedLocal(loc)
      setLocalForm({
        code: loc.code,
        nom: loc.nom,
        type_local: loc.type_local,
        superficie: loc.superficie,
        responsable: loc.responsable ? loc.responsable.toString() : "",
        etage: loc.etage ? loc.etage.toString() : ""
      })
    } else {
      setSelectedLocal(null)
      setLocalForm({
        code: "", nom: "", type_local: "bureau", superficie: 20, responsable: "", etage: ""
      })
    }
    setIsLocalDialogOpen(true)
  }

  const handleSaveLocal = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validation
    if (!localForm.etage) {
      toast.error("Veuillez sélectionner un étage/bâtiment")
      return
    }
    try {
      const payload = {
        ...localForm,
        responsable: localForm.responsable ? parseInt(localForm.responsable) : null,
        etage: parseInt(localForm.etage)
      }
      if (selectedLocal) {
        await updateLocal(selectedLocal.id, payload)
        toast.success("Local mis à jour")
      } else {
        await createLocal(payload)
        toast.success("Local créé avec succès")
      }
      setIsLocalDialogOpen(false)
      loadData()
    } catch (error) {
      toast.error("Erreur d'enregistrement du local")
    }
  }

  const handleDeleteLocal = async (id: number) => {
    if (confirm("Supprimer ce local ?")) {
      try {
        await deleteLocal(id)
        toast.success("Local supprimé")
        loadData()
      } catch (error) {
        toast.error("Erreur de suppression")
      }
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-20 max-w-7xl mx-auto px-4">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PageHeader 
          title="Gestion des Bâtiments" 
          description="Gérez les infrastructures, suivez les bureaux, laboratoires et salles de réunion." 
          actions={
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="rounded-full h-12 px-6 border-neutral-200 hover:bg-neutral-50 shadow-sm transition-all font-semibold text-sm gap-2"
                onClick={() => handleOpenLocalForm()}
              >
                <Plus className="h-4 w-4" /> Ajouter un local
              </Button>
              <Button
                className="rounded-full h-12 px-8 bg-neutral-900 text-white hover:bg-neutral-800 shadow-xl transition-all font-medium text-sm gap-2"
                onClick={() => handleOpenBatimentForm()}
              >
                <Building2 className="h-4 w-4" /> Nouveau bâtiment
              </Button>
            </div>
          }
        />
      </motion.div>

      {/* Quick Statistics Overview */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: "Bâtiments Totaux", val: batiments.length, icon: Building2 },
          { label: "Locaux & Salles", val: locaux.length, icon: Layout },
          { label: "Superficie Totale", val: `${locaux.reduce((acc, l) => acc + parseFloat(l.superficie || 0), 0)} m²`, icon: SquareDot },
          { label: "Bureaux Assignés", val: locaux.filter(l => l.responsable).length, icon: User },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <div className="bg-white border border-neutral-200/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-neutral-500 tracking-wide uppercase">{stat.label}</span>
                <stat.icon className="h-4 w-4 text-brand-cyan" />
              </div>
              <div className="text-3xl font-semibold text-neutral-900 tracking-tight">
                {stat.val}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-neutral-200/60 p-2 rounded-full shadow-sm">
        <div className="flex gap-2 pl-2">
          <button
            onClick={() => setActiveTab("batiments")}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              activeTab === "batiments" ? "bg-neutral-950 text-white" : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Bâtiments ({batiments.length})
          </button>
          <button
            onClick={() => setActiveTab("locaux")}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              activeTab === "locaux" ? "bg-neutral-950 text-white" : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            Locaux & Bureaux ({locaux.length})
          </button>
        </div>
        <div className="relative flex-1 w-full max-w-md pr-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder={activeTab === "batiments" ? "Rechercher un bâtiment..." : "Rechercher un local ou bureau..."}
            className="pl-11 h-11 bg-transparent border-none shadow-none focus-visible:ring-0 text-neutral-900 placeholder:text-neutral-400 font-medium w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content Render */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-neutral-950"></div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === "batiments" ? (
            <motion.div
              key="batiments-tab"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredBatiments.map((b: any) => (
                <motion.div key={b.id} variants={itemVariants}>
                  <Card className="rounded-3xl border border-neutral-200/60 overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-300 bg-white group">
                    <CardHeader className="p-6 pb-4 border-b border-neutral-100 relative">
                      <div className="absolute right-4 top-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => handleOpenBatimentForm(b)}>
                          <Edit2 className="h-3.5 w-3.5 text-neutral-500 hover:text-neutral-900" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-rose-600 hover:bg-rose-50" onClick={() => handleDeleteBatiment(b.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <CardTitle className="text-xl font-bold flex items-center gap-2.5 text-neutral-900">
                        <Building2 className="h-5 w-5 text-brand-cyan" />
                        {b.nom}
                      </CardTitle>
                      <CardDescription className="text-xs text-neutral-500 font-semibold uppercase tracking-wider flex items-center gap-1 mt-1">
                        <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                        {b.ville}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 flex flex-col gap-4">
                      <p className="text-sm text-neutral-600 font-medium leading-relaxed">
                        {b.description || "Aucune description fournie."}
                      </p>
                      <div className="flex items-center gap-4 text-xs font-semibold text-neutral-500">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 rounded-xl">
                          <Layers className="h-4 w-4 text-brand-cyan" />
                          {b.nb_etages} Étages
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 rounded-xl">
                          <Layout className="h-4 w-4 text-brand-cyan" />
                          {b.etages ? b.etages.reduce((acc: number, et: any) => acc + (et.locaux ? et.locaux.length : 0), 0) : 0} Locaux
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="locaux-tab"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredLocaux.map((l: any) => (
                <motion.div key={l.id} variants={itemVariants}>
                  <Card className="rounded-3xl border border-neutral-200/60 overflow-hidden shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all duration-300 bg-white group">
                    <CardHeader className="p-6 pb-4 border-b border-neutral-100 relative">
                      <div className="absolute right-4 top-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => handleOpenLocalForm(l)}>
                          <Edit2 className="h-3.5 w-3.5 text-neutral-500 hover:text-neutral-900" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-rose-600 hover:bg-rose-50" onClick={() => handleDeleteLocal(l.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider mb-2 border-brand-cyan/30 text-brand-cyan bg-brand-cyan/5">
                            {l.code}
                          </Badge>
                          <CardTitle className="text-lg font-bold text-neutral-900">{l.nom}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 flex flex-col gap-4 text-sm text-neutral-600">
                      <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                        <div className="flex flex-col gap-0.5 bg-neutral-50 p-2.5 rounded-xl">
                          <span className="text-[10px] text-neutral-400 uppercase">Type</span>
                          <span className="text-neutral-800 capitalize">{l.type_local.replace('_', ' ')}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 bg-neutral-50 p-2.5 rounded-xl">
                          <span className="text-[10px] text-neutral-400 uppercase">Superficie</span>
                          <span className="text-neutral-800">{l.superficie} m²</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-100">
                        <span className="flex items-center gap-1.5 font-bold text-neutral-500">
                          <User className="h-4 w-4 text-brand-cyan" />
                          {l.responsable_nom ? l.responsable_nom : <span className="text-neutral-400 italic font-medium">Non assigné</span>}
                        </span>
                        <span className="text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                          {l.batiment_nom}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Bâtiment dialog form */}
      <Dialog open={isBatimentDialogOpen} onOpenChange={setIsBatimentDialogOpen}>
        <DialogContent className="rounded-3xl border-neutral-200/80 shadow-2xl p-8 max-w-md bg-white">
          <form onSubmit={handleSaveBatiment}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-neutral-900">
                {selectedBatiment ? "Modifier le Bâtiment" : "Nouveau Bâtiment"}
              </DialogTitle>
              <DialogDescription className="text-sm text-neutral-500">
                Spécifiez les informations clés de l'infrastructure immobilière.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6 text-sm">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-neutral-700">Nom du bâtiment</label>
                <Input
                  required
                  placeholder="Ex: Siège Social Casablanca"
                  value={batimentForm.nom}
                  onChange={(e) => setBatimentForm({...batimentForm, nom: e.target.value})}
                  className="rounded-xl border-neutral-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-neutral-700">Ville</label>
                  <Input
                    required
                    placeholder="Ex: Casablanca"
                    value={batimentForm.ville}
                    onChange={(e) => setBatimentForm({...batimentForm, ville: e.target.value})}
                    className="rounded-xl border-neutral-200"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-neutral-700">Nombre d'étages</label>
                  <Input
                    type="number"
                    min={1}
                    required
                    value={batimentForm.nb_etages}
                    onChange={(e) => setBatimentForm({...batimentForm, nb_etages: parseInt(e.target.value) || 1})}
                    className="rounded-xl border-neutral-200"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-neutral-700">Adresse</label>
                <Input
                  placeholder="Ex: Boulevard de la Corniche"
                  value={batimentForm.adresse}
                  onChange={(e) => setBatimentForm({...batimentForm, adresse: e.target.value})}
                  className="rounded-xl border-neutral-200"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-neutral-700">Description</label>
                <textarea
                  placeholder="Notes ou détails sur l'utilisation du bâtiment..."
                  value={batimentForm.description}
                  onChange={(e) => setBatimentForm({...batimentForm, description: e.target.value})}
                  className="rounded-xl border-neutral-200 border p-3 min-h-[80px]"
                />
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" className="rounded-full" onClick={() => setIsBatimentDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" className="rounded-full bg-neutral-900 text-white hover:bg-neutral-800 px-6">
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Local dialog form */}
      <Dialog open={isLocalDialogOpen} onOpenChange={setIsLocalDialogOpen}>
        <DialogContent className="rounded-3xl border-neutral-200/80 shadow-2xl p-8 max-w-md bg-white">
          <form onSubmit={handleSaveLocal}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-neutral-900">
                {selectedLocal ? "Modifier le Local" : "Nouveau Local / Bureau"}
              </DialogTitle>
              <DialogDescription className="text-sm text-neutral-500">
                Configurez l'affectation, le code et la superficie du local.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-neutral-700">Code unique</label>
                  <Input
                    required
                    placeholder="Ex: CASA-E1-04"
                    value={localForm.code}
                    onChange={(e) => setLocalForm({...localForm, code: e.target.value})}
                    className="rounded-xl border-neutral-200"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-neutral-700">Nom / Label</label>
                  <Input
                    required
                    placeholder="Ex: Salle de réunion"
                    value={localForm.nom}
                    onChange={(e) => setLocalForm({...localForm, nom: e.target.value})}
                    className="rounded-xl border-neutral-200"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-neutral-700">Affecté à (Étage / Bâtiment)</label>
                <select
                  required
                  value={localForm.etage}
                  onChange={(e) => setLocalForm({...localForm, etage: e.target.value})}
                  className="rounded-xl border-neutral-200 border p-3 bg-white w-full"
                >
                  <option value="">Sélectionner un emplacement...</option>
                  {allEtages.map((et: any) => (
                    <option key={et.id} value={et.id}>{et.nom}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-neutral-700">Type de local</label>
                  <select
                    value={localForm.type_local}
                    onChange={(e) => setLocalForm({...localForm, type_local: e.target.value})}
                    className="rounded-xl border-neutral-200 border p-3 bg-white w-full"
                  >
                    <option value="bureau">Bureau</option>
                    <option value="salle_reunion">Salle de Réunion</option>
                    <option value="depot">Dépôt / Stockage</option>
                    <option value="labo">Laboratoire</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-neutral-700">Superficie (m²)</label>
                  <Input
                    type="number"
                    step="0.1"
                    min={1}
                    required
                    value={localForm.superficie}
                    onChange={(e) => setLocalForm({...localForm, superficie: parseFloat(e.target.value) || 20})}
                    className="rounded-xl border-neutral-200"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-neutral-700">Collaborateur Responsable</label>
                <select
                  value={localForm.responsable}
                  onChange={(e) => setLocalForm({...localForm, responsable: e.target.value})}
                  className="rounded-xl border-neutral-200 border p-3 bg-white w-full"
                >
                  <option value="">Non assigné / Libre</option>
                  {responsibles.map((r: any) => (
                    <option key={r.id} value={r.id}>{r.prenom} {r.nom}</option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" className="rounded-full" onClick={() => setIsLocalDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" className="rounded-full bg-neutral-900 text-white hover:bg-neutral-800 px-6">
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
