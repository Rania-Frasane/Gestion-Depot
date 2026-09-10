"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { fetchDashboardStats } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/PageHeader"
import {
  Box,
  TrendingUp,
  AlertCircle,
  ArrowLeftRight,
  ShoppingCart,
  ArrowRight,
  Brain,
  Sparkles,
  Download,
  Zap,
  ChevronRight,
} from "lucide-react"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Area, AreaChart, Line, LineChart, Pie, PieChart, Cell } from "recharts"
import { motion } from "framer-motion"

const defaultChartData = [
  { month: "Janvier", sales: 186, purchase: 80 },
  { month: "Février", sales: 305, purchase: 200 },
  { month: "Mars", sales: 237, purchase: 120 },
  { month: "Avril", sales: 73, purchase: 190 },
  { month: "Mai", sales: 209, purchase: 130 },
  { month: "Juin", sales: 214, purchase: 140 },
]

const chartConfig = {
  sales: {
    label: "Ventes",
    color: "#60a5fa",
  },
  purchase: {
    label: "Achats",
    color: "#a78bfa",
  },
} satisfies ChartConfig

const employeeAnalyticsData = [
  { month: "Jan", effectif: 45, presence: 92 },
  { month: "Fév", effectif: 48, presence: 94 },
  { month: "Mar", effectif: 49, presence: 91 },
  { month: "Avr", effectif: 52, presence: 95 },
  { month: "Mai", effectif: 55, presence: 96 },
  { month: "Jui", effectif: 58, presence: 98 },
]

const employeeConfig = {
  effectif: {
    label: "Effectif Total",
    color: "#34d399",
  },
  presence: {
    label: "Présence (%)",
    color: "#fbbf24",
  }
} satisfies ChartConfig

const commandesData = [
  { day: "Lun", commandes: 12 },
  { day: "Mar", commandes: 19 },
  { day: "Mer", commandes: 15 },
  { day: "Jeu", commandes: 22 },
  { day: "Ven", commandes: 28 },
  { day: "Sam", commandes: 14 },
  { day: "Dim", commandes: 5 },
]

const commandesConfig = {
  commandes: {
    label: "Commandes",
    color: "#f472b6",
  }
} satisfies ChartConfig

const transfertsData = [
  { name: "Complété", value: 45, color: "#6ee7b7" },
  { name: "En cours", value: 12, color: "#93c5fd" },
  { name: "Annulé", value: 3, color: "#fca5a5" },
]

const transfertsConfig = {
  value: {
    label: "Transferts",
    color: "#60a5fa",
  }
} satisfies ChartConfig

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } }
}

