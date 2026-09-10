"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { 
  Scan, 
  CheckCircle2, 
  AlertCircle, 
  Package, 
  RotateCw,
  Zap,
  Camera,
  Keyboard,
  Send,
  Plus,
  Briefcase,
  Target,
  RefreshCw,
  Minus
} from "lucide-react"
import { Html5Qrcode } from "html5-qrcode"
import { toast } from "sonner"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import Link from "next/link"
import { useRouter } from "next/navigation"

type ScanState = "idle" | "scanning" | "processing" | "error" | "manual" | "success"

export default function ScannerPage() {
  const router = useRouter()
  const [state, setState] = useState<ScanState>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [lastCode, setLastCode] = useState("")
  const [manualCode, setManualCode] = useState("")
  const [torchOn, setTorchOn] = useState(false)
  const [projets, setProjets] = useState<any[]>([])
  const [selectedProjet, setSelectedProjet] = useState<string>("")
  const [lastAssigned, setLastAssigned] = useState<any>(null)
  const [quantite, setQuantite] = useState(1)
  const [mouvement, setMouvement] = useState<"entree" | "sortie" | "id">("id")

  const scannerRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    api.get('projets/').then(res => setProjets(res.data))
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error)
      }
    }
  }, [])

  const startScanner = async () => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader")
      }
      
      setState("scanning")
      const cameras = await Html5Qrcode.getCameras()
      const config = {
        fps: 30,
        qrbox: { width: 280, height: 280 },
        aspectRatio: 1.0,
      }

      if (cameras && cameras.length > 0) {
        const cameraId = cameras[cameras.length - 1].id
        await scannerRef.current.start(cameraId, config, onScanSuccess, onScanFailure)
      } else {
        await scannerRef.current.start({ facingMode: "environment" }, config, onScanSuccess, onScanFailure)
      }
    } catch (err) {
      console.error(err)
      toast.error("Caméra inaccessible")
      setState("idle")
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop()
    }
  }

  const toggleTorch = async () => {
    if (scannerRef.current?.isScanning) {
        const newState = !torchOn
        try {
            await scannerRef.current.applyVideoConstraints({
                // @ts-ignore
                torch: newState
            })
            setTorchOn(newState)
        } catch (e) {
            toast.error("Flash non supporté")
        }
    }
  }

  async function onScanSuccess(decodedText: string) {
    if (state === "processing") return
    await stopScanner()
    setState("processing")
    processCode(decodedText)
  }

  async function processCode(code: string) {
    setLastCode(code)
    try {
      const response = await api.get(`produits/`, { params: { search: code } })
      const products = response.data
      const match = products.find((p: any) => p.code === code || p.code_barre === code)

      if (match) {
        // Handle Project Assignment if selected
        if (selectedProjet) {
           await api.patch(`produits/${match.id}/`, { projet: selectedProjet })
        }

        // Handle Stock Movement if selected
        if (mouvement !== "id") {
           await api.post("scanner/", {
              code: code,
              action: mouvement,
              quantite: quantite
           })
           const updated = (await api.get(`produits/${match.id}/`)).data
           setLastAssigned(updated)
           setState("success")
           toast.success("Mouvement enregistré", { description: `${match.nom} mis à jour (${mouvement === 'entree' ? '+' : '-'}${quantite})` })
        } else if (selectedProjet) {
           // Assignment only mode
           const updated = (await api.get(`produits/${match.id}/`)).data
           setLastAssigned(updated)
           setState("success")
           toast.success("Affectation réussie")
        } else {
           // Identification only
           toast.success("Produit identifié")
           router.push(`/produits/${match.id}`)
        }
      } else {
        setState("error")
        setErrorMsg(`Le produit avec le code "${code}" est introuvable.`)
      }
    } catch (err: any) {
      setState("error")
      setErrorMsg(err.response?.data?.error || err.response?.data?.detail || "Erreur de communication avec le serveur.")
    }
  }

  function onScanFailure(error: any) {}

  const handleRegenerateQr = async (id: number) => {
    try {
      const res = await api.post(`produits/${id}/regenerate-qr/`)
      if (res.data.success) {
        setLastAssigned(res.data.produit)
        toast.success("Code QR régénéré")
      }
    } catch (error) {
      toast.error("Erreur de régénération")
    }
  }

  const handleRetry = () => {
    setState("idle")
    setErrorMsg("")
    setLastCode("")
    setLastAssigned(null)
    startScanner()
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualCode.trim()) {
      setState("processing")
      processCode(manualCode)
      setManualCode("")
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20 pt-10">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900">
              Scanner
            </h1>
            <p className="text-neutral-500 text-lg max-w-xl font-light">
              Identifiez ou assignez vos produits instantanément en utilisant la caméra ou la saisie manuelle.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <Button 
                variant="outline" 
                className={`h-11 px-5 rounded-full gap-2 transition-all ${torchOn ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'}`} 
                onClick={toggleTorch} 
                disabled={state !== "scanning"}
             >
                <Zap size={16} className={torchOn ? 'fill-current text-amber-400' : ''} /> Flash
             </Button>
             <Button 
                variant="outline" 
                className="h-11 px-5 rounded-full gap-2 bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50" 
                onClick={() => setState(state === "manual" ? "idle" : "manual")}
             >
                {state === "manual" ? <Camera size={16} /> : <Keyboard size={16} />} 
                {state === "manual" ? "Passer en mode Caméra" : "Saisie Manuelle"}
             </Button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Scanner Area */}
          <div className="md:col-span-2">
            <Card className="border border-neutral-200/60 shadow-sm rounded-3xl overflow-hidden bg-white min-h-[450px] flex flex-col relative h-full">
               <div className="flex-1 relative bg-neutral-50 flex items-center justify-center h-full min-h-[450px]">
                  <div id="reader" className="absolute inset-0 w-full h-full bg-neutral-100/50"></div>
                  
                  {state === "idle" && (
                     <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/40 backdrop-blur-md p-10 text-center">
                        <div className="h-20 w-20 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-6 border border-neutral-200">
                           <Scan size={32} />
                        </div>
                        <h2 className="text-2xl font-semibold text-neutral-900 mb-6">Prêt à numériser</h2>
                        <Button 
                          className="h-12 px-8 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-all shadow-md font-medium" 
                          onClick={startScanner}
                        >
                           Activer le scanner
                        </Button>
                     </div>
                  )}

                  {state === "manual" && (
                     <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6 bg-white/80 backdrop-blur-xl">
                        <form onSubmit={handleManualSubmit} className="w-full max-w-sm space-y-6 text-center animate-in zoom-in-95 duration-300">
                           <h3 className="text-2xl font-semibold text-neutral-900 mb-2">Saisie Manuelle</h3>
                           <p className="text-sm text-neutral-500 mb-6">Saisissez le code barre ou le SKU manuellement.</p>
                           <div className="relative">
                              <Input 
                                autoFocus 
                                placeholder="SKU-XXXX" 
                                className="h-14 rounded-2xl text-lg font-medium px-5 pr-14 border-neutral-200 focus-visible:ring-0 focus-visible:border-neutral-400 bg-white" 
                                value={manualCode} 
                                onChange={(e) => setManualCode(e.target.value)} 
                              />
                              <Button size="icon" variant="ghost" className="absolute right-2 top-2 rounded-xl h-10 w-10 text-neutral-500 hover:text-neutral-900" type="submit">
                                <Send size={18} />
                              </Button>
                           </div>
                           <Button variant="ghost" className="text-neutral-500 hover:text-neutral-900" onClick={() => setState("idle")}>
                              Annuler
                           </Button>
                        </form>
                     </div>
                  )}

                  {state === "processing" && (
                     <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-xl text-center">
                        <div className="h-12 w-12 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mb-6" />
                        <h3 className="text-lg font-semibold text-neutral-900">Recherche en cours...</h3>
                     </div>
                  )}

                  {state === "scanning" && (
                     <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                        {/* Minimalist HUD */}
                        <div className="relative size-64 border-[1.5px] border-neutral-400/30 rounded-3xl">
                           <div className="absolute top-0 left-0 size-8 border-t-2 border-l-2 border-neutral-900 rounded-tl-3xl" />
                           <div className="absolute top-0 right-0 size-8 border-t-2 border-r-2 border-neutral-900 rounded-tr-3xl" />
                           <div className="absolute bottom-0 left-0 size-8 border-b-2 border-l-2 border-neutral-900 rounded-bl-3xl" />
                           <div className="absolute bottom-0 right-0 size-8 border-b-2 border-r-2 border-neutral-900 rounded-br-3xl" />
                           <div className="absolute inset-x-4 top-0 h-[1px] bg-neutral-900/50 shadow-[0_0_10px_rgba(0,0,0,0.5)] animate-scan-line" />
                        </div>
                     </div>
                  )}
               </div>
            </Card>
          </div>

          {/* Configuration Panel */}
          <div className="space-y-6 h-full">
            <Card className="border border-neutral-200/60 shadow-sm rounded-3xl bg-white p-8 h-full flex flex-col">
               <div className="flex items-center gap-3 text-neutral-500 mb-8">
                  <Briefcase className="h-5 w-5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Configuration</span>
               </div>
               
               <div className="space-y-3 mb-8">
                  <label className="text-sm font-medium text-neutral-700">Projet Cible (Assignation)</label>
                  <select 
                    className="w-full h-12 rounded-xl border border-neutral-200 bg-white px-4 text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20 transition-all appearance-none"
                    value={selectedProjet}
                    onChange={(e) => setSelectedProjet(e.target.value)}
                  >
                    <option value="">Lecture uniquement (Fiche Profil)</option>
                    {projets.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                  </select>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {selectedProjet 
                       ? "Le produit scanné sera automatiquement assigné au projet sélectionné." 
                       : "Mode consultation : ouvre la fiche du produit."}
                  </p>
               </div>

               <Separator className="bg-neutral-100 mb-8" />

               <div className="space-y-4 mb-8">
                  <label className="text-sm font-medium text-neutral-700">Opération de Stock</label>
                  <div className="grid grid-cols-3 gap-2">
                     <Button 
                       variant={mouvement === "id" ? "default" : "outline"} 
                       className={`h-11 rounded-lg text-xs transition-colors ${mouvement === 'id' ? 'bg-neutral-900 text-white hover:bg-neutral-800' : 'text-neutral-600 border-neutral-200 hover:bg-neutral-50'}`}
                       onClick={() => setMouvement("id")}
                     >
                        Lecture
                     </Button>
                     <Button 
                       variant={mouvement === "entree" ? "default" : "outline"} 
                       className={`h-11 rounded-lg text-xs transition-colors ${mouvement === 'entree' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'text-neutral-600 border-neutral-200 hover:bg-neutral-50'}`}
                       onClick={() => setMouvement("entree")}
                     >
                        Entrée
                     </Button>
                     <Button 
                       variant={mouvement === "sortie" ? "default" : "outline"} 
                       className={`h-11 rounded-lg text-xs transition-colors ${mouvement === 'sortie' ? 'bg-rose-600 text-white hover:bg-rose-700' : 'text-neutral-600 border-neutral-200 hover:bg-neutral-50'}`}
                       onClick={() => setMouvement("sortie")}
                     >
                        Sortie
                     </Button>
                  </div>
               </div>

               {mouvement !== "id" && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                     <label className="text-sm font-medium text-neutral-700">Quantité</label>
                     <div className="flex items-center gap-3">
                        <Button variant="outline" className="h-11 w-11 rounded-xl border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 p-0" onClick={() => setQuantite(Math.max(1, quantite - 1))}>
                           <Minus size={16} />
                        </Button>
                        <Input 
                          type="number" 
                          value={quantite} 
                          onChange={(e) => setQuantite(parseInt(e.target.value) || 1)} 
                          className="h-11 text-center text-lg font-medium rounded-xl border-neutral-200 focus-visible:ring-0 focus-visible:border-neutral-400"
                        />
                        <Button variant="outline" className="h-11 w-11 rounded-xl border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 p-0" onClick={() => setQuantite(quantite + 1)}>
                           <Plus size={16} />
                        </Button>
                     </div>
                  </div>
               )}

               <div className="mt-auto pt-8">
                 <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-100 flex gap-3">
                    <Target className="text-neutral-400 h-5 w-5 shrink-0" />
                    <div className="space-y-1">
                       <p className="font-semibold text-neutral-900 text-sm">Récapitulatif de l'action</p>
                       <p className="text-xs text-neutral-500 font-medium">
                          {mouvement === "id" ? "Consultation simple" : `${mouvement === 'entree' ? 'Ajout' : 'Retrait'} de ${quantite} unité(s)`}
                          {selectedProjet && ` • Assignation projet en cours`}
                       </p>
                    </div>
                 </div>
               </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Error Dialog */}
      <Dialog open={state === "error"} onOpenChange={(open) => !open && handleRetry()}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl border border-neutral-200 p-8 text-center bg-white shadow-lg">
          <div className="mx-auto h-16 w-16 rounded-full bg-rose-50 flex items-center justify-center mb-6">
             <AlertCircle className="h-8 w-8 text-rose-500" />
          </div>
          <h2 className="text-2xl font-semibold text-neutral-900 mb-2">Non trouvé</h2>
          <p className="text-neutral-500 text-sm mb-8 leading-relaxed">
            {errorMsg}
          </p>
          <div className="flex flex-col gap-3 w-full">
            <Button size="lg" className="h-12 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 font-medium" onClick={handleRetry}>
              Réessayer
            </Button>
            <Link href={`/produits`} className="w-full">
              <Button variant="outline" size="lg" className="w-full h-12 rounded-xl border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 font-medium">
                Créer ce produit
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={state === "success" && !!lastAssigned} onOpenChange={(open) => !open && handleRetry()}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl border border-neutral-200 p-0 overflow-hidden bg-white shadow-lg">
          <div className="p-8">
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-6">
              <CheckCircle2 size={16} /> Scanné avec succès
            </div>
            
            <div className="flex gap-5 mb-8">
              <div className="h-20 w-20 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center overflow-hidden shrink-0">
                {lastAssigned?.image ? (
                  <img src={lastAssigned.image} className="h-full w-full object-cover" alt="Produit" />
                ) : (
                  <Package className="h-8 w-8 text-neutral-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold text-neutral-900 leading-tight mb-2 truncate">{lastAssigned?.nom}</h3>
                <div className="flex gap-2 mb-2">
                   <Badge variant="outline" className="font-mono text-[10px] text-neutral-500 bg-neutral-50 border-neutral-200 rounded-md px-2">{lastAssigned?.code}</Badge>
                   <Badge variant="secondary" className="text-[10px] rounded-md px-2 font-medium">{lastAssigned?.categorie_nom || "Général"}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
               <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
                  <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">Stock Actuel</p>
                  <p className="text-xl font-semibold text-neutral-900">{lastAssigned?.stock_actuel}</p>
               </div>
               <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
                  <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">Projet Cible</p>
                  <p className="text-sm font-semibold text-neutral-900 truncate mt-1">{lastAssigned?.projet_nom || "Aucun"}</p>
               </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button size="lg" className="h-12 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 font-medium" onClick={handleRetry}>
                 Continuer le scan
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-11 rounded-xl text-xs font-medium text-neutral-600 border-neutral-200 hover:bg-neutral-50" onClick={() => handleRegenerateQr(lastAssigned.id)}>
                   <RefreshCw size={14} className="mr-2" /> Régénérer QR
                </Button>
                <Link href={`/produits/${lastAssigned?.id}`} className="w-full">
                  <Button variant="outline" className="w-full h-11 rounded-xl text-xs font-medium border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900">
                     Ouvrir la Fiche
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @keyframes scan-line { 0% { top: 5%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 95%; opacity: 0; } }
        .animate-scan-line { animation: scan-line 2.5s ease-in-out infinite; }
        #reader video { object-fit: cover !important; width: 100% !important; height: 100% !important; border-radius: 24px; }
      `}</style>
    </div>
  )
}
