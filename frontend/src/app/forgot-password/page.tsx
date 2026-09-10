"use client"

import React, { useState, useEffect } from "react"
import { Box, Loader2, Mail, ArrowRight, ArrowLeft, Sun, Moon, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    document.documentElement.classList.remove('dark')
  }, [])

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error("Champ requis", { description: "Veuillez entrer votre adresse email." })
      return
    }
    setLoading(true)
    // Simulate reset link dispatching
    setTimeout(() => {
       toast.success("Lien de réinitialisation envoyé !", { description: "Consultez vos messages pour poursuivre." })
       setSuccess(true)
       setLoading(false)
    }, 1500)
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500 font-sans ${
      theme === 'dark' 
        ? 'bg-slate-950 text-white selection:bg-brand-cyan/30' 
        : 'bg-slate-50 text-slate-900 selection:bg-brand-cyan/20'
    }`}>
      
      {/* Decorative Aura Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[140px] opacity-20 transition-colors duration-500 ${
          theme === 'dark' ? 'bg-brand-cyan/30' : 'bg-brand-cyan/20'
        }`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[140px] opacity-20 transition-colors duration-500 ${
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
        className="w-full max-w-[450px] relative z-10"
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
                <h1 className="text-3xl font-black font-serif mb-2 tracking-tight text-center">Mot de passe oublié ?</h1>
                <p className={`mb-8 text-center text-xs font-semibold leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Entrez votre adresse email et nous vous enverrons un lien sécurisé pour réinitialiser votre mot de passe.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                   <div className="space-y-1 relative group">
                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
                      theme === 'dark' ? 'text-slate-500 group-focus-within:text-brand-cyan' : 'text-slate-400 group-focus-within:text-brand-cyan'
                    }`}>
                       <Mail className="size-5" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Adresse email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`h-13 pl-12 rounded-2xl border transition-all text-base ${
                        theme === 'dark'
                          ? 'bg-slate-900/40 border-slate-800 text-white placeholder:text-slate-550 focus-visible:ring-1 focus-visible:ring-brand-cyan focus-visible:border-brand-cyan'
                          : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-brand-cyan focus-visible:border-brand-cyan shadow-sm'
                      }`}
                    />
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
                      <span className="flex items-center gap-2">Envoyer le lien <ArrowRight className="size-4.5" /></span>
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
                  theme === 'dark' ? 'bg-brand-cyan/10 text-brand-cyan' : 'bg-brand-cyan/10 text-brand-cyan shadow-sm'
                }`}>
                   <Mail className="size-8" />
                </div>
                <h2 className="text-2xl font-black font-serif mb-3">Vérifiez votre boîte mail</h2>
                <p className={`text-xs font-semibold leading-relaxed mb-8 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Un lien sécurisé de réinitialisation a été envoyé à l'adresse **{email}**.
                </p>
                <Button 
                    onClick={() => setSuccess(false)}
                    variant="outline"
                    className={`w-full h-13 rounded-2xl font-bold transition-all text-xs ${
                      theme === 'dark'
                        ? 'border-slate-850 bg-slate-900/30 text-white hover:bg-slate-900'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-sm'
                    }`}
                  >
                    Essayer avec une autre adresse
                </Button>
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
    </div>
  )
}
