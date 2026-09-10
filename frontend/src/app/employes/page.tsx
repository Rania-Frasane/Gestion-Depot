"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { fetchEmployes, deleteEmploye } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search, Plus, LayoutGrid, List, Phone, Mail, Trash2, Edit2,
  TrendingUp, Users, UserCheck, Banknote, Filter, MoreHorizontal, ChevronRight
} from "lucide-react"
import { EmployeDialog } from "@/components/employes/EmployeDialog"
import { PageHeader } from "@/components/PageHeader"
import { toast } from "sonner"
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

// Minimalist Framer Motion Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } }
}

export default function EmployesPage() {
  const router = useRouter()
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedEmploye, setSelectedEmploye] = useState<any>(null)

  // Delete Confirmation State
  const [employeToDelete, setEmployeToDelete] = useState<number | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setLoading(true)
    fetchEmployes().then(res => {
      setData(Array.isArray(res) ? res : res.results || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  const filteredData = useMemo(() => {
    return data.filter(e =>
      (e.nom + " " + e.prenom).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.matricule && e.matricule.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.poste_nom && e.poste_nom.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [data, searchTerm])

  const handleDelete = async (id: number) => {
    try {
      await deleteEmploye(id)
      setData(prev => prev.filter(e => e.id !== id))
      toast.success("Collaborateur supprimé avec succès")
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    } finally {
      setEmployeToDelete(null)
    }
  }

  const handleOpenForm = (employe?: any) => {
    setSelectedEmploye(employe || null)
    setIsFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-20">

      {/* Minimal Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <PageHeader 
          title="Ressources Humaines" 
          description="Gérez votre équipe, suivez les rôles et optimisez la structure de votre organisation." 
          actions={
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="rounded-full h-12 px-6 border-neutral-200 hover:bg-neutral-50 shadow-sm transition-all font-semibold text-sm gap-2 text-neutral-700 hover:text-neutral-900"
                onClick={() => router.push('/employes/performance')}
              >
                <TrendingUp className="h-4 w-4 text-brand-cyan" /> Performance RH
              </Button>
              <Button
                className="rounded-full h-12 px-8 bg-neutral-900 text-white hover:bg-neutral-800 shadow-xl shadow-neutral-900/10 transition-all font-medium text-sm gap-2"
                onClick={() => handleOpenForm()}
              >
                <Plus className="h-4 w-4" /> Ajouter un collaborateur
              </Button>
            </div>
          }
        />
      </motion.div>

      {/* Minimal Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: "Effectif Total", val: data.length, icon: Users },
          { label: "Membres Actifs", val: data.filter(e => e.actif).length, icon: UserCheck },
          { label: "Masse Salariale", val: data.reduce((acc, e) => acc + (parseFloat(e.salaire) || 0), 0).toLocaleString() + " MAD", icon: Banknote },
          { label: "Performance RH", val: "Consulter", icon: TrendingUp, href: "/employes/performance" }
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <div 
              onClick={() => stat.href && router.push(stat.href)}
              className={`bg-white border border-neutral-200/60 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group ${stat.href ? 'cursor-pointer hover:border-neutral-450 hover:scale-[1.02]' : ''}`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-neutral-500 tracking-wide uppercase">{stat.label}</span>
                <stat.icon className={`h-4 w-4 text-neutral-400 group-hover:text-neutral-900 transition-colors ${stat.href ? 'text-brand-cyan' : ''}`} />
              </div>
              <div className="text-3xl font-semibold text-neutral-900 tracking-tight flex items-center justify-between">
                <span>{stat.val}</span>
                {stat.href && <ChevronRight className="h-5 w-5 text-neutral-400 group-hover:text-neutral-950 transition-colors group-hover:translate-x-1 duration-300" />}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-neutral-200/60 p-2 rounded-full shadow-sm"
      >
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Rechercher un collaborateur..."
            className="pl-11 h-12 bg-transparent border-none shadow-none focus-visible:ring-0 text-neutral-900 placeholder:text-neutral-400 font-medium w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 pr-2">
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100">
            <Filter className="h-4 w-4" />
          </Button>
          <div className="h-10 w-px bg-neutral-200 mx-1" />
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className={`rounded-full h-10 w-10 ${viewMode === 'grid' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'}`}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="icon"
            className={`rounded-full h-10 w-10 ${viewMode === 'table' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'}`}
            onClick={() => setViewMode("table")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <div className="h-8 w-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mb-4" />
          <p className="text-neutral-500 text-sm font-medium">Chargement...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 text-center">
          <div className="h-16 w-16 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
            <Users className="h-6 w-6 text-neutral-400" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">Aucun résultat</h3>
          <p className="text-neutral-500 text-sm max-w-sm">
            Nous n'avons trouvé aucun collaborateur correspondant à votre recherche.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredData.map((e: any) => (
              <motion.div key={e.id} variants={itemVariants} layout exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}>
                <EmployeeCard
                  employe={e}
                  onEdit={() => handleOpenForm(e)}
                  onDelete={() => setEmployeToDelete(e.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border border-neutral-200/60 bg-white shadow-sm"
        >
          <Table>
            <TableHeader className="bg-neutral-50/50">
              <TableRow className="border-neutral-200/60 hover:bg-transparent">
                <TableHead className="pl-6 h-14 font-semibold text-neutral-600">Profil</TableHead>
                <TableHead className="font-semibold text-neutral-600">Rôle</TableHead>
                <TableHead className="font-semibold text-neutral-600">Contact</TableHead>
                <TableHead className="font-semibold text-neutral-600">Statut</TableHead>
                <TableHead className="text-right pr-6 font-semibold text-neutral-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((e: any) => (
                <TableRow key={e.id} className="group border-neutral-100 hover:bg-neutral-50/50 transition-colors">
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 border border-neutral-200 shadow-sm">
                        <AvatarImage src={e.photo ? (e.photo.startsWith('http') ? e.photo : `http://localhost:8000${e.photo}`) : undefined} className="object-cover" />
                        <AvatarFallback className="bg-neutral-100 text-neutral-600 text-xs font-semibold">{e.nom[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-neutral-900 text-sm">{e.prenom} {e.nom}</p>
                        <p className="text-xs text-neutral-500 font-mono mt-0.5">{e.matricule || "—"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200/50">
                      {e.poste_nom || "Collaborateur"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5 text-xs text-neutral-600">
                      <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-neutral-400" /> {e.telephone || "—"}</div>
                      <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-neutral-400" /> {e.email || "—"}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${e.actif ? 'bg-black' : 'bg-neutral-300'}`} />
                      <span className={`text-xs font-medium ${e.actif ? 'text-neutral-900' : 'text-neutral-500'}`}>
                        {e.actif ? "Actif" : "Inactif"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100" onClick={() => handleOpenForm(e)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:text-red-600 hover:bg-red-50" onClick={() => setEmployeToDelete(e.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      )}


      {/* Modals */}
      <EmployeDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        employe={selectedEmploye}
        onSuccess={loadData}
      />

      <AlertDialog open={employeToDelete !== null} onOpenChange={() => setEmployeToDelete(null)}>
        <AlertDialogContent className="rounded-2xl p-6 sm:max-w-[400px] border-neutral-200">
          <AlertDialogHeader className="mb-4">
            <AlertDialogTitle className="text-lg font-semibold text-neutral-900">Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-neutral-500">
              Voulez-vous vraiment retirer ce collaborateur ? Cette action est irréversible et supprimera l'ensemble de ses données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:space-x-3">
            <AlertDialogCancel className="rounded-xl h-10 border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-medium">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => employeToDelete && handleDelete(employeToDelete)}
              className="rounded-xl h-10 bg-black text-white hover:bg-neutral-800 font-medium"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function EmployeeCard({ employe, onEdit, onDelete }: any) {
  const photoUrl = employe.photo ? (employe.photo.startsWith('http') ? employe.photo : `http://localhost:8000${employe.photo}`) : null

  return (
    <div className="group bg-white rounded-3xl border border-neutral-200/60 shadow-sm hover:shadow-xl hover:shadow-neutral-200/50 hover:-translate-y-1 transition-all duration-400 overflow-hidden flex flex-col relative h-full">
      {/* Top Banner - CV Style */}
      <div className="h-24 bg-neutral-900 w-full relative">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {employe.actif && (
            <span className="flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white"></span>
            </span>
          )}
        </div>
      </div>

      <div className="px-6 pb-6 flex-1 flex flex-col relative -mt-12">
        <div className="flex justify-between items-end mb-4">
          <Avatar className="h-24 w-24 border-[4px] border-white shadow-md bg-neutral-900 text-white flex items-center justify-center">
            {photoUrl ? (
              <AvatarImage src={photoUrl} className="object-cover" />
            ) : (
              <div className="size-full bg-gradient-to-br from-neutral-800 to-neutral-950 flex items-center justify-center text-2xl font-extrabold tracking-tight text-white uppercase">
                {(employe.prenom[0] || "") + (employe.nom[0] || "")}
              </div>
            )}
          </Avatar>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pb-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-full" onClick={onEdit}>
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-full" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="mb-5">
          <h3 className="text-xl font-bold text-neutral-900 leading-tight">
            {employe.prenom} {employe.nom}
          </h3>
          <p className="text-sm text-neutral-500 font-medium mt-1">
            {employe.poste_nom || "Collaborateur"}
          </p>
        </div>

        <div className="space-y-3 mt-auto pt-5 border-t border-neutral-100">
          <div className="flex items-center gap-3 text-xs text-neutral-600">
            <Mail className="h-3.5 w-3.5 text-neutral-400" />
            <span className="truncate">{employe.email || "Non renseigné"}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-neutral-600">
            <Phone className="h-3.5 w-3.5 text-neutral-400" />
            <span>{employe.telephone || "Non renseigné"}</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-4 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
            <span className="font-mono font-medium text-neutral-500">{employe.matricule || "—"}</span>
            <span className="font-semibold text-neutral-900">{Number(employe.salaire).toLocaleString()} MAD</span>
          </div>
        </div>
      </div>
    </div>
  )
}
