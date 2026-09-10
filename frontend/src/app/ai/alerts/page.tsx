"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  BellRing, 
  Settings2, 
  ShieldCheck, 
  AlertTriangle, 
  Search,
  CheckCircle2,
  SlidersHorizontal,
  Zap,
  Save,
  Activity,
  History,
  ShieldAlert
} from "lucide-react"
import { fetchAiAlertRules, updateAiAlertRules } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function AiAlertRulesPage() {
  const [rules, setRules] = useState({
    std_dev_threshold: 3.0,
    min_quantity_threshold: 10,
    is_active: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAiAlertRules().then(res => {
      setRules(res)
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateAiAlertRules(rules)
      toast.success("Configuration sauvegardée", {
        description: "Le moteur de détection d'anomalies a été mis à jour."
      })
    } catch (err) {
      toast.error("Erreur de sauvegarde")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen text-brand-cyan">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-current"></div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 pb-12 px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
           <div className="size-12 sm:size-16 rounded-[18px] sm:rounded-[24px] bg-rose-600 flex items-center justify-center text-white shadow-xl shadow-rose-100 shrink-0">
              <ShieldAlert size={24} className="sm:size-[32px]" />
           </div>
           <div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight italic uppercase">Protection IA</h1>
              <p className="text-slate-500 font-medium text-xs sm:text-sm">Configurez le moteur de détection intelligente.</p>
           </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
           <Button variant="ghost" className="w-full sm:w-auto rounded-xl h-11 sm:h-12 px-6 gap-2 font-bold text-slate-400 text-sm">
              <History size={18} /> Logs
           </Button>
           <Button 
             onClick={handleSave} 
             disabled={saving}
             className="w-full sm:w-auto rounded-xl sm:rounded-2xl h-11 sm:h-12 px-8 bg-rose-600 hover:bg-rose-700 gap-2 shadow-lg shadow-rose-100 font-black text-sm"
           >
              {saving ? <RotateCw className="animate-spin size-4" /> : <Save size={18} />} {saving ? "..." : "Appliquer"}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
         <div className="md:col-span-2 space-y-6 md:space-y-8">
            {/* Main Configuration Card */}
            <Card className="border-none shadow-2xl rounded-[30px] sm:rounded-[40px] bg-white overflow-hidden p-6 sm:p-10">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-10 gap-4 sm:gap-0">
                  <div className="space-y-1">
                     <h2 className="text-xl sm:text-2xl font-black italic text-slate-900 tracking-tight">PARAMÈTRES DU MOTEUR</h2>
                     <p className="text-slate-400 font-medium text-xs sm:text-sm">Ajustez la sensibilité de l'algorithme.</p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-start gap-4 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100">
                     <span className="text-[10px] sm:text-sm font-black text-slate-600 uppercase tracking-widest italic">Service</span>
                     <Switch 
                       checked={rules.is_active} 
                       onCheckedChange={(v) => setRules({...rules, is_active: v})} 
                     />
                  </div>
               </div>

               <div className="space-y-8 sm:space-y-10">
                  <div className="space-y-4 sm:space-y-6">
                     <div className="flex items-center justify-between">
                        <Label className="text-base sm:text-lg font-black text-slate-800 italic">Sensibilité</Label>
                        <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200 text-base sm:text-lg font-black px-3 sm:px-4 py-1 h-auto">
                           {rules.std_dev_threshold}σ
                        </Badge>
                     </div>
                     <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                        Seuil au-delà duquel un mouvement est considéré comme une anomalie.
                     </p>
                     <Input 
                        type="range" 
                        min="1" 
                        max="5" 
                        step="0.1" 
                        value={rules.std_dev_threshold}
                        onChange={(e) => setRules({...rules, std_dev_threshold: parseFloat(e.target.value)})}
                        className="h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-rose-600"
                     />
                     <div className="flex justify-between text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                        <span>Sensible</span>
                        <span>Équilibré</span>
                        <span>Tolérant</span>
                     </div>
                  </div>

                  <Separator />

                  <div className="space-y-4 sm:space-y-6">
                     <div className="flex items-center justify-between">
                        <Label className="text-base sm:text-lg font-black text-slate-800 italic">Seuil Minimum</Label>
                        <div className="flex items-center gap-2">
                           <Input 
                             type="number" 
                             className="w-20 sm:w-24 h-10 sm:h-12 rounded-lg sm:rounded-xl text-center font-black text-lg sm:text-xl bg-slate-50 border-slate-200" 
                             value={rules.min_quantity_threshold}
                             onChange={(e) => setRules({...rules, min_quantity_threshold: parseInt(e.target.value) || 1})}
                           />
                           <span className="text-slate-400 font-bold text-xs sm:text-sm uppercase tracking-tighter">Unités</span>
                        </div>
                     </div>
                     <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                        L'IA ignore les anomalies sur les mouvements inférieurs à ce seuil.
                     </p>
                  </div>
               </div>
            </Card>

            {/* Test Area */}
            <Card className="border-none shadow-xl rounded-[30px] sm:rounded-[40px] bg-slate-900 text-white p-6 sm:p-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Activity size={150} />
               </div>
               <div className="size-16 sm:size-20 rounded-2xl sm:rounded-3xl bg-white/10 flex items-center justify-center text-rose-500 shrink-0 shadow-lg">
                  <Zap size={32} className="sm:size-[40px]" />
               </div>
               <div className="flex-1 space-y-3 sm:space-y-4 text-center sm:text-left z-10">
                  <h3 className="text-lg sm:text-xl font-black italic tracking-tight uppercase">Test de Détection</h3>
                  <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed">
                     Lancez une simulation pour voir comment vos paramètres réagissent.
                  </p>
                  <Button variant="outline" className="w-full sm:w-auto rounded-xl border-white/20 text-white hover:bg-white/10 font-bold h-10 px-6 text-xs">
                     Lancer le Diagnostic
                  </Button>
               </div>
            </Card>
         </div>

         <div className="space-y-6 md:space-y-8">
            <Card className="border-none shadow-xl rounded-[28px] sm:rounded-[35px] bg-rose-50 p-6 sm:p-8 border border-rose-100 flex flex-col items-center text-center">
               <div className="size-12 sm:size-16 rounded-full bg-white flex items-center justify-center text-rose-600 shadow-sm mb-4 sm:mb-6 shrink-0">
                  <ShieldCheck size={24} className="sm:size-[32px]" />
               </div>
               <h4 className="text-[10px] sm:text-sm font-black text-rose-900 uppercase tracking-widest mb-2 sm:mb-4 italic">PROTECTION ACTIVE</h4>
               <p className="text-[10px] sm:text-xs text-rose-700/70 leading-relaxed font-medium">
                  Le moteur scanne vos mouvements toutes les heures pour détecter des sorties inhabituelles.
               </p>
            </Card>

            <Card className="border-none shadow-xl rounded-[28px] sm:rounded-[35px] bg-white p-6 sm:p-8 space-y-4 sm:space-y-6">
               <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <SlidersHorizontal size={12} /> Critères d'Anomalie
               </h4>
               <div className="space-y-3 sm:space-y-4">
                  {[
                     "Sorties hors statistiques",
                     "Mouvements nocturnes",
                     "Ruptures soudaines",
                     "Incohérences de stock"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                       <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                       <span className="text-[10px] sm:text-xs font-bold text-slate-700">{item}</span>
                    </div>
                  ))}
               </div>
            </Card>

            <div className="p-6 sm:p-8 rounded-[28px] sm:rounded-[35px] bg-gradient-to-br from-slate-800 to-slate-900 text-white space-y-3 sm:space-y-4 shadow-2xl">
               <p className="text-[9px] sm:text-[10px] font-black text-rose-400 uppercase tracking-widest">Conseil Pro</p>
               <p className="text-[10px] sm:text-xs text-slate-300 leading-relaxed italic">
                  "Une sensibilité de <b>3.0σ</b> est idéale pour la plupart des entrepôts."
               </p>
            </div>
         </div>
      </div>
    </div>
  )
}

function RotateCw(props: any) {
   return (
     <svg
       {...props}
       xmlns="http://www.w3.org/2000/svg"
       width="24"
       height="24"
       viewBox="0 0 24 24"
       fill="none"
       stroke="currentColor"
       strokeWidth="2"
       strokeLinecap="round"
       strokeLinejoin="round"
     >
       <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
       <path d="M21 3v5h-5" />
     </svg>
   )
}
