"use client"

import React, { useState, useEffect, useRef } from "react"
import { Box, Loader2, ArrowRight, ArrowLeft, Sun, Moon, Sparkles, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export default function EmailVerificationPage() {
  const [code, setCode] = useState<string[]>(Array(6).fill(""))
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [timer, setTimer] = useState(59)
  const [canResend, setCanResend] = useState(false)
  
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    document.documentElement.classList.remove('dark')
  }, [])

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setCanResend(true)
    }
  }, [timer])

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      if (next === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return next
    })
  }

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Only allow numbers
    
    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)

    // Focus next input
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handleResend = () => {
    if (!canResend) return
    setTimer(59)
    setCanResend(false)
    toast.success("Nouveau code envoyé !", { description: "Veuillez consulter votre boîte de réception." })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fullCode = code.join("")
    if (fullCode.length < 6) {
      toast.error("Code incomplet", { description: "Veuillez saisir les 6 chiffres du code de vérification." })
      return
    }
    
    setLoading(true)
    // Simulate API call for code verification
    setTimeout(() => {
      if (fullCode === "123456" || fullCode.length === 6) { // allow any 6 digits for testing
        toast.success("Compte vérifié !", { description: "Votre adresse email a été confirmée avec succès." })
        setSuccess(true)
        setTimeout(() => {
          window.location.href = "/dashboard"
        }, 1500)
      } else {
        toast.error("Code erroné", { description: "Le code saisi est invalide ou expiré." })
      }
      setLoading(false)
    }, 1500)
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500 font-sans ${
      theme === 'dark' 
        ? 'bg-slate-950 text-white selection:bg-brand-cyan/30' 
        : 'bg-slate-50 text-slate-900 selection:bg-brand-cyan/20'
    }`}>
      
      {/* Aurora floating gradient lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[140px] opacity-20 transition-colors duration-500 ${
          theme === 'dark' ? 'bg-brand-cyan/30' : 'bg-brand-cyan/20'
        }`} />
        <div className={`absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[140px] opacity-15 transition-colors duration-500 ${
          theme === 'dark' ? 'bg-brand-cyan/20' : 'bg-brand-cyan/10'
        }`} />
      </div>

      {/* Floating Theme Switcher */}
      <div className="absolute top-6 right-6 z-50">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className={`p-2.5 rounded-full border transition-all duration-300 cursor-pointer shadow-md backdrop-blur-md ${
            theme === 'dark' 
              ? 'border-slate-800 bg-slate-900/60 text-yellow-400 hover:bg-slate-800' 
              : 'border-slate-200/80 bg-white/80 text-brand-cyan hover:bg-slate-50'
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {theme === 'dark' ? (
              <motion.div key="sun" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                <Sun className="size-5" />
              </motion.div>
            ) : (
              <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                <Moon className="size-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[460px] relative z-10"
      >
        <div className="flex justify-center mb-8">
           <Link href="/" className="inline-flex items-center gap-2 group">
             <div className="size-10 rounded-xl bg-brand-cyan flex items-center justify-center shadow-lg shadow-brand-cyan/25 text-brand-bg">
               <Box className="size-5" />
             </div>
           </Link>
        </div>

        <div className={`border rounded-[2rem] p-8 md:p-10 shadow-2xl backdrop-blur-xl transition-colors duration-500 ${
          theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200/80 shadow-brand-cyan/10'
        }`}>
          {!success ? (
             <>
                <h1 className="text-3xl font-black font-serif mb-2 tracking-tight text-center">Vérification de l'email</h1>
                <p className={`mb-8 text-center text-xs font-semibold leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Veuillez saisir le code de validation à 6 chiffres envoyé à votre adresse de messagerie.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Code input grid */}
                  <div className="grid grid-cols-6 gap-2">
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength={1}
                        value={digit}
                        ref={(el) => { inputsRef.current[index] = el }}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className={`h-12 text-center text-xl font-bold rounded-xl border transition-all ${
                          theme === 'dark'
                            ? 'bg-slate-900/40 border-slate-800 text-white focus:ring-1 focus:ring-brand-cyan focus:border-brand-cyan'
                            : 'bg-white border-slate-200 text-slate-900 focus:ring-1 focus:ring-brand-cyan focus:border-brand-cyan shadow-sm'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}>
                      Pas reçu ?
                    </span>
                    <button
                      type="button"
                      disabled={!canResend}
                      onClick={handleResend}
                      className={`transition-colors cursor-pointer ${
                        canResend
                          ? 'text-brand-cyan hover:text-brand-cyan/80'
                          : theme === 'dark' ? 'text-slate-600' : 'text-slate-400'
                      }`}
                    >
                      {canResend ? "Renvoyer le code" : `Renvoyer dans ${timer}s`}
                    </button>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full h-13 rounded-2xl font-bold text-base transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-white text-black hover:bg-slate-100'
                        : 'bg-black text-white hover:bg-slate-850 shadow-sm'
                    }`}
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <span className="flex items-center gap-2">Confirmer le code <ArrowRight className="size-4.5" /></span>
                    )}
                  </Button>
                </form>
             </>
          ) : (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="text-center py-4"
             >
                <div className={`size-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
                  theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600 shadow-sm'
                }`}>
                   <CheckCircle2 className="size-8" />
                </div>
                <h2 className="text-2xl font-black font-serif mb-3">Vérification réussie !</h2>
                <p className={`text-xs font-semibold leading-relaxed mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Votre adresse email a été validée. Redirection vers votre tableau de bord...
                </p>
                <div className="h-1 w-24 bg-slate-800 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full animate-progress" />
                </div>
             </motion.div>
          )}

          <div className={`mt-8 pt-6 border-t text-center ${theme === 'dark' ? 'border-slate-850' : 'border-slate-150'}`}>
             <Link href="/login" className={`inline-flex items-center text-xs font-semibold hover:text-brand-cyan transition-colors ${
               theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
             }`}>
                <ArrowLeft className="mr-2 size-4.5" /> Retour à la connexion
             </Link>
          </div>
        </div>
      </motion.div>
      
      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 1.5s linear forwards;
        }
      `}</style>
    </div>
  )
}
