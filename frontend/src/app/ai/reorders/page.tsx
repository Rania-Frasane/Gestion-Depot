"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ShoppingCart, 
  RefreshCw, 
  Truck, 
  PackageCheck, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Plus,
  Box,
  Target,
  Clock
} from "lucide-react"
import { fetchAiReorders, api } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"

export default function AiReordersPage() {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState<number | null>(null)

  useEffect(() => {
    loadSuggestions()
  }, [])

  const loadSuggestions = () => {
    setLoading(true)
    fetchAiReorders().then(res => {
      setSuggestions(res)
      setLoading(false)
    })
  }

  const createDraftOrder = async (fournisseurId: number, lignes: any[]) => {
    setCreating(fournisseurId)
    try {
      const response = await api.post('ai/reorders/create-draft/', {
        fournisseur_id: fournisseurId,
        lignes: lignes
      })
      toast.success("Brouillon créé", {
        description: response.data.message
      })
    } catch (err) {
      toast.error("Erreur de création")
    } finally {
      setCreating(null)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen text-brand-cyan">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-current"></div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-12 px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
           <div className="size-12 sm:size-16 rounded-[18px] sm:rounded-[24px] bg-brand-cyan flex items-center justify-center text-white shadow-xl shadow-brand-cyan/10 shrink-0">
              <ShoppingCart size={24} className="sm:size-[32px]" />
           </div>
           <div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight italic uppercase">Rapprovisionnement IA</h1>
              <p className="text-slate-500 font-medium text-xs sm:text-sm">Suggestions intelligentes basées sur les prévisions.</p>
           </div>
        </div>
        <Button onClick={loadSuggestions} variant="outline" className="w-full sm:w-auto rounded-2xl h-12 px-6 border-slate-200 gap-2 font-bold text-slate-600 bg-white">
           <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Actualiser
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:gap-10">
         {suggestions.length === 0 ? (
            <Card className="border-none shadow-xl rounded-[30px] sm:rounded-[40px] p-10 sm:p-20 text-center bg-slate-50 border-2 border-dashed border-slate-200">
               <div className="size-16 sm:size-24 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <PackageCheck size={32} className="sm:size-[48px]" />
               </div>
               <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 italic uppercase">TOUT EST SOUS CONTRÔLE</h3>
               <p className="text-slate-500 text-sm sm:text-base max-w-md mx-auto">Aucun produit ne nécessite de commande urgente pour le moment.</p>
            </Card>
         ) : (
            suggestions.map((suggestion, idx) => (
               <Card key={idx} className="border-none shadow-2xl rounded-[30px] sm:rounded-[40px] overflow-hidden bg-white flex flex-col lg:flex-row">
                  <div className="lg:w-1/3 bg-slate-900 p-6 sm:p-10 text-white flex flex-col justify-between">
                     <div className="space-y-4 sm:space-y-6">
                        <div className="flex items-center gap-3">
                           <div className="size-10 rounded-xl bg-brand-cyan flex items-center justify-center">
                              <Truck size={20} />
                           </div>
                           <Badge variant="secondary" className="bg-white/10 text-white border-none font-bold text-[9px] sm:text-[10px]">FOURNISSEUR</Badge>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black italic tracking-tight">{suggestion.fournisseur_nom || "Non assigné"}</h3>
                        <div className="space-y-3 sm:space-y-4">
                           <div className="flex items-center justify-between text-xs sm:text-sm">
                              <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px]">Articles suggérés</span>
                              <span className="font-black">{suggestion.lignes.length}</span>
                           </div>
                           <div className="flex items-center justify-between text-xs sm:text-sm">
                              <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px]">Valeur estimée</span>
                              <span className="font-black text-brand-cyan text-base sm:text-lg">{suggestion.total_estime?.toLocaleString()} MAD</span>
                           </div>
                        </div>
                     </div>
                     <Button 
                       className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-brand-cyan hover:bg-brand-cyan/90 font-black gap-2 mt-6 sm:mt-10 shadow-lg shadow-brand-cyan/15 text-sm sm:text-base"
                       onClick={() => createDraftOrder(suggestion.fournisseur_id, suggestion.lignes)}
                       disabled={creating === suggestion.fournisseur_id}
                     >
                        {creating === suggestion.fournisseur_id ? "Création..." : "Générer le Brouillon"} <ArrowRight size={18} />
                     </Button>
                  </div>
                  
                  <div className="lg:w-2/3 p-6 sm:p-10">
                     <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] mb-4 sm:mb-6">
                        <Target size={14} className="text-brand-cyan" /> Détails des Recommandations
                     </div>
                     <div className="space-y-3 sm:space-y-4">
                        {suggestion.lignes.map((ligne: any, lIdx: number) => (
                           <div key={lIdx} className="group p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-100">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                 <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                                    <div className="size-10 sm:size-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-brand-cyan border border-slate-100 shrink-0">
                                       <Box size={20} className="sm:size-[24px]" />
                                    </div>
                                    <div className="overflow-hidden">
                                       <p className="font-black text-slate-900 group-hover:text-brand-cyan transition-colors text-xs sm:text-sm truncate">{ligne.nom}</p>
                                       <div className="flex flex-wrap items-center gap-2 mt-1">
                                          <Badge variant="outline" className="text-[8px] sm:text-[9px] font-bold border-slate-200">Stock: {ligne.stock_actuel}</Badge>
                                          <Badge variant="outline" className="text-[8px] sm:text-[9px] font-bold border-amber-200 text-amber-600 bg-amber-50">Seuil: {ligne.stock_minimum}</Badge>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="flex items-center justify-between sm:block sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0">
                                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase mb-0 sm:mb-1">À commander</p>
                                    <div className="flex items-center gap-1 sm:gap-2 justify-end">
                                       <Plus size={14} className="text-brand-cyan sm:hidden lg:inline" />
                                       <span className="text-lg sm:text-2xl font-black text-slate-900 italic tracking-tighter">{ligne.quantite_suggeree}</span>
                                       <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase ml-1">Unités</span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </Card>
            ))
         )}
      </div>

      {/* Info Card */}
      <Card className="border-none shadow-xl rounded-[30px] sm:rounded-[40px] bg-amber-50 p-6 sm:p-10 border border-amber-100 flex flex-col md:flex-row items-center gap-6 sm:gap-8">
         <div className="size-16 sm:size-20 rounded-2xl sm:rounded-3xl bg-amber-200 flex items-center justify-center text-amber-700 shrink-0 shadow-lg shadow-amber-200/50">
            <Clock size={32} className="sm:size-[40px]" />
         </div>
         <div className="space-y-2 text-center md:text-left">
            <h4 className="text-lg sm:text-xl font-black italic text-amber-900 uppercase leading-tight">Processus d'Analyse Intelligent</h4>
            <p className="text-amber-700/70 font-medium text-xs sm:text-sm">
               Les suggestions sont calculées en croisant vos stocks actuels, vos seuils minimaux et les délais historiques.
            </p>
         </div>
      </Card>
    </div>
  )
}
