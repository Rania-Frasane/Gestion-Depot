"use client"

import * as React from "react"
import { Activity, Star, TrendingUp, Users, Target, Award } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { fetchEmployePerformance } from "@/lib/api"
import { Loader2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
export default function PerformanceEmployesPage() {
  const router = useRouter()
  const [employes, setEmployes] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchEmployePerformance().then(data => {
      setEmployes(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-8 py-8 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
           <button 
             onClick={() => router.push('/employes')}
             className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors mb-2"
           >
             <ArrowLeft className="h-4 w-4" /> Retour à l'annuaire
           </button>
           <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
             <Activity className="h-10 w-10 text-primary" />
             Performance RH
           </h1>
           <p className="text-muted-foreground text-lg">Suivi des indicateurs clés et de l'activité opérationnelle.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="p-8 border-b border-slate-50">
            <CardTitle className="text-2xl font-black">Top Performeurs</CardTitle>
            <CardDescription>Classement basé sur le volume de scans et la précision.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-8 p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="size-10 animate-spin text-primary" />
                <p className="text-slate-400 font-medium">Calcul des statistiques...</p>
              </div>
            ) : employes.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <Users size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-500 font-bold">Aucune donnée disponible</p>
              </div>
            ) : (
              employes.map((e: any, index: number) => (
                <EmployeeRow 
                  key={e.id} 
                  rank={index + 1}
                  name={`${e.prenom} ${e.nom}`} 
                  role={e.poste_nom} 
                  score={e.score}
                  scans={e.scans}
                  photo={e.photo}
                />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Objectif Global</CardTitle>
            <CardDescription>Progression vers les objectifs du trimestre.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-6">
            <div className="relative size-40 mb-6">
              <svg className="size-full" viewBox="0 0 100 100">
                <circle className="text-slate-100" strokeWidth="10" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                <circle className="text-blue-600" strokeWidth="10" strokeDasharray={251.2} strokeDashoffset={251.2 * (1 - 0.78)} strokeLinecap="round" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">78%</span>
                <span className="text-xs text-muted-foreground">Atteint</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium mb-1">Efficacité Logistique</p>
              <p className="text-xs text-muted-foreground">+5% par rapport au mois dernier</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function EmployeeRow({ rank, name, role, score, scans, photo }: any) {
  const isTop3 = rank <= 3
  return (
    <div className="flex items-center gap-6 group">
      <div className={`size-10 rounded-xl flex items-center justify-center font-black text-sm ${
        rank === 1 ? 'bg-amber-100 text-amber-600' : 
        rank === 2 ? 'bg-slate-100 text-slate-600' : 
        rank === 3 ? 'bg-orange-100 text-orange-600' : 
        'text-slate-400'
      }`}>
        #{rank}
      </div>
      <Avatar className="size-14 border-2 border-white shadow-sm bg-neutral-900 text-white flex items-center justify-center">
        {photo ? (
          <AvatarImage src={photo} className="object-cover" />
        ) : (
          <AvatarFallback className="bg-transparent text-white font-black text-lg">{name.charAt(0)}</AvatarFallback>
        )}
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors">{name}</h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{role}</p>
          </div>
          <div className="text-right">
            <span className={`text-xl font-black ${score > 90 ? 'text-emerald-500' : 'text-slate-900'}`}>{score}%</span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Efficacité</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Progress value={score} className={`h-2 flex-1 rounded-full ${score > 90 ? 'bg-emerald-100' : ''}`} />
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg">
             <Target size={12} className="text-slate-400" />
             <span className="text-xs font-black text-slate-700">{scans}</span>
             <span className="text-[10px] font-bold text-slate-400">SCANS</span>
          </div>
        </div>
      </div>
    </div>
  )
}
