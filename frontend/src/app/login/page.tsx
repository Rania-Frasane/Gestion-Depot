"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Loader2, Eye, EyeOff, Mail, Lock, ArrowRight, Sun, Moon, Sparkles, AlertCircle, Box } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { DepotManagerLogo } from "@/components/Logo"

export default function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Default to light mode for crisp and clean interface
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
    if (!username.trim() || !password.trim()) {
      toast.error("Champs requis", { description: "Veuillez remplir tous les champs." })
      return
    }
    setLoading(true)
    try {
      await login({ username, password })
      toast.success("Authentification réussie", { description: "Ravi de vous revoir !" })
    } catch (err: any) {
      toast.error("Identifiants invalides", {
        description: "Vérifiez votre nom d'utilisateur et mot de passe."
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex transition-colors duration-500 overflow-hidden font-sans relative ${
      theme === 'dark' 
        ? 'bg-brand-bg text-brand-white selection:bg-brand-cyan/30' 
        : 'bg-brand-light-grey text-brand-dark-grey selection:bg-brand-cyan/20'
    }`}>
      
      {/* Decorative Aurora Gradients (Brand Style) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[160px] opacity-20 transition-colors duration-500 bg-brand-cyan/30`}
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className={`absolute bottom-[-20%] right-[-10%] w-[65%] h-[65%] rounded-full blur-[180px] opacity-15 transition-colors duration-500 bg-brand-cyan/20`}
        />
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className={`p-2.5 rounded-full border transition-all duration-300 cursor-pointer shadow-md backdrop-blur-md ${
            theme === 'dark' 
              ? 'border-brand-slate bg-brand-bg/60 text-yellow-400 hover:bg-brand-slate' 
              : 'border-brand-muted/80 bg-brand-white/80 text-brand-cyan hover:bg-brand-light-grey'
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

      {/* Left Form Panel */}
      <div className="w-full lg:w-[48%] flex flex-col justify-center px-6 sm:px-14 md:px-20 xl:px-28 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px] mx-auto space-y-8"
        >
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <DepotManagerLogo size="md" />
          </Link>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight font-serif leading-tight">Bon retour.</h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-brand-muted' : 'text-brand-dark-grey'}`}>Connectez-vous pour accéder à votre espace de gestion intelligent.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1 relative group">
              <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
                theme === 'dark' ? 'text-brand-muted group-focus-within:text-brand-cyan' : 'text-brand-slate group-focus-within:text-brand-cyan'
              }`}>
                <Mail className="size-5" />
              </div>
              <Input
                id="username"
                type="text"
                placeholder="Nom d'utilisateur ou email"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`h-13 pl-12 rounded-2xl border transition-all text-base ${
                  theme === 'dark'
                    ? 'bg-brand-bg/40 border-brand-slate text-brand-white placeholder:text-brand-muted focus-visible:ring-1 focus-visible:ring-brand-cyan focus-visible:border-brand-cyan'
                    : 'bg-brand-white border-brand-muted/80 text-brand-dark-grey placeholder:text-brand-muted focus-visible:ring-1 focus-visible:ring-brand-cyan focus-visible:border-brand-cyan shadow-sm'
                }`}
              />
            </div>

            <div className="space-y-1 relative group">
              <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
                theme === 'dark' ? 'text-brand-muted group-focus-within:text-brand-cyan' : 'text-brand-slate group-focus-within:text-brand-cyan'
              }`}>
                <Lock className="size-5" />
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`h-13 pl-12 pr-12 rounded-2xl border transition-all text-base ${
                  theme === 'dark'
                    ? 'bg-brand-bg/40 border-brand-slate text-brand-white placeholder:text-brand-muted focus-visible:ring-1 focus-visible:ring-brand-cyan focus-visible:border-brand-cyan'
                    : 'bg-brand-white border-brand-muted/80 text-brand-dark-grey placeholder:text-brand-muted focus-visible:ring-1 focus-visible:ring-brand-cyan focus-visible:border-brand-cyan shadow-sm'
                }`}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute inset-y-0 right-0 pr-4 flex items-center transition-colors ${
                  theme === 'dark' ? 'text-brand-muted hover:text-brand-white' : 'text-brand-slate hover:text-brand-dark-grey'
                }`}
              >
                 {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer group select-none">
                <input 
                  type="checkbox" 
                  className={`rounded transition-colors ${
                    theme === 'dark' 
                      ? 'border-brand-slate bg-brand-bg/50 text-brand-cyan focus:ring-offset-brand-bg' 
                      : 'border-brand-muted bg-brand-white text-brand-cyan focus:ring-offset-brand-white'
                  }`} 
                />
                <span className={theme === 'dark' ? 'text-brand-muted group-hover:text-brand-white' : 'text-brand-dark-grey group-hover:text-brand-white'}>Se souvenir de moi</span>
              </label>
              <Link href="/forgot-password" className="text-brand-cyan hover:text-brand-cyan/80 transition-colors">
                Mot de passe oublié ?
              </Link>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className={`w-full h-13 rounded-2xl font-bold text-base transition-all hover:scale-[1.01] active:scale-[0.99] mt-3 cursor-pointer ${
                theme === 'dark'
                  ? 'bg-brand-cyan text-brand-bg hover:bg-brand-cyan/90 shadow-lg shadow-brand-cyan/15'
                  : 'bg-brand-cyan text-brand-bg hover:bg-brand-cyan/90 shadow-sm'
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <span className="flex items-center gap-2">Se connecter <ArrowRight className="size-4.5" /></span>
              )}
            </Button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className={`w-full border-t ${theme === 'dark' ? 'border-brand-slate/60' : 'border-brand-muted/40'}`}></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
              <span className={`px-4 ${theme === 'dark' ? 'bg-brand-bg text-brand-muted' : 'bg-brand-light-grey text-brand-muted'}`}>Ou continuer avec</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <Button variant="outline" type="button" className={`h-12 rounded-xl font-bold text-xs transition-all ${
               theme === 'dark'
                 ? 'border-brand-slate bg-brand-bg/30 hover:bg-brand-slate text-brand-white'
                 : 'border-brand-muted bg-brand-white hover:bg-brand-light-grey text-brand-dark-grey shadow-sm'
             }`}>
                <svg className="mr-2 size-4.5" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg> GitHub
             </Button>
             <Button variant="outline" type="button" className={`h-12 rounded-xl font-bold text-xs transition-all ${
               theme === 'dark'
                 ? 'border-brand-slate bg-brand-bg/30 hover:bg-brand-slate text-brand-white'
                 : 'border-brand-muted bg-brand-white hover:bg-brand-light-grey text-brand-dark-grey shadow-sm'
             }`}>
                <svg className="mr-2 size-4.5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg> Google
             </Button>
          </div>

          <p className={`text-center text-xs font-semibold ${theme === 'dark' ? 'text-brand-muted' : 'text-brand-dark-grey'}`}>
            Vous n'avez pas de compte ? <Link href="/register" className="text-brand-cyan hover:text-brand-cyan/85 font-bold">Inscrivez-vous</Link>
          </p>
        </motion.div>
      </div>

      {/* Right Visual Panel - Premium illustration image split background */}
      <div className="hidden lg:flex w-[52%] relative p-6 items-center justify-center">
         <div className="w-full h-full rounded-[2.5rem] relative overflow-hidden flex flex-col justify-between p-12 group transition-colors duration-500 shadow-2xl border border-brand-slate/60">
            {/* The stunning depot manager illustration background image */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 group-hover:scale-105 z-0" 
              style={{ backgroundImage: `url('/depot_manager_illustration.png')` }}
            />
            {/* High-end glassmorphic dark cyber overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/70 to-brand-bg/40 z-10" />

            <div className="flex justify-between items-center relative z-20">
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-cyan/80">DEPOT MANAGER Platform</span>
              <span className="text-[10px] font-semibold flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-cyan/10 text-brand-cyan"><Sparkles size={11} /> Optimisation Active</span>
            </div>

            <div className="relative z-20 flex flex-col items-center justify-center my-auto py-12 max-w-lg mx-auto text-center space-y-6">
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="p-6 rounded-[2rem] border relative overflow-hidden aspect-[4/3] w-80 text-left shadow-2xl border-brand-slate/60 bg-brand-bg/85 backdrop-blur-md shadow-black/50"
              >
                <div className="flex items-center justify-between border-b border-brand-slate/40 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="size-7.5 rounded-lg bg-brand-cyan flex items-center justify-center text-brand-bg"><Box size={14} /></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black leading-none text-brand-white">Gestion de Stock</span>
                      <span className="text-[8px] text-brand-muted">Analyses IA</span>
                    </div>
                  </div>
                  <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-brand-cyan/10 text-brand-cyan">Live</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-brand-muted">Commandes IA :</span>
                    <span className="font-bold text-brand-white">34 En attente</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-brand-muted">Précision de Tri :</span>
                    <span className="text-emerald-400 font-bold">99.8%</span>
                  </div>
                  <div className="h-px bg-brand-slate/40 my-2" />
                  <div className="bg-brand-cyan/5 border border-brand-cyan/10 rounded-xl p-2.5 flex items-center justify-between">
                    <div>
                      <h4 className="text-[10px] font-black text-brand-cyan">Réapprovisionnement suggéré</h4>
                      <p className="text-[8px] text-brand-muted">Rupture sous 3 jours</p>
                    </div>
                    <ArrowRight className="size-4 text-brand-cyan" />
                  </div>
                </div>
              </motion.div>

              <h2 className="text-3xl font-black font-serif leading-tight text-brand-white">La logistique de demain.</h2>
              <p className="text-sm leading-relaxed text-brand-muted">
                Entrez dans l'ère de l'automatisation. Gérez vos équipes, suivez vos produits et anticipez vos flux grâce à l'intelligence artificielle intégrée.
              </p>
            </div>

            <div className="flex justify-between text-[9px] font-bold text-brand-muted relative z-20">
              <span>© {new Date().getFullYear()} DEPOT MANAGER</span>
              <span className="hover:text-brand-cyan cursor-pointer transition-colors">Politique de Confidentialité</span>
            </div>
         </div>
      </div>
    </div>
  )
}
