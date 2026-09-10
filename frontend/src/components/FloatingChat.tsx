"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Bot,
  X,
  Send,
  Cpu,
  Trash2,
  Zap,
  TrendingUp,
  Package,
  BarChart,
  AlertCircle,
  Users,
  ArrowLeftRight,
  Banknote,
  Activity,
  Bell,
  Sparkles,
  MessageSquare,
  Mic,
  Lock,
  ArrowRight
} from "lucide-react"
import { sendMessageToAi } from "@/lib/api"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isStreaming?: boolean
}

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Bonjour ! Je suis l'assistant IA de **DEPOT MANAGER**. Posez-moi des questions sur vos produits, stocks, ou fournisseurs !",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<number | undefined>(undefined)
  
  // Streaming Ref
  const streamingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (streamingIntervalRef.current) clearInterval(streamingIntervalRef.current)
    }
  }, [])

  // Word-by-word streaming effect
  const streamResponse = (fullText: string, msgId: string) => {
    let index = 0
    let currentText = ""
    
    setMessages(prev => 
      prev.map(m => m.id === msgId ? { ...m, content: "", isStreaming: true } : m)
    )

    if (streamingIntervalRef.current) clearInterval(streamingIntervalRef.current)

    streamingIntervalRef.current = setInterval(() => {
      if (index < fullText.length) {
        const chunk = fullText.substring(index, index + 3)
        currentText += chunk
        index += 3

        setMessages(prev =>
          prev.map(m => m.id === msgId ? { ...m, content: currentText } : m)
        )
      } else {
        if (streamingIntervalRef.current) clearInterval(streamingIntervalRef.current)
        setMessages(prev =>
          prev.map(m => m.id === msgId ? { ...m, isStreaming: false } : m)
        )
      }
    }, 10)
  }

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input
    if (!textToSend.trim() || loading) return

    const userMsgId = `user-${Date.now()}`
    const userMessage: Message = {
      id: userMsgId,
      role: "user",
      content: textToSend,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    if (!messageText) setInput("")
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

      if (data.session_id) setSessionId(data.session_id)
      setMessages(prev => [...prev, aiMessage])
      
      // Stream the response
      streamResponse(data.reply, aiMsgId)

    } catch (error: any) {
      toast.error("Erreur de connexion IA")
      setMessages(prev => [...prev, {
         id: `error-${Date.now()}`,
         role: "assistant",
         content: "Désolé, je rencontre des difficultés pour joindre le serveur cognitif. Assurez-vous que le backend Django est démarré.",
         timestamp: new Date()
      }])
    } finally {
      setLoading(false)
    }
  }

  const suggestions = [
    { text: "Produits en rupture ?", icon: <Package size={12} className="text-amber-500" /> },
    { text: "Commandes récentes ?", icon: <TrendingUp size={12} className="text-brand-cyan" /> },
    { text: "Problèmes de stock ?", icon: <AlertCircle size={12} className="text-rose-500" /> },
    { text: "Optimiser les coûts ?", icon: <BarChart size={12} className="text-emerald-500" /> },
  ]

  // Inline formatting helper for clean rendering of bold terms
  const formatText = (text: string) => {
     return text.split('**').map((chunk, index) => 
        index % 2 === 1 ? <strong key={index} className="font-extrabold text-slate-950 dark:text-white">{chunk}</strong> : chunk
     )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
      
      {/* Chat Window Container (Framer Motion Animation) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 26 }}
            className="w-[calc(100vw-3rem)] sm:w-[420px] h-[600px] max-h-[80vh] shadow-2xl rounded-[2.5rem] border overflow-hidden flex flex-col backdrop-blur-2xl bg-white/80 dark:bg-slate-950/80 border-slate-200/60 dark:border-slate-800/40 pointer-events-auto relative"
          >
            {/* Visual Glassmorphic Accent Orbs */}
            <div className="absolute -top-12 -left-12 size-32 rounded-full bg-brand-cyan/10 blur-xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 size-32 rounded-full bg-brand-cyan/10 blur-xl pointer-events-none" />

            {/* Visual Header Decoration */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-cyan via-slate-500 to-brand-cyan shrink-0" />

            {/* Header */}
            <div className="p-5 pt-7 border-b flex flex-row items-center justify-between shrink-0 bg-transparent border-slate-100 dark:border-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-brand-cyan/10 flex items-center justify-center text-brand-cyan shadow-inner">
                  <Bot size={20} className="animate-pulse" />
                </div>
                <div>
                  <p className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    DEPOT MANAGER <span className="text-blue-600 font-black">IA</span> <Sparkles size={12} className="text-amber-500 fill-current animate-spin-slow" />
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                     <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                     <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Cognition Active</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60 rounded-xl cursor-pointer" 
                  onClick={() => {
                    if (streamingIntervalRef.current) clearInterval(streamingIntervalRef.current)
                    setMessages([messages[0]])
                    setSessionId(undefined)
                    toast.success("Session réinitialisée")
                  }} 
                  title="Effacer l'historique"
                >
                  <Trash2 size={15} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 text-slate-400 hover:text-rose-600 dark:hover:text-rose-450 hover:bg-slate-100 dark:hover:bg-slate-900/60 rounded-xl cursor-pointer" 
                  onClick={() => setIsOpen(false)}
                >
                  <X size={16} />
                </Button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/10 dark:bg-slate-950/10">
              <ScrollArea className="flex-1 p-5">
                <div className="space-y-5">
                  {messages.map((m) => (
                    <motion.div 
                      key={m.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {m.role === "assistant" && (
                        <div className="size-8 rounded-xl border flex items-center justify-center shrink-0 mt-1 shadow-sm bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/40">
                          <Bot size={13} className="text-brand-cyan" />
                        </div>
                      )}
                      <div className={`max-w-[82%] p-4 rounded-[1.6rem] text-xs leading-relaxed ${
                        m.role === "assistant"
                          ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-250/50 dark:border-slate-800/40 shadow-sm"
                          : "bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-tr-none shadow-md"
                      }`}>
                        {formatText(m.content)}
                        {m.isStreaming && (
                          <span className="inline-block w-1 h-3.5 bg-brand-cyan animate-pulse ml-0.5" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {loading && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start gap-3"
                    >
                      <div className="size-8 rounded-xl border text-slate-400 flex items-center justify-center shrink-0 animate-pulse bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/40">
                        <Cpu size={13} className="animate-spin" />
                      </div>
                      <div className="p-4 rounded-[1.6rem] rounded-tl-none shadow-sm flex items-center gap-1.5 h-11 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40">
                        <div className="size-1.5 rounded-full bg-brand-cyan/80 animate-bounce" />
                        <div className="size-1.5 rounded-full bg-brand-cyan animate-bounce [animation-delay:0.15s]" />
                        <div className="size-1.5 rounded-full bg-brand-cyan animate-bounce [animation-delay:0.3s]" />
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Suggestions slider (Notion Command palette style) */}
              {!loading && (
                <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide shrink-0 border-t bg-white/50 dark:bg-slate-950/50 border-slate-100/80 dark:border-slate-900/50">
                  {suggestions.map((s, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSend(s.text)}
                      className="h-8.5 rounded-full border px-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer bg-slate-50 dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/50 text-slate-605 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850"
                    >
                      {s.icon}
                      {s.text}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div className="p-4 border-t bg-white/80 dark:bg-slate-950/80 border-slate-100/80 dark:border-slate-900/50">
              <div className="relative w-full flex items-center gap-2">
                <Input
                  placeholder="Posez votre question..."
                  className="h-12 rounded-2xl px-5 text-xs focus-visible:ring-0 focus-visible:border-slate-300 dark:focus-visible:border-slate-800 transition-all bg-slate-50 dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/50 text-slate-800 dark:text-white"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <Button
                  size="icon"
                  className="h-12 w-12 rounded-2xl shrink-0 transition-all cursor-pointer bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:scale-[1.02] shadow-md hover:bg-slate-900 dark:hover:bg-slate-100"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                >
                  <Send size={16} />
                </Button>
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-2.5 opacity-60">
                 <Lock size={10} className="text-slate-400" />
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Liaison Chiffrée Dépôt</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <div className="relative pointer-events-auto">
        <Button
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className={`relative h-15 w-15 rounded-[2rem] shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border ${
            isOpen 
              ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-850 dark:text-white" 
              : "bg-slate-950 dark:bg-white text-white dark:text-slate-950 border-transparent hover:shadow-brand-cyan/20"
          }`}
        >
          {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
          {!isOpen && (
            <div className="absolute top-0 right-0 h-4 w-4 bg-brand-cyan rounded-full border-[3px] border-white dark:border-slate-950 animate-ping-slow" />
          )}
        </Button>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 1; }
          70%, 100% { transform: scale(1.6); opacity: 0; }
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  )
}
