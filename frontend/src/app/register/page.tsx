"use client"

import React, { useState, useEffect } from "react"
import { Loader2, Eye, EyeOff, Mail, Lock, User, ArrowRight, Building, Sun, Moon, Sparkles, Box } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { DepotManagerLogo } from "@/components/Logo"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
     company: "",
     name: "",
     email: "",
     password: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
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
    if (!formData.company.trim() || !formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast.error("Formulaire incomplet", { description: "Veuillez remplir tous les champs obligatoires." })
      return
    }
    setLoading(true)
    // Simulate fully functional auth registration
    setTimeout(() => {
       toast.success("Compte créé avec succès !", { description: "Bienvenue dans l'aventure eDepot Manager." })
       setLoading(false)
       window.location.href = "/dashboard"
    }, 1500)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  return (
    <div className={`min-h-screen flex transition-colors duration-500 overflow-hidden font-sans relative ${
      theme === 'dark' 
        ? 'bg-brand-bg text-brand-white selection:bg-brand-cyan/30' 
        : 'bg-brand-light-grey text-brand-dark-grey selection:bg-brand-cyan/20'
    }`}>
      
      {/* Aurora floating gradient lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-25%] right-[-15%] w-[65%] h-[65%] rounded-full blur-[170px] opacity-20 transition-colors duration-500 bg-brand-cyan/30"
        />
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-25%] left-[-15%] w-[60%] h-[60%] rounded-full blur-[150px] opacity-15 transition-colors duration-500 bg-brand-cyan/20"
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

      {/* Left Visual Panel - Premium Illustration split background */}
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
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-cyan/85">DEPOT MANAGER Platform</span>
              <span className="text-[10px] font-semibold flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-cyan/10 text-brand-cyan"><Sparkles size={11} /> Config. Rapide</span>
            </div>

            <div className="relative z-20 flex flex-col items-center justify-center my-auto py-12 max-w-lg mx-auto text-center space-y-6">
              <div className="grid grid-cols-2 gap-4 text-left w-full mb-4">
                <div className="p-5 rounded-2xl border transition-colors duration-500 border-brand-slate/60 bg-brand-bg/80 shadow-sm">
                  <div className="text-4xl font-serif font-black text-brand-cyan mb-1">99.9%</div>
                  <div className="text-[9px] uppercase tracking-widest font-black text-brand-muted">Précision IA</div>
                </div>
                <div className="p-5 rounded-2xl border transition-colors duration-500 border-brand-slate/60 bg-brand-bg/80 shadow-sm">
                  <div className="text-4xl font-serif font-black text-brand-cyan mb-1">&lt; 1 jour</div>
                  <div className="text-[9px] uppercase tracking-widest font-black text-brand-muted">Intégration</div>
                </div>
              </div>

              <h2 className="text-3xl font-black font-serif leading-tight text-brand-white">Commencez l'aventure.</h2>
              <p className="text-sm leading-relaxed text-brand-muted">
                Plus de 10 000 gestionnaires logistiques dans le monde utilisent DEPOT MANAGER pour automatiser leurs opérations, optimiser les stocks et dynamiser leurs ventes.
              </p>
            </div>

            <div className="flex justify-between text-[9px] font-bold text-brand-muted relative z-20">
              <span>© {new Date().getFullYear()} DEPOT MANAGER</span>
              <span className="hover:text-brand-cyan cursor-pointer transition-colors">Politique de Confidentialité</span>
            </div>
         </div>
      </div>

      {/* Right Form Panel */}
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
            <h1 className="text-4xl font-black tracking-tight font-serif leading-tight">Créer un compte.</h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-brand-muted' : 'text-brand-dark-grey'}`}>Rejoignez-nous gratuitement et configurez votre premier entrepôt.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1 relative group">
              <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
                theme === 'dark' ? 'text-brand-muted group-focus-within:text-brand-cyan' : 'text-brand-slate group-focus-within:text-brand-cyan'
              }`}>
                <Building className="size-5" />
              </div>
              <Input
                id="company"
                type="text"
                placeholder="Nom de l'entreprise"
                required
                value={formData.company}
                onChange={handleChange}
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
                <User className="size-5" />
              </div>
              <Input
                id="name"
                type="text"
                placeholder="Nom complet"
                required
                value={formData.name}
                onChange={handleChange}
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
                <Mail className="size-5" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="Adresse email"
                required
                value={formData.email}
                onChange={handleChange}
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
                value={formData.password}
                onChange={handleChange}
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
                <span className="flex items-center gap-2">S'inscrire <ArrowRight className="size-4.5" /></span>
              )}
            </Button>
          </form>

          <p className={`text-center text-xs font-semibold ${theme === 'dark' ? 'text-brand-muted' : 'text-brand-dark-grey'}`}>
            Vous avez déjà un compte ? <Link href="/login" className="text-brand-cyan hover:text-brand-cyan/85 font-bold">Connectez-vous</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