export default function Dashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dynamicChartData, setDynamicChartData] = useState<any[]>(defaultChartData)

  useEffect(() => {
    fetchDashboardStats().then(data => {
      setStats(data)
      if (data && data.monthly_sales) {
        const formattedData = data.monthly_sales.map((item: any) => {
          const date = new Date(item.month)
          const monthName = date.toLocaleString('fr-FR', { month: 'short' }).replace('.', '')
          return {
            month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
            sales: item.total || 0,
            purchase: item.purchase_total || 0
          }
        })
        if (formattedData.length > 0) {
          setDynamicChartData(formattedData)
        }
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <motion.div
      className="flex flex-col gap-8 w-full"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      <PageHeader
        title="Tableau de Bord"
        description="Vue d'ensemble de la performance opérationnelle et analytique du dépôt."
      />




      {/* Summary Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Valeur du Stock",
            value: loading ? "—" : `${stats?.stock_value?.toLocaleString() || 0} MAD`,
            desc: "Hausse modérée ce trimestre",
            trend: "+2.5%",
            isPositive: true,
            icon: Box,
          },
          {
            title: "Commandes (30j)",
            value: loading ? "—" : stats?.orders_count || 0,
            desc: "Par rapport au mois précédent",
            trend: "-4.1%",
            isPositive: false,
            icon: ShoppingCart,
          },
          {
            title: "Alertes Critiques",
            value: loading ? "—" : stats?.alerts_count || 0,
            desc: "Nécessite une action immédiate",
            trend: stats?.alerts_count > 0 ? "URGENT" : "Optimal",
            isPositive: stats?.alerts_count === 0,
            icon: AlertCircle,
          },
          {
            title: "Mouvements Physiques",
            value: loading ? "—" : stats?.movements_count || 0,
            desc: "Entrées et sorties cumulées",
            trend: "En hausse",
            isPositive: true,
            icon: ArrowLeftRight,
          }
        ].map((item, idx) => (
          <motion.div key={idx} variants={itemVariants}>
            <Card className="border border-slate-200/80 shadow-sm bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 pb-2">
                <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.title}</CardTitle>
                <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-slate-100 text-slate-600">
                  <item.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="text-2xl font-black text-slate-950 tracking-tight">
                  {loading ? <div className="h-7 w-24 bg-slate-100 animate-pulse rounded-lg" /> : item.value}
                </div>
                <p className="text-[10px] text-slate-450 mt-1.5 flex items-center gap-1.5 font-medium">
                  <span className={`font-extrabold ${item.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {item.trend}
                  </span>
                  <span className="text-slate-400">{item.desc}</span>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Sales/Purchase Chart (Shadcn UI Chart System) */}
        <motion.div className="lg:col-span-4" variants={itemVariants}>
          <Card className="border border-slate-200 shadow-sm bg-white">
            <CardHeader className="p-4 pb-1">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-900">
                    Activité Commerciale
                  </CardTitle>
                  <CardDescription className="text-[11px] text-slate-500">
                    Comparatif mensuel des ventes (noir) et des achats (gris) via shadcn/ui.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="font-bold border-slate-300 text-[10px] py-0.5 px-1.5">Flux Semestriel</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <ChartContainer config={chartConfig} className="h-[220px] w-full">
                <BarChart data={dynamicChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} stroke="#000" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    className="text-[10px] font-bold text-slate-400"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    className="text-[10px] font-bold text-slate-400"
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="sales" fill="var(--color-sales)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="purchase" fill="var(--color-purchase)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-row items-center justify-between border-t border-slate-100 p-3 px-4 text-[11px] text-slate-500">
              <div className="flex gap-1 font-bold text-slate-900 leading-none">
                Croissance de +5.2% ce mois <TrendingUp className="h-3 w-3 text-slate-900" />
              </div>
              <div className="leading-none text-[10px] font-medium text-slate-400">
                Mis à jour en temps réel
              </div>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Recent Mouvements Table */}
        <motion.div className="lg:col-span-3" variants={itemVariants}>
          <Card className="border border-slate-200 shadow-sm bg-white h-full flex flex-col justify-between">
            <div>
              <CardHeader className="p-4 pb-1 flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-900">Mouvements Récents</CardTitle>
                  <CardDescription className="text-[11px] text-slate-500">Les 5 dernières entrées ou sorties.</CardDescription>
                </div>
                <Badge variant="outline" className="font-bold border-black text-black text-[9px] py-0 px-1.5">Live</Badge>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {loading ? (
                    <div className="flex flex-col gap-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-9 w-full bg-slate-50 animate-pulse rounded-lg border border-slate-100" />
                      ))}
                    </div>
                  ) : stats?.recent_mouvements?.length > 0 ? (
                    stats.recent_mouvements.slice(0, 5).map((m: any, i: number) => (
                      <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2">
                          <div className={`h-1.5 w-1.5 rounded-full ${m.type_mouvement === 'ENTREE' ? 'bg-slate-900' : 'bg-slate-400'}`} />
                          <div>
                            <div className="text-xs font-bold text-slate-900 max-w-[150px] truncate">{m.produit_nom}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase">{new Date(m.date_mouvement).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-900 border-none font-bold text-[8px] py-0.5 px-1.5">
                            {m.type_mouvement}
                          </Badge>
                          <span className="text-xs font-black text-slate-900">{m.type_mouvement === 'SORTIE' ? '-' : '+'}{m.quantite}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-xs font-medium italic">Aucun mouvement récent.</div>
                  )}
                </div>
              </CardContent>
            </div>
            <CardFooter className="border-t border-slate-100 p-2">
              <Button variant="ghost" className="w-full text-xs text-slate-500 font-bold hover:text-black transition-colors py-1 h-auto">
                Tout l'historique <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* Employee Analytics Chart (Shadcn UI Chart System) */}
      <motion.div variants={itemVariants}>
        <Card className="border border-slate-200 shadow-sm bg-white">
          <CardHeader className="p-4 pb-1">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <CardTitle className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-900">
                  Dynamique Humaine
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-500">
                  Évolution mensuelle des effectifs et taux de présence opérationnelle (shadcn/ui charts).
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-bold border-slate-300 text-[10px] py-0.5 px-1.5">Analytique RH</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <ChartContainer config={employeeConfig} className="h-[220px] w-full">
              <AreaChart data={employeeAnalyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillEffectif" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fillPresence" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} stroke="#000" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                  className="text-[10px] font-bold text-slate-400"
                />
                <YAxis tickLine={false} axisLine={false} className="text-[10px] font-bold text-slate-400" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="effectif"
                  stroke="#34d399"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#fillEffectif)"
                />
                <Area
                  type="monotone"
                  dataKey="presence"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#fillPresence)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-row items-center justify-between border-t border-slate-100 p-3 px-4 text-[11px] text-slate-500">
            <div className="flex gap-1 font-bold text-slate-900 leading-none">
              Taux de présence moyen optimal à 94.3%
            </div>
            <div className="leading-none text-[10px] font-medium text-slate-400">
              Données de pointage consolidées
            </div>
          </CardFooter>
        </Card>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Commandes Line Chart (Shadcn UI Chart System) */}
        <motion.div variants={itemVariants}>
          <Card className="border border-slate-200 shadow-sm bg-white">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-900">
                Activité Hebdomadaire des Commandes
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500">
                Volume quotidien de transactions traitées cette semaine (shadcn/ui).
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <ChartContainer config={commandesConfig} className="h-[180px] w-full">
                <LineChart data={commandesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} stroke="#000" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    className="text-[10px] font-bold text-slate-400"
                  />
                  <YAxis tickLine={false} axisLine={false} className="text-[10px] font-bold text-slate-400" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="commandes"
                    stroke="var(--color-commandes)"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 1.5, fill: "#ffffff", stroke: "#f472b6" }}
                    activeDot={{ r: 5, strokeWidth: 0, fill: "#f472b6" }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Transferts Pie Chart (Shadcn UI Chart System) */}
        <motion.div variants={itemVariants}>
          <Card className="border border-slate-200 shadow-sm bg-white">
            <CardHeader className="p-4 pb-1">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-slate-900">
                Statuts Logistiques des Transferts
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-500">
                Répartition dynamique du traitement des bons (shadcn/ui).
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex justify-center items-center">
              <div className="relative h-[180px] w-full max-w-[240px] flex items-center justify-center">
                <ChartContainer config={transfertsConfig} className="h-[160px] w-full">
                  <PieChart>
                    <Pie
                      data={transfertsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {transfertsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  </PieChart>
                </ChartContainer>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-xl font-extrabold text-slate-900">60</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Flux</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
