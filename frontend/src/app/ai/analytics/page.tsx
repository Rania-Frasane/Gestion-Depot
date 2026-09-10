"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Users, 
  ArrowRight,
  Download,
  Calendar,
  Zap,
  Activity,
  PieChart,
  AreaChart as AreaChartIcon
} from "lucide-react"
import { fetchAiAnalytics } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Cell,
  PieChart as RePieChart,
  Pie
} from 'recharts'

export default function AiAnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAiAnalytics().then(res => {
      setData(res)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-screen text-brand-cyan">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-current"></div>
    </div>
  )

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-12 px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
           <div className="size-12 sm:size-16 rounded-[18px] sm:rounded-[24px] bg-brand-cyan flex items-center justify-center text-white shadow-xl shadow-brand-cyan/10 shrink-0">
              <BarChart3 size={24} className="sm:size-[32px]" />
           </div>
           <div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight italic uppercase">Analytique IA</h1>
              <p className="text-slate-500 font-medium text-xs sm:text-sm">Découvrez les tendances profondes de votre activité.</p>
           </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
           <Button variant="outline" className="w-full sm:w-auto rounded-2xl h-12 px-6 border-slate-200 gap-2 font-bold text-slate-600">
              <Calendar size={18} /> 30 Jours
           </Button>
           <Button className="w-full sm:w-auto rounded-2xl h-12 px-6 bg-brand-cyan hover:bg-brand-cyan/90 gap-2 shadow-lg shadow-brand-cyan/10">
              <Download size={18} /> Exporter
           </Button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
         <Card className="border-none shadow-xl rounded-[28px] sm:rounded-[35px] bg-brand-cyan text-white p-6 sm:p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <TrendingUp size={100} />
            </div>
            <div className="space-y-3 sm:space-y-4">
               <Badge className="bg-white/20 text-white border-none font-bold text-[10px]">PERFORMANCE</Badge>
               <h3 className="text-[10px] sm:text-sm font-bold uppercase tracking-widest text-brand-cyan">Chiffre d'Affaires</h3>
               <p className="text-3xl sm:text-4xl font-black italic">42,850 <span className="text-lg sm:text-xl">MAD</span></p>
               <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs sm:text-sm">
                  <TrendingUp size={16} /> +12.5% vs mois dernier
               </div>
            </div>
         </Card>

         <Card className="border-none shadow-xl rounded-[28px] sm:rounded-[35px] bg-white p-6 sm:p-8 border border-slate-100">
            <div className="space-y-3 sm:space-y-4">
               <div className="size-10 sm:size-12 rounded-xl sm:rounded-2xl bg-brand-cyan/10 flex items-center justify-center text-brand-cyan">
                  <Package size={20} className="sm:size-[24px]" />
               </div>
               <h3 className="text-[10px] sm:text-sm font-bold uppercase tracking-widest text-slate-400">Rotation Stock</h3>
               <p className="text-3xl sm:text-4xl font-black text-slate-900 italic">4.2x</p>
               <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] sm:text-sm">
                  <Activity size={16} /> Indice de performance optimal
               </div>
            </div>
         </Card>

         <Card className="border-none shadow-xl rounded-[28px] sm:rounded-[35px] bg-white p-6 sm:p-8 border border-slate-100 sm:col-span-2 lg:col-span-1">
            <div className="space-y-3 sm:space-y-4">
               <div className="size-10 sm:size-12 rounded-xl sm:rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Zap size={20} className="sm:size-[24px]" />
               </div>
               <h3 className="text-[10px] sm:text-sm font-bold uppercase tracking-widest text-slate-400">Alertes IA</h3>
               <p className="text-3xl sm:text-4xl font-black text-slate-900 italic">08</p>
               <div className="flex items-center gap-2 text-amber-600 font-bold text-[10px] sm:text-sm">
                  <Zap size={16} /> Anomalies détectées à vérifier
               </div>
            </div>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
         {/* Revenue Chart */}
         <Card className="border-none shadow-2xl rounded-[30px] sm:rounded-[40px] bg-white p-6 sm:p-10">
            <CardHeader className="p-0 mb-6 sm:mb-8 flex flex-row items-center justify-between">
               <div>
                  <CardTitle className="text-xl sm:text-2xl font-black italic text-slate-900 tracking-tight">TENDANCES REVENU</CardTitle>
                  <CardDescription className="font-medium text-xs sm:text-sm">Évolution quotidienne</CardDescription>
               </div>
               <div className="size-10 sm:size-12 rounded-xl sm:rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <AreaChartIcon size={20} className="sm:size-[24px]" />
               </div>
            </CardHeader>
            <div className="h-[250px] sm:h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.trends || []}>
                     <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9}} />
                     <Tooltip 
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                        itemStyle={{color: '#4f46e5', fontWeight: 'bold', fontSize: '12px'}}
                     />
                     <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </Card>

         {/* Top Products */}
         <Card className="border-none shadow-2xl rounded-[30px] sm:rounded-[40px] bg-white p-6 sm:p-10">
            <CardHeader className="p-0 mb-6 sm:mb-8 flex flex-row items-center justify-between">
               <div>
                  <CardTitle className="text-xl sm:text-2xl font-black italic text-slate-900 tracking-tight">TOP VENTES</CardTitle>
                  <CardDescription className="font-medium text-xs sm:text-sm">Articles les plus performants</CardDescription>
               </div>
               <div className="size-10 sm:size-12 rounded-xl sm:rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <PieChart size={20} className="sm:size-[24px]" />
               </div>
            </CardHeader>
            <div className="space-y-4 sm:space-y-6">
               {(data?.top_products || []).map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-100/50">
                     <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                        <div className="size-8 sm:size-10 rounded-lg sm:rounded-xl bg-white shadow-sm flex items-center justify-center font-black text-brand-cyan shrink-0 text-xs sm:text-sm">
                           {i + 1}
                        </div>
                        <div className="overflow-hidden">
                           <p className="font-black text-slate-900 truncate text-xs sm:text-sm">{p.nom}</p>
                           <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.code}</p>
                        </div>
                     </div>
                     <div className="text-right shrink-0">
                        <p className="font-black text-slate-900 text-xs sm:text-sm">{p.quantite} <span className="text-[9px] text-slate-400 font-bold">UNITÉS</span></p>
                        <div className="w-16 sm:w-24 h-1 bg-slate-200 rounded-full mt-1.5 overflow-hidden ml-auto">
                           <div className="h-full bg-brand-cyan rounded-full" style={{width: `${Math.min(100, (p.quantite / (data?.top_products[0]?.quantite || 1)) * 100)}%`}} />
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </Card>
      </div>

      {/* AI Insights Card */}
      <Card className="border-none shadow-2xl rounded-[30px] sm:rounded-[40px] bg-slate-900 text-white overflow-hidden p-6 sm:p-10 relative">
         <div className="absolute -bottom-10 -right-10 size-40 bg-brand-cyan/20 blur-[80px] rounded-full pointer-events-none" />
         <div className="flex flex-col lg:flex-row gap-6 sm:gap-10 items-center relative z-10">
            <div className="size-20 sm:size-32 rounded-[28px] sm:rounded-[40px] bg-brand-cyan flex items-center justify-center shrink-0 shadow-2xl shadow-brand-cyan/15">
               <Zap size={32} className="sm:size-[60px]" />
            </div>
            <div className="space-y-4 text-center lg:text-left">
               <div className="flex items-center justify-center lg:justify-start gap-3">
                  <Badge className="bg-brand-cyan text-white border-none font-bold text-[9px] sm:text-[10px]">INSIGHT IA</Badge>
                  <span className="text-slate-400 text-[8px] sm:text-[10px] font-bold uppercase tracking-widest">Généré il y a 5 min</span>
               </div>
               <h2 className="text-xl sm:text-3xl font-black italic tracking-tight">OPTIMISATION RECOMMANDÉE</h2>
               <p className="text-slate-400 text-sm sm:text-lg leading-relaxed max-w-3xl mx-auto lg:mx-0">
                  Basé sur l'analyse des 30 derniers jours, nous recommandons une augmentation du stock minimum de 15% pour les produits de la catégorie <b>"Électronique"</b>.
               </p>
               <Button className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 rounded-xl sm:rounded-2xl h-12 px-8 font-black gap-2 mt-2 sm:mt-4 text-sm transition-all hover:translate-x-1">
                  Appliquer <ArrowRight size={18} />
               </Button>
            </div>
         </div>
      </Card>
    </div>
  )
}
