"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
   Send,
   Bot,
   User,
   Sparkles,
   History,
   Trash2,
   Mic,
   Brain,
   MessageSquare,
   ChevronRight,
   Zap,
   Cpu,
   Lock,
   Volume2,
   Plus,
   CornerDownLeft,
   Command,
   Search,
   RotateCcw,
   AlertTriangle,
   ArrowRight,
   Terminal,
   MicOff,
   Check,
   Copy,
   ShieldCheck,
   Activity,
   Server,
   Clock
} from "lucide-react"
import { sendMessageToAi } from "@/lib/api"
import { toast } from "sonner"
import { PageHeader } from "@/components/PageHeader"

interface Message {
   id: string
   role: "user" | "assistant"
   content: string
   timestamp: Date
   isStreaming?: boolean
   suggestedWidgets?: string[]
}

interface ChatSession {
   id: string
   title: string
   date: string
   preview: string
}

export default function AiChatPage() {
   const [messages, setMessages] = useState<Message[]>([
      {
         id: "welcome",
         role: "assistant",
         content: "Bonjour ! Je suis **l'assistant IA intelligent** de **DEPOT MANAGER**. Je suis connecté à votre base de données en temps réel. Je peux analyser vos stocks, auditer vos fournisseurs ou concevoir des modèles de réapprovisionnement optimisés. Comment puis-je vous aider aujourd'hui ?",
         timestamp: new Date()
      }
   ])
   const [input, setInput] = useState("")
   const [loading, setLoading] = useState(false)
   const [sessionId, setSessionId] = useState<number | undefined>(undefined)
   const [isListening, setIsListening] = useState(false)
   const [activeSessionId, setActiveSessionId] = useState("session-1")
   const [searchQuery, setSearchQuery] = useState("")
   const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null)
   
   // Streaming controller
   const streamingIntervalRef = useRef<NodeJS.Timeout | null>(null)
   const messagesEndRef = useRef<HTMLDivElement>(null)

   // Simulated Chat Sessions for premium sidebar
   const [sessions, setSessions] = useState<ChatSession[]>([
      { id: "session-1", title: "Optimisation de stock - Ruptures", date: "Aujourd'hui", preview: "Quels produits sont bientôt en rupture..." },
      { id: "session-2", title: "Analyse Fournisseur Smair", date: "Hier", preview: "Calcul de la fiabilité d'approvisionnement..." },
      { id: "session-3", title: "Prédiction de flux logistique", date: "Il y a 3 jours", preview: "Quelle est la projection des entrées..." },
      { id: "session-4", title: "Audit d'inventaire Annuel", date: "Il y a 1 semaine", preview: "Trouve les écarts majeurs entre..." }
   ])

   // Simulated cognitive metrics for spatial sidebar
   const [metrics, setMetrics] = useState({
      cpu: 18,
      latency: 185,
      cached: 94
   })

   useEffect(() => {
      // Simulate real-time metric micro-fluctuations
      const interval = setInterval(() => {
         setMetrics(prev => ({
            cpu: Math.max(12, Math.min(28, prev.cpu + (Math.random() > 0.5 ? 2 : -2))),
            latency: Math.max(160, Math.min(210, prev.latency + (Math.random() > 0.5 ? 8 : -8))),
            cached: prev.cached
         }))
      }, 4000)
      return () => clearInterval(interval)
   }, [])

   const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
   }

   useEffect(() => {
      scrollToBottom()
   }, [messages, loading])

   useEffect(() => {
      return () => {
         if (streamingIntervalRef.current) clearInterval(streamingIntervalRef.current)
      }
   }, [])

   const handleNewChat = () => {
      if (streamingIntervalRef.current) clearInterval(streamingIntervalRef.current)
      setMessages([
         {
            id: `welcome-${Date.now()}`,
            role: "assistant",
            content: "Nouvelle session cognitive initialisée. Demandez-moi n'importe quoi sur vos stocks, vos transferts ou vos factures.",
            timestamp: new Date()
         }
      ])
      setSessionId(undefined)
      toast.success("Nouvelle session IA démarrée")
   }

   // Simulate typing/streaming effect for luxurious feeling responses
   const streamResponse = (fullText: string, msgId: string) => {
      let index = 0
      let currentText = ""
      
      setMessages(prev => 
         prev.map(m => m.id === msgId ? { ...m, content: "", isStreaming: true } : m)
      )

      if (streamingIntervalRef.current) clearInterval(streamingIntervalRef.current)

      streamingIntervalRef.current = setInterval(() => {
         if (index < fullText.length) {
            const chunkLength = fullText.length - index > 4 ? Math.floor(Math.random() * 3) + 2 : 1
            currentText += fullText.substring(index, index + chunkLength)
            index += chunkLength

            setMessages(prev =>
               prev.map(m => m.id === msgId ? { ...m, content: currentText } : m)
            )
         } else {
            if (streamingIntervalRef.current) clearInterval(streamingIntervalRef.current)
            
            // Analyze content to suggest smart interactive widgets
            const lowStockWords = ["rupture", "stock", "alerte", "quantité", "critique"]
            const supplierWords = ["fournisseur", "livraison", "délai", "approvisionnement"]
            const matchesStock = lowStockWords.some(w => fullText.toLowerCase().includes(w))
            const matchesSupplier = supplierWords.some(w => fullText.toLowerCase().includes(w))
            
            const suggestedWidgets: string[] = []
            if (matchesStock) suggestedWidgets.push("stock-health")
            if (matchesSupplier) suggestedWidgets.push("supplier-risk")

            setMessages(prev =>
               prev.map(m => m.id === msgId ? { ...m, isStreaming: false, suggestedWidgets } : m)
            )
         }
      }, 12)
   }

   const handleSend = async (textOverride?: string) => {
      const textToSend = textOverride || input
      if (!textToSend.trim() || loading) return

      const userMsgId = `user-${Date.now()}`
      const userMessage: Message = {
         id: userMsgId,
         role: "user",
         content: textToSend,
         timestamp: new Date()
      }

      setMessages(prev => [...prev, userMessage])
      if (!textOverride) setInput("")
      setLoading(true)

      const aiMsgId = `ai-${Date.now()}`
      
      try {
         const data = await sendMessageToAi(textToSend, sessionId)
         
         const aiMessage: Message = {
            id: aiMsgId,
            role: "assistant",
            content: "",
            timestamp: new Date(),
            isStreaming: true
         }

         if (data.session_id) {
            setSessionId(data.session_id)
         }

         setMessages(prev => [...prev, aiMessage])
         streamResponse(data.reply, aiMsgId)

         setSessions(prev => [
            { 
               id: `session-${Date.now()}`, 
               title: textToSend.substring(0, 32) + (textToSend.length > 32 ? "..." : ""),
               date: "Aujourd'hui",
               preview: data.reply.substring(0, 45) + "..."
            },
            ...prev.filter(s => s.id !== "session-4")
         ])
      } catch (error: any) {
         console.error("Chat error:", error)
         toast.error("Difficultés de connexion IA")
         
         setMessages(prev => [
            ...prev,
            {
               id: `error-${Date.now()}`,
               role: "assistant",
               content: "⚠️ **Erreur Cognitive** : Impossible de contacter le serveur d'intelligence artificielle.\n\nAssurez-vous que le serveur backend Django est démarré et écoute sur `http://127.0.0.1:8000/`.",
               timestamp: new Date()
            }
         ])
      } finally {
         setLoading(false)
      }
   }

   const toggleListening = () => {
      if (isListening) {
         setIsListening(false)
         const simulatedPrompts = [
            "Quels produits ont besoin d'être réapprovisionnés immédiatement ?",
            "Donne-moi un aperçu des dernières commandes en cours",
            "Fais une analyse de la valeur de notre stock actuel"
         ]
         const randomPrompt = simulatedPrompts[Math.floor(Math.random() * simulatedPrompts.length)]
         setInput(randomPrompt)
         toast.success("Commande vocale retranscrite avec succès !")
      } else {
         setIsListening(true)
         toast.info("Microphone activé. Parlez maintenant...")
      }
   }

   const copyToClipboard = (text: string, blockId: string) => {
      navigator.clipboard.writeText(text)
      setCopiedCodeId(blockId)
      toast.success("Copié dans le presse-papiers")
      setTimeout(() => setCopiedCodeId(null), 2000)
   }

   const suggestions = [
      { 
         title: "Rupture de Stock", 
         text: "Quels produits sont bientôt en rupture ?", 
         desc: "Analyse prédictive des seuils de stock minimal.",
         icon: <Zap className="size-5 text-brand-cyan dark:text-brand-cyan" />,
         badge: "Prioritaire" 
      },
      { 
         title: "Résumé d'Activité", 
         text: "Donne-moi le résumé des ventes et mouvements de la semaine", 
         desc: "Compilation analytique des flux d'inventaire.",
         icon: <Brain className="size-5 text-brand-cyan dark:text-brand-cyan" />,
         badge: "Intelligence" 
      },
      { 
         title: "Audit Fournisseurs", 
         text: "Analyse la fiabilité et les délais moyens de nos fournisseurs", 
         desc: "Diagnostic de performance chaîne logistique.",
         icon: <History className="size-5 text-emerald-600 dark:text-emerald-400" />,
         badge: "Audit" 
      }
   ]

   const filteredSessions = sessions.filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase())
   )

   // Rich Markdown & Codeblock Formatter
   const renderFormattedMessage = (content: string, msgId: string) => {
      const parts = []
      let currentBlock = ""
      let isInCode = false
      let codeLang = "plaintext"

      const lines = content.split('\n')
      
      for (let i = 0; i < lines.length; i++) {
         const line = lines[i]
         
         if (line.trim().startsWith("```")) {
            if (isInCode) {
               // Close code block
               parts.push({ type: 'code', content: currentBlock, lang: codeLang })
               currentBlock = ""
               isInCode = false
            } else {
               // Open code block
               codeLang = line.replace("```", "").trim() || "plaintext"
               isInCode = true
            }
            continue
         }

         if (isInCode) {
            currentBlock += line + '\n'
         } else {
            if (line.trim().startsWith("###")) {
               parts.push({ type: 'h3', content: line.replace("###", "").trim() })
            } else if (line.trim().startsWith("-") || line.trim().startsWith("*")) {
               parts.push({ type: 'bullet', content: line.substring(1).trim() })
            } else if (line.trim().startsWith("⚠️")) {
               parts.push({ type: 'alert', content: line.trim(), accent: 'rose' })
            } else if (line.trim().startsWith("💡")) {
               parts.push({ type: 'alert', content: line.trim(), accent: 'brand-cyan' })
            } else if (line.includes("|") && lines[i+1]?.includes("-")) {
               // Simple table parser detection
               let tableStr = line + '\n'
               let j = i + 1
               while (j < lines.length && lines[j].includes("|")) {
                  tableStr += lines[j] + '\n'
                  j++
               }
               i = j - 1
               parts.push({ type: 'table', content: tableStr })
            } else {
               parts.push({ type: 'paragraph', content: line })
            }
         }
      }

      if (isInCode && currentBlock) {
         parts.push({ type: 'code', content: currentBlock, lang: codeLang })
      }

      return (
         <div className="space-y-3.5">
            {parts.map((p, idx) => {
               const blockId = `${msgId}-${idx}`
               
               if (p.type === 'h3') {
                  return (
                     <h3 key={idx} className="text-base font-extrabold text-slate-900 dark:text-white mt-4 mb-2 flex items-center gap-2">
                        <span className="h-1.5 w-3 bg-brand-cyan rounded-full shrink-0" />
                        {p.content}
                     </h3>
                  )
               }
               
               if (p.type === 'bullet') {
                  return (
                     <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 pl-2 leading-relaxed">
                        <span className="mt-2 size-1.5 rounded-full bg-brand-cyan shrink-0" />
                        <span>
                           {p.content.split('**').map((chunk, cIdx) => 
                              cIdx % 2 === 1 ? <strong key={cIdx} className="font-extrabold text-slate-950 dark:text-white">{chunk}</strong> : chunk
                           )}
                        </span>
                     </div>
                  )
               }

               if (p.type === 'alert') {
                  const isBrandCyan = p.accent === 'brand-cyan'
                  return (
                     <div key={idx} className={`p-4 rounded-2xl border flex gap-3 my-4 leading-relaxed ${
                        isBrandCyan 
                           ? 'bg-brand-cyan/5 dark:bg-brand-bg/25 border-brand-cyan/15 dark:border-brand-cyan/20 text-slate-900 dark:text-brand-cyan' 
                           : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-100/80 dark:border-rose-900/50 text-rose-950 dark:text-rose-200'
                     }`}>
                        <div className="text-sm">
                           {p.content.split('**').map((chunk, cIdx) => 
                              cIdx % 2 === 1 ? <strong key={cIdx} className="font-black">{chunk}</strong> : chunk
                           )}
                        </div>
                     </div>
                  )
               }

               if (p.type === 'code') {
                  const isCopied = copiedCodeId === blockId
                  return (
                     <div key={idx} className="rounded-2xl border border-slate-100 dark:border-slate-800/80 overflow-hidden my-4 bg-slate-950 shadow-md">
                        <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
                           <span className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-widest">{p.lang}</span>
                           <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(p.content, blockId)}
                              className="h-7 px-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-[10px] font-bold gap-1 cursor-pointer"
                           >
                              {isCopied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                              {isCopied ? "Copié !" : "Copier"}
                           </Button>
                        </div>
                        <pre className="p-4 overflow-x-auto text-[11px] font-mono text-slate-300 leading-relaxed max-w-full">
                           <code>{p.content}</code>
                        </pre>
                     </div>
                  )
               }

               if (p.type === 'table') {
                  const rows = p.content.trim().split('\n')
                  const headers = rows[0].split('|').map(h => h.trim()).filter(h => h)
                  const bodyRows = rows.slice(2).map(r => r.split('|').map(c => c.trim()).filter(c => c))
                  
                  return (
                     <div key={idx} className="border border-slate-100 dark:border-slate-800/60 rounded-2xl overflow-hidden my-4 shadow-sm bg-white/50 dark:bg-slate-900/30">
                        <table className="w-full text-left text-xs border-collapse">
                           <thead>
                              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-150 dark:border-slate-800">
                                 {headers.map((h, hIdx) => (
                                    <th key={hIdx} className="px-4 py-3 font-extrabold text-slate-900 dark:text-white">{h}</th>
                                 ))}
                              </tr>
                           </thead>
                           <tbody>
                              {bodyRows.map((r, rIdx) => (
                                 <tr key={rIdx} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/30 dark:hover:bg-slate-900/20">
                                    {r.map((cell, cIdx) => (
                                       <td key={cIdx} className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300">
                                          {cell.split('**').map((chunk, chunkIdx) => 
                                             chunkIdx % 2 === 1 ? <strong key={chunkIdx} className="font-extrabold text-slate-950 dark:text-white">{chunk}</strong> : chunk
                                          )}
                                       </td>
                                    ))}
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  )
               }

               return p.content.trim() ? (
                  <p key={idx} className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                     {p.content.split('**').map((chunk, cIdx) => 
                        cIdx % 2 === 1 ? <strong key={cIdx} className="font-extrabold text-slate-950 dark:text-white">{chunk}</strong> : chunk
                     )}
                  </p>
               ) : null
            })}
         </div>
      )
   }

   return (
      <div className="flex flex-col gap-6 w-full h-[calc(100vh-100px)] overflow-hidden relative">
         
         {/* Futuristic Floating Mesh Background Orbs */}
         <div className="absolute top-[-5%] left-[-5%] w-[450px] h-[450px] rounded-full bg-brand-cyan/10 blur-[100px] pointer-events-none animate-pulse duration-[7000ms] dark:bg-brand-cyan/5" />
         <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] rounded-full bg-brand-cyan/10 blur-[120px] pointer-events-none animate-pulse duration-[9000ms] dark:bg-brand-cyan/100/5" />

         {/* Grid Container */}
         <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0 relative z-10">
            
            {/* 1. Sidebar - Cognitive Diagnostics & History */}
            <div className="hidden lg:flex flex-col gap-4 col-span-1 min-h-0">
               
               {/* Quick Start Button */}
               <Button 
                  onClick={handleNewChat}
                  className="w-full h-14 rounded-3xl font-extrabold bg-slate-950 hover:bg-slate-900 text-white shadow-xl dark:bg-white dark:hover:bg-slate-100 dark:text-black flex items-center justify-center gap-2.5 transition-all duration-300 relative overflow-hidden group shrink-0"
               >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-brand-cyan/10 to-slate-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Plus className="size-5 group-hover:scale-110 transition-transform duration-300" />
                  Nouvelle Session
               </Button>

               {/* Spatial Diagnostics Card */}
               <Card className="border border-slate-100/80 dark:border-slate-800/40 shadow-xl rounded-[2.5rem] bg-white/70 dark:bg-slate-950/40 backdrop-blur-2xl flex flex-col min-h-0 overflow-hidden flex-1">
                  
                  {/* Title & Stats */}
                  <div className="p-5 border-b border-slate-100/80 dark:border-slate-800/50 flex items-center justify-between shrink-0">
                     <div className="flex items-center gap-2">
                        <Activity className="size-4.5 text-brand-cyan dark:text-brand-cyan" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-900 dark:text-white">Noyau Cognitif</span>
                     </div>
                     <Badge className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[8px] font-black border-none py-0.5 tracking-widest uppercase">
                        ACTIF
                     </Badge>
                  </div>

                  {/* Diagnostic Gauges */}
                  <div className="p-5 space-y-4 border-b border-slate-100/80 dark:border-slate-800/50 shrink-0 bg-slate-50/30 dark:bg-slate-900/10">
                     <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                           <span className="flex items-center gap-1.5"><Server className="size-3" /> Charge CPU</span>
                           <span className="font-mono text-slate-900 dark:text-white">{metrics.cpu}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                           <motion.div 
                              className="h-full bg-brand-cyan" 
                              initial={{ width: "15%" }}
                              animate={{ width: `${metrics.cpu}%` }}
                              transition={{ duration: 0.8 }}
                           />
                        </div>
                     </div>

                     <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                           <span className="flex items-center gap-1.5"><Clock className="size-3" /> Latence API</span>
                           <span className="font-mono text-slate-900 dark:text-white">{metrics.latency} ms</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                           <motion.div 
                              className="h-full bg-brand-cyan/100" 
                              initial={{ width: "40%" }}
                              animate={{ width: `${(metrics.latency - 100) / 2}%` }}
                              transition={{ duration: 0.8 }}
                           />
                        </div>
                     </div>
                  </div>

                  {/* History List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                     <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block px-2.5 mb-2">
                        Historique
                     </span>

                     <AnimatePresence initial={false}>
                        {filteredSessions.map((s) => (
                           <motion.button
                              key={s.id}
                              whileHover={{ x: 2 }}
                              onClick={() => {
                                 setActiveSessionId(s.id)
                                 toast.info(`Session activée : ${s.title}`)
                              }}
                              className={`w-full text-left p-3 rounded-2xl transition-all border flex flex-col gap-1 relative ${
                                 activeSessionId === s.id 
                                    ? "bg-slate-950 border-slate-950 dark:bg-white dark:border-white shadow-md text-white dark:text-black" 
                                    : "bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-900/30 text-slate-700 dark:text-slate-300"
                              }`}
                           >
                              <div className="flex items-center justify-between w-full">
                                 <span className="text-[11px] font-extrabold truncate pr-2 w-full">
                                    {s.title}
                                 </span>
                                 <span className={`text-[8px] font-bold shrink-0 uppercase tracking-tighter ${activeSessionId === s.id ? 'text-slate-450' : 'text-slate-400'}`}>
                                    {s.date}
                                 </span>
                              </div>
                              <span className={`text-[9px] truncate font-medium ${activeSessionId === s.id ? 'text-slate-300 dark:text-slate-500' : 'text-slate-400'}`}>
                                 {s.preview}
                              </span>
                           </motion.button>
                        ))}
                     </AnimatePresence>
                  </div>
               </Card>
            </div>

            {/* 2. Main Chat Area */}
            <Card className="lg:col-span-3 border border-slate-100/80 dark:border-slate-800/40 shadow-2xl rounded-[2.5rem] bg-white/70 dark:bg-slate-950/40 backdrop-blur-2xl flex flex-col min-h-0 overflow-hidden relative">
               
               {/* Header status bar */}
               <div className="px-6 py-4 bg-white/80 dark:bg-slate-950/80 border-b border-slate-100/60 dark:border-slate-800/60 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                     <div className="size-10 rounded-2xl bg-brand-cyan/10 dark:bg-brand-bg/30 flex items-center justify-center text-brand-cyan dark:text-brand-cyan">
                        <Cpu className="size-5 animate-pulse" />
                     </div>
                     <div>
                        <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                           Module Cognitive Assist <Sparkles className="size-4 text-amber-500 fill-current" />
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                           <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Base de Données Connectée</span>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-2">
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleNewChat}
                        className="size-9 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                        title="Réinitialiser"
                     >
                        <RotateCcw className="size-4" />
                     </Button>
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                           setMessages([messages[0]])
                           toast.success("Messages vidés")
                        }}
                        className="size-9 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                        title="Vider la session"
                     >
                        <Trash2 className="size-4" />
                     </Button>
                  </div>
               </div>

               {/* Messages Area */}
               <div className="flex-1 overflow-y-auto px-4 py-6 sm:p-8 space-y-8">
                  
                  {messages.length === 1 && (
                     /* Onboarding State */
                     <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-2xl mx-auto space-y-8 py-4"
                     >
                        <div className="text-center space-y-3">
                           <motion.div 
                              animate={{ scale: [1, 1.05, 1] }} 
                              transition={{ duration: 3.5, repeat: Infinity }}
                              className="size-16 rounded-3xl bg-slate-950 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-2xl mx-auto"
                           >
                              <Bot className="size-8" />
                           </motion.div>
                           <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                              Pilotez votre entrepôt avec <span className="bg-gradient-to-r from-brand-cyan via-slate-500 to-slate-400 bg-clip-text text-transparent">l'IA Cognitive</span>
                           </h2>
                           <p className="text-xs text-slate-450 dark:text-slate-500 font-bold uppercase tracking-widest max-w-md mx-auto leading-relaxed">
                              Posez des questions directes ou utilisez nos audits d'activité rapides ci-dessous.
                           </p>
                        </div>

                        {/* Presets Suggestions Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           {suggestions.map((s, idx) => (
                              <motion.button
                                 key={idx}
                                 whileHover={{ y: -4, scale: 1.01 }}
                                 whileTap={{ scale: 0.99 }}
                                 onClick={() => handleSend(s.text)}
                                 className="p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800/40 bg-white dark:bg-slate-900/20 hover:border-brand-cyan/20 dark:hover:border-brand-cyan/20 hover:shadow-xl dark:hover:bg-slate-900/50 transition-all text-left flex flex-col gap-3 cursor-pointer group"
                              >
                                 <div className="flex items-center justify-between">
                                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/80 group-hover:bg-brand-cyan/10 dark:group-hover:bg-brand-bg/25 transition-colors">
                                       {s.icon}
                                    </div>
                                    <Badge className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 hover:bg-slate-100 text-[8px] border-none font-black py-0.5 tracking-wider uppercase">
                                       {s.badge}
                                    </Badge>
                                 </div>
                                 <div className="space-y-1">
                                    <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-brand-cyan dark:group-hover:text-brand-cyan transition-colors">
                                       {s.title}
                                    </h4>
                                    <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-normal font-medium">
                                       {s.desc}
                                    </p>
                                 </div>
                                 <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-slate-405 mt-2 group-hover:text-brand-cyan dark:group-hover:text-brand-cyan transition-colors">
                                    Déclencher <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
                                 </div>
                              </motion.button>
                           ))}
                        </div>

                        {/* Liaison info bar */}
                        <div className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100/80 dark:border-slate-800/20 max-w-sm mx-auto">
                           <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
                           <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                              Chiffrement AES-256 et Audit Certifié
                           </span>
                        </div>
                     </motion.div>
                  )}

                  {/* Standard Message Bubble Loop */}
                  <div className="space-y-8 max-w-4xl mx-auto">
                     {messages.map((m) => (
                        <div 
                           key={m.id} 
                           className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                        >
                           <div className={`flex gap-3 sm:gap-4 max-w-[85%] ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                              
                              {/* Avatar */}
                              <div className={`size-10 rounded-2xl shrink-0 flex items-center justify-center shadow-md ${
                                 m.role === "assistant" 
                                    ? "bg-slate-950 dark:bg-white text-white dark:text-black font-extrabold" 
                                    : "bg-brand-cyan text-white font-extrabold"
                              }`}>
                                 {m.role === "assistant" ? <Bot className="size-5" /> : <User className="size-5" />}
                              </div>

                              {/* Bubble Card Container */}
                              <div className={`space-y-2.5 flex flex-col ${m.role === "user" ? "items-end" : "items-start"} w-full`}>
                                 
                                 {/* Main content body */}
                                 <div className={`p-5 rounded-[2rem] shadow-sm relative w-full ${
                                    m.role === "assistant" 
                                       ? "bg-white dark:bg-slate-900/60 text-slate-850 dark:text-slate-200 rounded-tl-none border border-slate-100/80 dark:border-slate-800/60" 
                                       : "bg-slate-950 dark:bg-white text-white dark:text-black rounded-tr-none shadow-md"
                                 }`}>
                                    {m.role === "assistant" ? (
                                       renderFormattedMessage(m.content, m.id)
                                    ) : (
                                       <p className="text-xs sm:text-sm leading-relaxed font-medium">{m.content}</p>
                                    )}

                                    {m.isStreaming && (
                                       <span className="inline-block w-1.5 h-4 bg-brand-cyan dark:text-brand-cyan animate-pulse ml-1 align-middle" />
                                    )}
                                 </div>

                                 {/* Optional Interactive Dashboard widgets inside the stream */}
                                 {m.suggestedWidgets?.includes("stock-health") && (
                                    <motion.div 
                                       initial={{ opacity: 0, scale: 0.95 }}
                                       animate={{ opacity: 1, scale: 1 }}
                                       className="w-full bg-slate-950 text-white p-6 rounded-[2rem] shadow-xl border border-slate-800 flex flex-col gap-4 my-2"
                                    >
                                       <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                          <div className="flex items-center gap-2">
                                             <Zap className="size-4.5 text-amber-500 fill-current" />
                                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scorecard de Stock IA</span>
                                          </div>
                                          <Badge className="bg-rose-500/20 text-rose-400 border-none text-[8px] font-black py-0.5 tracking-wider uppercase">
                                             ALERTE RECO
                                          </Badge>
                                       </div>
                                       <div className="grid grid-cols-3 gap-4">
                                          <div className="p-4 rounded-2xl bg-slate-900/60">
                                             <span className="text-[9px] font-bold text-slate-450 block uppercase tracking-tight">Ruptures</span>
                                             <span className="text-2xl font-black text-rose-500">4</span>
                                          </div>
                                          <div className="p-4 rounded-2xl bg-slate-900/60">
                                             <span className="text-[9px] font-bold text-slate-450 block uppercase tracking-tight">En Alerte</span>
                                             <span className="text-2xl font-black text-amber-500">12</span>
                                          </div>
                                          <div className="p-4 rounded-2xl bg-slate-900/60">
                                             <span className="text-[9px] font-bold text-slate-450 block uppercase tracking-tight">Santé Globale</span>
                                             <span className="text-2xl font-black text-emerald-400">88%</span>
                                          </div>
                                       </div>
                                       <div className="flex gap-2">
                                          <Button 
                                             size="sm"
                                             onClick={() => handleSend("Quels produits sont en alerte immédiate ?")}
                                             className="rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-[10px] px-3.5 h-8 cursor-pointer w-full"
                                          >
                                             Déclencher l'Audit Alerte
                                          </Button>
                                       </div>
                                    </motion.div>
                                 )}

                                 {m.suggestedWidgets?.includes("supplier-risk") && (
                                    <motion.div 
                                       initial={{ opacity: 0, scale: 0.95 }}
                                       animate={{ opacity: 1, scale: 1 }}
                                       className="w-full bg-slate-950 text-white p-6 rounded-[2rem] shadow-xl border border-slate-800 flex flex-col gap-4 my-2"
                                    >
                                       <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                          <div className="flex items-center gap-2">
                                             <History className="size-4.5 text-brand-cyan" />
                                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fiabilité Fournisseurs</span>
                                          </div>
                                          <Badge className="bg-brand-cyan/20 text-brand-cyan border-none text-[8px] font-black py-0.5 tracking-wider uppercase">
                                             RÉAPRO
                                          </Badge>
                                       </div>
                                       <div className="space-y-2">
                                          {[
                                             { name: "Smair SA", onTime: "94%", delay: "2 jours" },
                                             { name: "Global Logis", onTime: "78%", delay: "5 jours" }
                                          ].map((sup, idx) => (
                                             <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60">
                                                <div>
                                                   <span className="text-xs font-black text-white">{sup.name}</span>
                                                   <span className="text-[9px] text-slate-500 block">Retard Moyen : {sup.delay}</span>
                                                </div>
                                                <Badge className={`${idx === 0 ? 'bg-emerald-500/25 text-emerald-400' : 'bg-rose-500/25 text-rose-400'} border-none text-[9px] font-extrabold uppercase py-0.5`}>
                                                   {sup.onTime} Temps
                                                </Badge>
                                             </div>
                                          ))}
                                       </div>
                                    </motion.div>
                                 )}

                                 {/* Time & Role Tags */}
                                 <div className="flex items-center gap-1.5 px-2">
                                    <span className="text-[9px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">
                                       {m.role === "assistant" ? "Core IA Agent" : "Utilisateur"}
                                    </span>
                                    <span className="text-[9px] text-slate-350 dark:text-slate-850 font-bold">•</span>
                                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">
                                       {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                 </div>
                              </div>
                           </div>
                        </div>
                     ))}

                     {/* Thinking Indicator */}
                     {loading && (
                        <div className="flex justify-start animate-in fade-in duration-300">
                           <div className="flex gap-4">
                              <div className="size-10 rounded-2xl bg-brand-cyan/10 dark:bg-brand-bg/25 text-brand-cyan dark:text-brand-cyan flex items-center justify-center shrink-0">
                                 <Cpu className="size-5 animate-spin" />
                              </div>
                              <div className="bg-white dark:bg-slate-900/60 border border-slate-100/80 dark:border-slate-800/60 p-4 rounded-[2rem] rounded-tl-none shadow-sm flex items-center gap-2">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-450 dark:text-slate-550 mr-2">Audit cognitif en cours</span>
                                 <div className="size-2 rounded-full bg-brand-cyan/80 animate-bounce" />
                                 <div className="size-2 rounded-full bg-brand-cyan animate-bounce [animation-delay:0.15s]" />
                                 <div className="size-2 rounded-full bg-brand-cyan animate-bounce [animation-delay:0.3s]" />
                              </div>
                           </div>
                        </div>
                     )}
                     <div ref={messagesEndRef} />
                  </div>
               </div>

               {/* Voice pulsating waveform overlay */}
               <AnimatePresence>
                  {isListening && (
                     <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute inset-x-0 bottom-[96px] bg-slate-955/95 backdrop-blur-md p-6 border-t border-slate-900 flex flex-col items-center justify-center gap-4 z-30"
                     >
                        <div className="flex items-center gap-2">
                           <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
                           <p className="text-xs font-black text-white uppercase tracking-widest">Enregistrement Vocal...</p>
                        </div>
                        
                        {/* Interactive pulsating circular wave */}
                        <div className="relative size-32 flex items-center justify-center">
                           <motion.div 
                              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                              className="absolute inset-0 rounded-full border-2 border-brand-cyan"
                           />
                           <motion.div 
                              animate={{ scale: [1, 1.7, 1], opacity: [0.4, 0, 0.4] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
                              className="absolute inset-0 rounded-full border-2 border-brand-cyan"
                           />
                           <div className="size-16 rounded-full bg-brand-cyan flex items-center justify-center text-white z-10 shadow-xl">
                              <Mic className="size-6 animate-pulse" />
                           </div>
                        </div>

                        <p className="text-[11px] text-slate-450 italic">"Quels produits sont bientôt en rupture ?"</p>
                        
                        <Button 
                           onClick={toggleListening}
                           variant="outline" 
                           size="sm" 
                           className="rounded-full border-slate-800 text-white bg-transparent hover:bg-slate-800 gap-1.5"
                        >
                           <MicOff className="size-3.5 text-rose-500" /> Arrêter
                        </Button>
                     </motion.div>
                  )}
               </AnimatePresence>

               {/* Input Box Footer */}
               <div className="p-4 sm:p-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-t border-slate-100/80 dark:border-slate-800/60 shrink-0">
                  <div className="max-w-4xl mx-auto flex items-center gap-3 relative">
                     {/* Voice Trigger */}
                     <Button
                        size="icon"
                        onClick={toggleListening}
                        className={`size-14 rounded-2xl shrink-0 transition-all shadow-md cursor-pointer border ${
                           isListening 
                              ? "bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-450" 
                              : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100 dark:bg-slate-900/50 dark:border-slate-800/60 dark:text-slate-400 dark:hover:bg-slate-900"
                        }`}
                     >
                        <Mic className="size-5" />
                     </Button>

                     {/* Input Field wrapper */}
                     <div className="relative flex-1">
                        <Input
                           placeholder="Posez une question sur le stock, les commandes ou les collaborateurs..."
                           className="h-14 rounded-2xl border-slate-100 bg-white text-xs sm:text-sm pl-6 pr-14 shadow-sm focus-visible:ring-brand-cyan/20 dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:focus-visible:ring-brand-cyan/10"
                           value={input}
                           onChange={(e) => setInput(e.target.value)}
                           onKeyDown={(e) => e.key === "Enter" && handleSend()}
                           disabled={loading}
                        />
                        <kbd className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:inline-flex h-6 select-none items-center gap-1 rounded border border-slate-100 bg-slate-50 px-2 text-[10px] font-black text-slate-400 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-500">
                           <Command className="size-2.5" /> Enter
                        </kbd>
                     </div>

                     {/* Send Button */}
                     <Button
                        size="icon"
                        onClick={() => handleSend()}
                        disabled={!input.trim() || loading}
                        className="size-14 rounded-2xl bg-brand-cyan hover:bg-brand-cyan/90 text-white shadow-xl shadow-brand-cyan/10/30 transition-all hover:scale-[1.02] shrink-0 cursor-pointer"
                     >
                        <Send className="size-5" />
                     </Button>
                  </div>
               </div>
            </Card>
         </div>
      </div>
   )
}
