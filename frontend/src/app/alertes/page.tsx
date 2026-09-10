"use client"

import { useEffect, useState, useMemo } from "react"
import { api, fetchAlertes, deleteAlerte } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/PageHeader"
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Info,
  Trash2,
  Search,
  ShieldAlert,
  Package,
  XCircle,
  Eye,
  Filter,
  CheckCheck,
  AlertCircle,
  Zap,
} from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

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

export default function AlertesPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetchAlertes()
      setData(Array.isArray(res) ? res : res.results || [])
    } catch (err) {
      toast.error("Impossible de charger les alertes")
    } finally {
      setLoading(false)
    }
  }

  const filteredData = useMemo(() => {
    return data.filter(a => {
      const matchesSearch = (a.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.produit_nom?.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesType = filterType === "all" || a.type_alerte === filterType
      const matchesStatus = activeTab === 'active' ? !a.lue : a.lue
      return matchesSearch && matchesType && matchesStatus
    })
  }, [data, searchTerm, filterType, activeTab])

  const stats = useMemo(() => ({
    total: data.length,
    high: data.filter(a => a.priorite === 'haute' && !a.lue).length,
    unread: data.filter(a => !a.lue).length,
    resolved: data.filter(a => a.lue).length,
  }), [data])

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.patch(`alertes/${id}/`, { lue: true, lue_at: new Date().toISOString() })
      setData(prev => prev.map(a => a.id === id ? { ...a, lue: true } : a))
      toast.success("Alerte archivée")
    } catch {
      toast.error("Erreur lors de la mise à jour")
    }
  }

  const handleMarkAllRead = async () => {
    const unread = data.filter(a => !a.lue)
    if (unread.length === 0) return

    try {
      await Promise.all(unread.map(a => api.patch(`alertes/${a.id}/`, { lue: true, lue_at: new Date().toISOString() })))
      setData(prev => prev.map(a => ({ ...a, lue: true })))
      toast.success("Toutes les alertes sont archivées")
    } catch {
      toast.error("Erreur lors de l'archivage groupé")
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteAlerte(id)
      setData(prev => prev.filter(a => a.id !== id))
      toast.success("Alerte supprimée définitivement")
    } catch {
      toast.error("Erreur lors de la suppression")
    }
  }

  const getPriorityStyle = (priorite: string) => {
    switch (priorite) {
      case 'haute': return "bg-black text-white border border-black"
      case 'moyenne': return "bg-slate-800 text-white border border-slate-800"
      default: return "bg-slate-200 text-slate-900 border border-slate-200"
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'stock_bas': return <Package size={16} />
      case 'stock_rupture': return <AlertCircle size={16} />
      case 'commande': return <Zap size={16} />
      default: return <Bell size={16} />
    }
  }

  const headerActions = (
    <>
      {activeTab === 'active' && stats.unread > 0 && (
        <Button 
          size="sm" 
          onClick={handleMarkAllRead}
          className="rounded-xl shadow-sm gap-2 font-black px-4 bg-black text-white hover:bg-slate-800 transition-all text-xs"
        >
          <CheckCheck className="h-3.5 w-3.5" /> Tout marquer comme lu
        </Button>
      )}
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
        title="Alertes Système" 
        description="Gérez les alertes logistiques, les ruptures de stock et les notifications critiques."
        actions={headerActions}
      />

      {/* Mini Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Haute Priorité", val: stats.high, icon: AlertTriangle, color: "bg-red-50 text-red-600 border-red-100" },
          { label: "Alertes Actives", val: stats.unread, icon: Info, color: "bg-slate-900 text-white border-slate-900" },
          { label: "Alertes Résolues", val: stats.resolved, icon: CheckCircle, color: "bg-slate-100 text-slate-800 border-slate-200" },
          { label: "Volume Total", val: stats.total, icon: Bell, color: "bg-slate-50 text-slate-600 border-slate-100" },
        ].map((s, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden hover:border-slate-300 transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
                  <p className="text-2xl font-black text-slate-950">{s.val}</p>
                </div>
                <div className={`size-10 rounded-xl flex items-center justify-center border ${s.color}`}>
                  <s.icon size={18} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Navigation & Filters Sidebar */}
        <motion.div className="w-full lg:w-64 shrink-0 space-y-4" variants={itemVariants}>
          {/* Tab Selector */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex flex-col gap-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-wider ${activeTab === 'active' ? 'bg-white shadow-sm text-black border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <span>Actives</span>
              <Badge className={`font-black text-[10px] border-none ${activeTab === 'active' ? 'bg-black text-white' : 'bg-slate-200 text-slate-600'}`}>{stats.unread}</Badge>
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-wider ${activeTab === 'archived' ? 'bg-white shadow-sm text-black border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <span>Archivées</span>
              <Badge className={`font-black text-[10px] border-none ${activeTab === 'archived' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-600'}`}>{stats.resolved}</Badge>
            </button>
          </div>

          {/* Incident Type Filter */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Type d'incident</p>
            <div className="flex flex-col gap-1.5">
              {[
                { id: 'all', label: 'Tous les flux', icon: Filter },
                { id: 'stock_bas', label: 'Stock Bas', icon: Package },
                { id: 'stock_rupture', label: 'Ruptures', icon: XCircle },
                { id: 'commande', label: 'Commandes', icon: Zap },
                { id: 'systeme', label: 'Système', icon: ShieldAlert },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setFilterType(t.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${filterType === t.id ? 'bg-black text-white border-black shadow-sm' : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                >
                  <t.icon size={14} /> <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div className="flex-1 space-y-4" variants={itemVariants}>
          {/* Search bar */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-black transition-all" size={16} />
            <Input
              placeholder="Filtrer les incidents par message, titre ou produit..."
              className="h-12 pl-11 pr-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus-visible:ring-black placeholder:text-slate-400 shadow-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Alerts List */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse" />)}
                </div>
              ) : filteredData.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-20 flex flex-col items-center gap-4 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200"
                >
                  <div className="size-16 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                    <CheckCircle size={28} className="text-slate-300" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-slate-900">Aucune alerte</p>
                    <p className="text-xs text-slate-400 mt-0.5">Tout est opérationnel et sous contrôle.</p>
                  </div>
                </motion.div>
              ) : (
                filteredData.map((a: any, i: number) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: i * 0.03 }}
                    className={`group relative flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all ${!a.lue ? 'border-l-4 border-l-black' : 'opacity-70'}`}
                  >
                    <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${getPriorityStyle(a.priorite)}`}>
                      {getAlertIcon(a.type_alerte)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                            {a.type_alerte?.replace('_', ' ')}
                          </span>
                          <Badge variant="outline" className={`rounded-md text-[8px] font-black border-none uppercase ${a.priorite === 'haute' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                            {a.priorite}
                          </Badge>
                        </div>
                        <span className="text-[10px] font-bold text-slate-300">
                          {new Date(a.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="text-sm font-black text-slate-900 group-hover:text-black transition-colors">
                          {a.titre || "Notification Système"}
                        </h4>
                        <p className="text-slate-500 text-xs font-medium leading-relaxed">
                          {a.message}
                        </p>
                      </div>

                      {a.produit_nom && (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 rounded-lg border border-slate-100">
                          <Package size={10} className="text-slate-500" />
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{a.produit_nom}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col gap-1.5 justify-center sm:justify-start items-center shrink-0">
                      {!a.lue && (
                        <Button
                          size="icon"
                          className="size-8 rounded-xl bg-black hover:bg-slate-800 text-white shadow-sm transition-all"
                          onClick={() => handleMarkAsRead(a.id)}
                          title="Marquer comme lu"
                        >
                          <Eye size={14} />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8 rounded-xl border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
                        onClick={() => handleDelete(a.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
